// =============================================
// Supabase Configuration
// =============================================

const SUPABASE_URL = 'https://klcceivyqgqbpjdwlnvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2NlaXZ5cWdxYnBqZHdsbnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTcxODksImV4cCI6MjA4MDc5MzE4OX0.9HKAkGF_gQeUi8eJOSPMmcsMG3IZeOnagwJU0bB_TjM';

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// 사용자 관리 함수
// =============================================

// 닉네임 중복 체크
async function checkNicknameExists(nickname) {
    const { data, error } = await supabase
        .rpc('check_nickname_exists', { check_nickname: nickname });

    if (error) {
        console.error('닉네임 체크 오류:', error);
        return null;
    }
    return data; // true = 중복, false = 사용 가능
}

// 로그인 또는 회원가입
async function loginOrCreate(nickname) {
    const { data, error } = await supabase
        .rpc('login_or_create', { input_nickname: nickname });

    if (error) {
        console.error('로그인 오류:', error);
        return null;
    }

    // 세션 저장
    sessionStorage.setItem('userId', data);
    sessionStorage.setItem('nickname', nickname);

    return data; // user_id 반환
}

// 현재 로그인된 사용자 정보
function getCurrentUser() {
    return {
        userId: sessionStorage.getItem('userId'),
        nickname: sessionStorage.getItem('nickname')
    };
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('nickname');
}

// 로그인 여부 확인
function isLoggedIn() {
    return !!sessionStorage.getItem('userId');
}

// =============================================
// 예매 기록 함수
// =============================================

// 예매 기록 저장 (같은 유저+카테고리+난이도면 업데이트)
async function saveBookingRecord(category, difficulty, elapsedTime, selectionData = null) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('로그인이 필요합니다');
        return null;
    }

    // 카테고리/난이도 한글 변환
    const categoryMap = {
        'concert': '콘서트', 'goods': '굿즈', 'restaurant': '식당',
        '콘서트': '콘서트', '굿즈': '굿즈', '식당': '식당'
    };
    const difficultyMap = {
        'easy': '쉬움', 'normal': '보통', 'hard': '어려움',
        '쉬움': '쉬움', '보통': '보통', '어려움': '어려움'
    };
    const catKorean = categoryMap[category] || category;
    const diffKorean = difficultyMap[difficulty] || difficulty;

    try {
        // 먼저 기존 기록이 있는지 확인 (.single() 대신 .maybeSingle() 사용)
        const { data: existing, error: findError } = await supabase
            .from('booking_records')
            .select('id')
            .eq('user_id', userId)
            .eq('category', catKorean)
            .eq('difficulty', diffKorean)
            .maybeSingle();

        if (findError) {
            console.error('기존 기록 조회 오류:', findError);
        }

        if (existing && existing.id) {
            // 기존 기록이 있으면 업데이트
            const { data, error } = await supabase
                .from('booking_records')
                .update({
                    elapsed_time: elapsedTime,
                    selection_data: selectionData,
                    created_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select();

            if (error) {
                console.error('기록 업데이트 오류:', error);
                return null;
            }
            return data && data[0] ? data[0].id : existing.id;
        } else {
            // 기존 기록이 없으면 새로 삽입
            const { data, error } = await supabase
                .from('booking_records')
                .insert({
                    user_id: userId,
                    category: catKorean,
                    difficulty: diffKorean,
                    elapsed_time: elapsedTime,
                    selection_data: selectionData
                })
                .select();

            if (error) {
                console.error('기록 저장 오류:', error);
                return null;
            }
            return data && data[0] ? data[0].id : true;
        }
    } catch (err) {
        console.error('기록 저장 예외:', err);
        return null;
    }
}

// 내 기록 조회
async function getMyRecords(limit = 10) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return [];

    const { data, error } = await supabase
        .from('booking_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('기록 조회 오류:', error);
        return [];
    }
    return data;
}

// 내 최고 기록 조회
async function getMyBestRecords() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return [];

    const { data, error } = await supabase
        .from('personal_best')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('최고 기록 조회 오류:', error);
        return [];
    }
    return data;
}

// =============================================
// 랭킹 함수
// =============================================

// 카테고리/난이도별 랭킹 조회
async function getRanking(category, difficulty, limit = 10) {
    // 카테고리 영어→한글 변환
    const categoryMap = {
        'concert': '콘서트', 'goods': '굿즈', 'restaurant': '식당',
        '콘서트': '콘서트', '굿즈': '굿즈', '식당': '식당'
    };
    // 난이도 영어→한글 변환
    const difficultyMap = {
        'easy': '쉬움', 'normal': '보통', 'hard': '어려움',
        '쉬움': '쉬움', '보통': '보통', '어려움': '어려움'
    };

    const catKorean = categoryMap[category] || category;
    const diffKorean = difficultyMap[difficulty] || difficulty;

    const { data, error } = await supabase
        .from('booking_records')
        .select(`
            id,
            user_id,
            category,
            difficulty,
            elapsed_time,
            created_at,
            users!inner(nickname)
        `)
        .eq('category', catKorean)
        .eq('difficulty', diffKorean)
        .order('elapsed_time', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('랭킹 조회 오류:', error);
        return [];
    }

    // 데이터 변환
    return data.map(item => ({
        ...item,
        nickname: item.users?.nickname || '알 수 없음'
    }));
}

// 전체 통합 랭킹 (유저별 요약)
async function getOverallRanking(limit = 10) {
    const { data, error } = await supabase
        .rpc('get_overall_ranking', { p_limit: limit });

    if (error) {
        console.error('전체 랭킹 조회 오류:', error);
        return [];
    }
    return data;
}

// 전체 기록 조회 (카테고리/난이도 포함)
async function getAllRecords(limit = 50) {
    const { data, error } = await supabase
        .from('booking_records')
        .select(`
            id,
            user_id,
            category,
            difficulty,
            elapsed_time,
            created_at,
            users!inner(nickname)
        `)
        .order('elapsed_time', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('전체 기록 조회 오류:', error);
        return [];
    }

    // 데이터 변환
    return data.map(item => ({
        ...item,
        nickname: item.users?.nickname || '알 수 없음'
    }));
}

// =============================================
// 채팅 함수
// =============================================

// 채팅방 목록 조회
async function getChatRooms() {
    const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('채팅방 조회 오류:', error);
        return [];
    }
    return data;
}

// 채팅 메시지 조회
async function getChatMessages(roomId, limit = 50) {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('메시지 조회 오류:', error);
        return [];
    }
    return data;
}

// 메시지 전송
async function sendMessage(roomId, message) {
    const userId = sessionStorage.getItem('userId');
    const nickname = sessionStorage.getItem('nickname');

    if (!userId || !nickname) {
        console.error('로그인이 필요합니다');
        return null;
    }

    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            room_id: roomId,
            user_id: userId,
            nickname: nickname,
            message: message
        })
        .select()
        .single();

    if (error) {
        console.error('메시지 전송 오류:', error);
        return null;
    }
    return data;
}

// 실시간 채팅 구독
function subscribeToChatRoom(roomId, onMessage) {
    const channel = supabase
        .channel(`chat-room-${roomId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`
            },
            (payload) => {
                onMessage(payload.new);
            }
        )
        .subscribe();

    return channel; // 구독 해제할 때 사용
}

// 채팅 구독 해제
function unsubscribeFromChat(channel) {
    if (channel) {
        supabase.removeChannel(channel);
    }
}

// 채팅방 참여
async function joinChatRoom(roomId) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return null;

    const { data, error } = await supabase
        .from('chat_participants')
        .upsert({
            room_id: roomId,
            user_id: userId
        })
        .select()
        .single();

    if (error) {
        console.error('채팅방 참여 오류:', error);
        return null;
    }
    return data;
}

// 채팅방 나가기
async function leaveChatRoom(roomId) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
}

// =============================================
// 유틸리티 함수
// =============================================

// 시간 포맷 (밀리초 → MM:SS.ms)
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
}

// 시간 포맷 (밀리초 → MM:SS)
function formatTimeSimple(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

console.log('Supabase 연결 완료!');
