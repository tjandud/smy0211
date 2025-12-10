// =============================================
// Friend Battle System - 친구 대결 시스템
// Supabase Realtime 기반
// =============================================

// 게임 이벤트 타입
const GAME_EVENTS = {
    PLAYER_JOIN: 'player_join',
    PLAYER_READY: 'player_ready',
    PLAYER_LEAVE: 'player_leave',
    GAME_START: 'game_start',
    PROGRESS_UPDATE: 'progress_update',
    GAME_FINISH: 'game_finish',
    CHAT_MESSAGE: 'chat_message',
    COUNTDOWN: 'countdown',
    SYNC_REQUEST: 'sync_request',
    SYNC_RESPONSE: 'sync_response'
};

// 게임 룸 클래스
class GameRoom {
    constructor() {
        this.roomId = null;
        this.roomCode = null;
        this.isHost = false;
        this.channel = null;
        this.participants = new Map();
        this.gameState = 'waiting'; // waiting, countdown, playing, finished
        this.gameSettings = null;

        this.userId = sessionStorage.getItem('userId');
        this.nickname = sessionStorage.getItem('nickname');

        // 콜백 함수들
        this.onPlayerJoin = null;
        this.onPlayerReady = null;
        this.onPlayerLeave = null;
        this.onGameStart = null;
        this.onProgressUpdate = null;
        this.onGameFinish = null;
        this.onChatMessage = null;
        this.onCountdown = null;
        this.onError = null;
        this.onSync = null;
    }

    // ==========================================
    // 방 생성 (호스트)
    // ==========================================
    async createRoom(gameType, difficulty) {
        if (!this.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        // 6자리 방 코드 생성
        this.roomCode = this.generateRoomCode();
        this.isHost = true;

        this.gameSettings = {
            gameType: gameType,
            difficulty: difficulty,
            totalSteps: 5,
            maxPlayers: 2
        };

        // 실시간 채널 생성 및 구독
        await this.subscribeToRoom();

        // 호스트 정보 추가
        this.participants.set(this.userId, {
            odescribe: this.userId,
            nickname: this.nickname,
            isHost: true,
            isReady: true,
            progress: 0,
            finishTime: null
        });

        // 세션에 방 정보 저장 (두 가지 키 모두 저장 - 호환성)
        sessionStorage.setItem('battle_roomCode', this.roomCode);
        sessionStorage.setItem('battle_isHost', 'true');
        sessionStorage.setItem('battle_settings', JSON.stringify(this.gameSettings));
        // friend-lobby.html과 호환되는 키
        sessionStorage.setItem('friend_battle_roomCode', this.roomCode);
        sessionStorage.setItem('friend_battle_isHost', 'true');
        sessionStorage.setItem('friend_battle_settings', JSON.stringify(this.gameSettings));

        return {
            roomCode: this.roomCode,
            settings: this.gameSettings
        };
    }

    // ==========================================
    // 방 참가 (게스트)
    // ==========================================
    async joinRoom(roomCode) {
        if (!this.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        this.roomCode = roomCode.toUpperCase();

        // 세션에서 호스트 여부 확인 (두 가지 키 모두 확인)
        const savedRoomCode = sessionStorage.getItem('battle_roomCode') || sessionStorage.getItem('friend_battle_roomCode');
        const savedIsHost = sessionStorage.getItem('battle_isHost') || sessionStorage.getItem('friend_battle_isHost');

        // 세션에서 게임 설정 복원
        const savedSettings = sessionStorage.getItem('battle_settings') || sessionStorage.getItem('friend_battle_settings');
        if (savedSettings) {
            this.gameSettings = JSON.parse(savedSettings);
        }

        if (savedRoomCode === this.roomCode && savedIsHost === 'true') {
            this.isHost = true;
        } else {
            this.isHost = false;
        }

        // 실시간 채널 구독
        await this.subscribeToRoom();

        // 참가 정보 추가
        this.participants.set(this.userId, {
            odescribe: this.userId,
            nickname: this.nickname,
            isHost: this.isHost,
            isReady: this.isHost, // 호스트는 자동 준비 완료
            progress: 0,
            finishTime: null
        });

        // 세션에 방 정보 저장
        if (!this.isHost) {
            sessionStorage.setItem('battle_roomCode', this.roomCode);
            sessionStorage.setItem('battle_isHost', 'false');
            sessionStorage.setItem('friend_battle_roomCode', this.roomCode);
            sessionStorage.setItem('friend_battle_isHost', 'false');
        }

        // 참가 브로드캐스트
        this.broadcast(GAME_EVENTS.PLAYER_JOIN, {
            odescribe: this.userId,
            nickname: this.nickname,
            isHost: this.isHost
        });

        // 동기화 요청 (다른 참가자 정보 받기)
        setTimeout(() => {
            this.broadcast(GAME_EVENTS.SYNC_REQUEST, {
                odescribe: this.userId,
                nickname: this.nickname
            });
        }, 500);

        return true;
    }

    // ==========================================
    // 실시간 채널 구독
    // ==========================================
    async subscribeToRoom() {
        const channelName = `game-room-${this.roomCode}`;

        // 기존 채널이 있으면 제거
        if (this.channel) {
            await supabase.removeChannel(this.channel);
        }

        this.channel = supabase.channel(channelName, {
            config: {
                broadcast: { self: true }
            }
        });

        // 브로드캐스트 이벤트 수신
        this.channel.on('broadcast', { event: '*' }, (payload) => {
            this.handleBroadcast(payload);
        });

        // Presence 설정
        this.channel.on('presence', { event: 'sync' }, () => {
            this.handlePresenceSync();
        });

        this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('Presence join:', newPresences);
        });

        this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            this.handlePresenceLeave(leftPresences);
        });

        // 구독 시작
        return new Promise((resolve) => {
            this.channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Presence 트래킹
                    await this.channel.track({
                        odescribe: this.userId,
                        nickname: this.nickname,
                        isHost: this.isHost,
                        online_at: new Date().toISOString()
                    });
                    resolve(status);
                }
            });
        });
    }

    // ==========================================
    // 브로드캐스트 전송
    // ==========================================
    broadcast(event, payload) {
        if (!this.channel) {
            console.error('채널이 연결되지 않았습니다.');
            return;
        }

        this.channel.send({
            type: 'broadcast',
            event: event,
            payload: {
                ...payload,
                senderId: this.userId,
                timestamp: Date.now()
            }
        });
    }

    // ==========================================
    // 브로드캐스트 수신 처리
    // ==========================================
    handleBroadcast(payload) {
        const { event, payload: data } = payload;

        // 자신이 보낸 메시지인지 확인
        const isSelf = data.senderId === this.userId;

        switch (event) {
            case GAME_EVENTS.PLAYER_JOIN:
                if (!isSelf) {
                    this.participants.set(data.odescribe, {
                        odescribe: data.odescribe,
                        nickname: data.nickname,
                        isHost: data.isHost,
                        isReady: data.isHost, // 호스트는 자동 준비
                        progress: 0,
                        finishTime: null
                    });

                    // 호스트라면 게임 설정과 자신의 정보 공유
                    if (this.isHost && this.gameSettings) {
                        setTimeout(() => {
                            this.broadcast('game_settings', this.gameSettings);
                            // 호스트 정보도 다시 브로드캐스트
                            this.broadcast(GAME_EVENTS.SYNC_RESPONSE, {
                                odescribe: this.userId,
                                nickname: this.nickname,
                                isHost: true,
                                isReady: true
                            });
                        }, 300);
                    }
                }
                if (this.onPlayerJoin) this.onPlayerJoin(data);
                break;

            case GAME_EVENTS.SYNC_REQUEST:
                // 다른 사용자가 동기화 요청 → 내 정보 보내기
                if (!isSelf) {
                    const myInfo = this.participants.get(this.userId);
                    if (myInfo) {
                        this.broadcast(GAME_EVENTS.SYNC_RESPONSE, {
                            odescribe: this.userId,
                            nickname: this.nickname,
                            isHost: myInfo.isHost,
                            isReady: myInfo.isReady
                        });
                    }
                }
                break;

            case GAME_EVENTS.SYNC_RESPONSE:
                // 동기화 응답 받음 → 참가자 목록에 추가
                if (!isSelf) {
                    this.participants.set(data.odescribe, {
                        odescribe: data.odescribe,
                        nickname: data.nickname,
                        isHost: data.isHost,
                        isReady: data.isReady,
                        progress: 0,
                        finishTime: null
                    });
                    if (this.onSync) this.onSync(data);
                    if (this.onPlayerJoin) this.onPlayerJoin(data);
                }
                break;

            case 'game_settings':
                if (!this.isHost && !isSelf) {
                    this.gameSettings = data;
                    sessionStorage.setItem('battle_settings', JSON.stringify(data));
                }
                break;

            case GAME_EVENTS.PLAYER_READY:
                const participant = this.participants.get(data.odescribe);
                if (participant) {
                    participant.isReady = data.isReady;
                }
                if (this.onPlayerReady) this.onPlayerReady(data);
                break;

            case GAME_EVENTS.PLAYER_LEAVE:
                this.participants.delete(data.odescribe);
                if (this.onPlayerLeave) this.onPlayerLeave(data);
                break;

            case GAME_EVENTS.COUNTDOWN:
                if (this.onCountdown) this.onCountdown(data);
                break;

            case GAME_EVENTS.GAME_START:
                this.gameState = 'playing';
                if (this.onGameStart) this.onGameStart(data);
                break;

            case GAME_EVENTS.PROGRESS_UPDATE:
                if (!isSelf) {
                    const p = this.participants.get(data.odescribe);
                    if (p) {
                        p.progress = data.progress;
                        p.currentStep = data.currentStep;
                    }
                }
                if (this.onProgressUpdate) this.onProgressUpdate(data);
                break;

            case GAME_EVENTS.GAME_FINISH:
                const finisher = this.participants.get(data.odescribe);
                if (finisher) {
                    finisher.finishTime = data.finishTime;
                    finisher.progress = 100;
                }
                if (this.onGameFinish) this.onGameFinish(data);
                break;

            case GAME_EVENTS.CHAT_MESSAGE:
                if (this.onChatMessage) this.onChatMessage(data);
                break;
        }
    }

    // ==========================================
    // Presence 동기화
    // ==========================================
    handlePresenceSync() {
        const state = this.channel.presenceState();
        console.log('Presence sync:', state);

        // Presence 상태에서 참가자 정보 업데이트
        Object.values(state).forEach(presences => {
            presences.forEach(presence => {
                if (presence.odescribe && presence.odescribe !== this.userId) {
                    if (!this.participants.has(presence.odescribe)) {
                        this.participants.set(presence.odescribe, {
                            odescribe: presence.odescribe,
                            nickname: presence.nickname,
                            isHost: presence.isHost,
                            isReady: presence.isHost,
                            progress: 0,
                            finishTime: null
                        });
                    }
                }
            });
        });
    }

    // ==========================================
    // Presence 퇴장
    // ==========================================
    handlePresenceLeave(leftPresences) {
        leftPresences.forEach(presence => {
            if (presence.odescribe !== this.userId) {
                this.participants.delete(presence.odescribe);
                if (this.onPlayerLeave) {
                    this.onPlayerLeave({ odescribe: presence.odescribe, nickname: presence.nickname });
                }
            }
        });
    }

    // ==========================================
    // 준비 상태 변경
    // ==========================================
    setReady(isReady) {
        const participant = this.participants.get(this.userId);
        if (participant) {
            participant.isReady = isReady;
        }

        this.broadcast(GAME_EVENTS.PLAYER_READY, {
            odescribe: this.userId,
            nickname: this.nickname,
            isReady: isReady
        });
    }

    // ==========================================
    // 게임 시작 (호스트만)
    // ==========================================
    async startGame() {
        if (!this.isHost) {
            throw new Error('호스트만 게임을 시작할 수 있습니다.');
        }

        // 모든 플레이어 준비 확인
        const allReady = Array.from(this.participants.values()).every(p => p.isReady);
        if (!allReady) {
            throw new Error('모든 플레이어가 준비되지 않았습니다.');
        }

        if (this.participants.size < 2) {
            throw new Error('최소 2명의 플레이어가 필요합니다.');
        }

        // 카운트다운 시작
        this.gameState = 'countdown';

        for (let i = 3; i > 0; i--) {
            this.broadcast(GAME_EVENTS.COUNTDOWN, { count: i });
            await this.delay(1000);
        }

        // 게임 시작
        this.gameState = 'playing';
        this.broadcast(GAME_EVENTS.GAME_START, {
            startTime: Date.now(),
            settings: this.gameSettings
        });
    }

    // ==========================================
    // 진행 상황 업데이트
    // ==========================================
    updateProgress(progress, currentStep) {
        const participant = this.participants.get(this.userId);
        if (participant) {
            participant.progress = progress;
            participant.currentStep = currentStep;
        }

        this.broadcast(GAME_EVENTS.PROGRESS_UPDATE, {
            odescribe: this.userId,
            nickname: this.nickname,
            progress: progress,
            currentStep: currentStep
        });
    }

    // ==========================================
    // 게임 완료
    // ==========================================
    finishGame(finishTime) {
        const participant = this.participants.get(this.userId);
        if (participant) {
            participant.finishTime = finishTime;
            participant.progress = 100;
        }

        this.broadcast(GAME_EVENTS.GAME_FINISH, {
            odescribe: this.userId,
            nickname: this.nickname,
            finishTime: finishTime
        });
    }

    // ==========================================
    // 채팅 메시지 전송
    // ==========================================
    sendChat(message) {
        this.broadcast(GAME_EVENTS.CHAT_MESSAGE, {
            odescribe: this.userId,
            nickname: this.nickname,
            message: message
        });
    }

    // ==========================================
    // 방 나가기
    // ==========================================
    async leaveRoom() {
        this.broadcast(GAME_EVENTS.PLAYER_LEAVE, {
            odescribe: this.userId,
            nickname: this.nickname
        });

        if (this.channel) {
            await supabase.removeChannel(this.channel);
            this.channel = null;
        }

        this.participants.clear();
        this.roomCode = null;
        this.isHost = false;

        // 세션 정리
        sessionStorage.removeItem('battle_roomCode');
        sessionStorage.removeItem('battle_isHost');
        sessionStorage.removeItem('battle_settings');
    }

    // ==========================================
    // 유틸리티
    // ==========================================
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getParticipants() {
        return Array.from(this.participants.values());
    }

    getOpponent() {
        return Array.from(this.participants.values()).find(p => p.odescribe !== this.userId);
    }

    isAllReady() {
        if (this.participants.size < 2) return false;
        return Array.from(this.participants.values()).every(p => p.isReady);
    }
}

// 전역 export
window.GameRoom = GameRoom;
window.GAME_EVENTS = GAME_EVENTS;

console.log('Friend Battle System 로드 완료!');
