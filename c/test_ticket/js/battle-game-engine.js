// =============================================
// Battle Game Engine v2.1 - 강화된 티켓팅 대결 게임 엔진
// 접속 대기 게임 + 특수 이벤트 + AI 시각화
// =============================================

// 난이도별 설정
const DIFFICULTY_SETTINGS = {
    easy: {
        // 접속 게임 (서버 연결)
        connectionClicks: 15,        // 필요한 클릭 수
        connectionSpeed: 800,        // 게이지 감소 속도 (ms)
        connectionDecay: 3,          // 게이지 감소량

        // 대기열
        queueSize: 50,
        queueObstacles: 2,
        queueClicksNeeded: 8,

        // 보안문자
        captchaLength: 4,
        captchaNoise: 5,
        captchaTimeLimit: 20000,

        // 좌석 선택
        seatPreoccupied: 20,
        seatGrabSpeed: 2500,
        seatGrabCount: 1,
        seatClickRace: 3,

        // 특수 이벤트
        eventChance: 0.1,
        eventTypes: ['lag'],

        // AI 설정
        aiReactionTime: 400,
        aiAccuracy: 0.7
    },
    normal: {
        connectionClicks: 25,
        connectionSpeed: 600,
        connectionDecay: 5,

        queueSize: 150,
        queueObstacles: 4,
        queueClicksNeeded: 15,

        captchaLength: 5,
        captchaNoise: 80,
        captchaTimeLimit: 15000,

        seatPreoccupied: 45,
        seatGrabSpeed: 1500,
        seatGrabCount: 2,
        seatClickRace: 5,

        eventChance: 0.2,
        eventTypes: ['lag', 'refresh', 'captcha_retry'],

        aiReactionTime: 280,
        aiAccuracy: 0.85
    },
    hard: {
        connectionClicks: 40,
        connectionSpeed: 400,
        connectionDecay: 8,

        queueSize: 300,
        queueObstacles: 7,
        queueClicksNeeded: 25,

        captchaLength: 6,
        captchaNoise: 180,
        captchaTimeLimit: 10000,

        seatPreoccupied: 70,
        seatGrabSpeed: 800,
        seatGrabCount: 3,
        seatClickRace: 8,

        eventChance: 0.35,
        eventTypes: ['lag', 'refresh', 'captcha_retry', 'server_busy', 'queue_reset'],

        aiReactionTime: 180,
        aiAccuracy: 0.95
    }
};

// 게임 단계
const GAME_STEPS = {
    WAITING: 'waiting',
    CONNECTION: 'connection',  // 변경: timing -> connection
    QUEUE: 'queue',
    CAPTCHA: 'captcha',
    SEAT_SELECT: 'seat_select',
    PAYMENT: 'payment',
    FINISHED: 'finished'
};

// 특수 이벤트 정의
const SPECIAL_EVENTS = {
    lag: {
        name: '네트워크 지연',
        icon: '🌐',
        message: '네트워크가 불안정합니다...',
        duration: 1500,
        effect: 'freeze'
    },
    refresh: {
        name: '페이지 새로고침 필요',
        icon: '🔄',
        message: '페이지를 새로고침하세요!',
        duration: 0,
        effect: 'action_required',
        action: 'space'
    },
    captcha_retry: {
        name: '보안문자 만료',
        icon: '⏰',
        message: '보안문자가 만료되었습니다.',
        duration: 0,
        effect: 'captcha_reset'
    },
    server_busy: {
        name: '서버 과부하',
        icon: '🔥',
        message: '접속자가 많습니다. 대기 중...',
        duration: 2500,
        effect: 'progress_bar'
    },
    queue_reset: {
        name: '대기열 초기화',
        icon: '😱',
        message: '대기열이 초기화되었습니다!',
        duration: 0,
        effect: 'queue_penalty'
    }
};

// 장애물 정의
const QUEUE_OBSTACLES = [
    { type: 'ad_popup', name: '광고 팝업', icon: '📢', desc: '광고를 닫아주세요!', action: '닫기', penalty: 5 },
    { type: 'captcha_check', name: '봇 확인', icon: '🤖', desc: '사람임을 확인해주세요!', action: '확인', penalty: 10 },
    { type: 'network_lag', name: '네트워크 지연', icon: '🌐', desc: '연결이 불안정합니다!', action: '재연결', penalty: 8 },
    { type: 'session_check', name: '세션 만료', icon: '⏱️', desc: '세션을 갱신해주세요!', action: '갱신', penalty: 12 }
];

// 대결 게임 엔진 클래스
class BattleGameEngine {
    constructor(options = {}) {
        this.difficulty = options.difficulty || 'normal';
        this.settings = DIFFICULTY_SETTINGS[this.difficulty];
        this.gameType = options.gameType || 'concert';

        this.currentStep = GAME_STEPS.WAITING;
        this.stepProgress = 0;
        this.totalSteps = 5;
        this.startTime = null;
        this.stepStartTime = null;
        this.finishTime = null;
        this.isRunning = false;
        this.isPaused = false;

        // 각 단계별 데이터
        this.connectionData = {
            gauge: 0,
            clicks: 0,
            maxGauge: 100
        };
        this.queueData = {
            position: 0,
            clicks: 0,
            obstacles: [],
            currentObstacle: null,
            streak: 1
        };
        this.captchaData = {
            answer: '',
            attempts: 0,
            timeLeft: 0
        };
        this.seatData = {
            selectedSeat: null,
            availableSeats: [],
            soldSeats: [],
            clickCount: 0,
            targetClicks: 0,
            targetSeat: null
        };
        this.paymentData = { confirmed: false };

        // 특수 이벤트
        this.activeEvent = null;
        this.eventHistory = [];

        // 콜백
        this.onStepChange = options.onStepChange || (() => {});
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onSeatUpdate = options.onSeatUpdate || (() => {});
        this.onConnectionUpdate = options.onConnectionUpdate || (() => {});
        this.onSpecialEvent = options.onSpecialEvent || (() => {});
        this.onQueueObstacle = options.onQueueObstacle || (() => {});

        // 타이머
        this.timers = [];
        this.intervals = [];
    }

    // 게임 시작
    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.startStep(GAME_STEPS.CONNECTION);
    }

    // 단계 시작
    startStep(step) {
        this.currentStep = step;
        this.stepStartTime = Date.now();

        const stepIndex = this.getStepIndex(step);
        this.stepProgress = stepIndex;

        this.onStepChange(step, stepIndex);

        switch(step) {
            case GAME_STEPS.CONNECTION:
                this.initConnectionStep();
                break;
            case GAME_STEPS.QUEUE:
                this.initQueueStep();
                break;
            case GAME_STEPS.CAPTCHA:
                this.initCaptchaStep();
                break;
            case GAME_STEPS.SEAT_SELECT:
                this.initSeatStep();
                break;
            case GAME_STEPS.PAYMENT:
                this.initPaymentStep();
                break;
        }
    }

    getStepIndex(step) {
        const steps = [GAME_STEPS.CONNECTION, GAME_STEPS.QUEUE, GAME_STEPS.CAPTCHA, GAME_STEPS.SEAT_SELECT, GAME_STEPS.PAYMENT];
        return steps.indexOf(step) + 1;
    }

    // ==========================================
    // 1단계: 접속 대기 게임 (서버 연결)
    // ==========================================
    initConnectionStep() {
        this.connectionData = {
            gauge: 0,
            clicks: 0,
            maxGauge: 100,
            targetClicks: this.settings.connectionClicks
        };

        this.onConnectionUpdate({
            gauge: 0,
            clicks: 0,
            targetClicks: this.settings.connectionClicks,
            status: 'connecting'
        });

        // 게이지 자동 감소
        const decay = setInterval(() => {
            if (this.currentStep !== GAME_STEPS.CONNECTION || this.isPaused) return;

            this.connectionData.gauge = Math.max(0, this.connectionData.gauge - this.settings.connectionDecay);

            this.onConnectionUpdate({
                gauge: this.connectionData.gauge,
                clicks: this.connectionData.clicks,
                targetClicks: this.settings.connectionClicks,
                status: this.connectionData.gauge > 80 ? 'almost' : 'connecting'
            });
        }, this.settings.connectionSpeed);

        this.intervals.push(decay);
    }

    // 접속 버튼 클릭
    clickConnection() {
        if (this.currentStep !== GAME_STEPS.CONNECTION || this.isPaused) return null;

        this.connectionData.clicks++;

        // 클릭당 게이지 증가량 (연타하면 보너스)
        const baseIncrease = 100 / this.settings.connectionClicks;
        this.connectionData.gauge = Math.min(100, this.connectionData.gauge + baseIncrease * 1.2);

        // 특수 이벤트 체크
        if (Math.random() < this.settings.eventChance * 0.3) {
            this.checkSpecialEvent();
        }

        this.onConnectionUpdate({
            gauge: this.connectionData.gauge,
            clicks: this.connectionData.clicks,
            targetClicks: this.settings.connectionClicks,
            status: this.connectionData.gauge >= 100 ? 'connected' :
                   this.connectionData.gauge > 80 ? 'almost' : 'connecting'
        });

        // 완료 체크
        if (this.connectionData.gauge >= 100) {
            this.completeStep(GAME_STEPS.CONNECTION);
            return { success: true, clicks: this.connectionData.clicks };
        }

        return {
            success: false,
            gauge: this.connectionData.gauge,
            clicks: this.connectionData.clicks
        };
    }

    // ==========================================
    // 2단계: 대기열 (연타 + 장애물)
    // ==========================================
    initQueueStep() {
        this.queueData = {
            position: this.settings.queueSize,
            clicks: 0,
            clicksNeeded: this.settings.queueClicksNeeded,
            obstacles: [],
            currentObstacle: null,
            lastClickTime: 0,
            streak: 1,
            obstacleCount: 0
        };

        // 장애물 스케줄링
        this.scheduleObstacles();

        this.onProgress({
            step: 'queue',
            position: this.queueData.position,
            clicks: 0,
            clicksNeeded: this.queueData.clicksNeeded,
            streak: 1
        });
    }

    scheduleObstacles() {
        for (let i = 0; i < this.settings.queueObstacles; i++) {
            const delay = 2000 + Math.random() * 6000;

            const timer = setTimeout(() => {
                if (this.currentStep === GAME_STEPS.QUEUE && !this.isPaused && !this.queueData.currentObstacle) {
                    const obstacle = QUEUE_OBSTACLES[Math.floor(Math.random() * QUEUE_OBSTACLES.length)];
                    this.queueData.currentObstacle = { ...obstacle };
                    this.onQueueObstacle(this.queueData.currentObstacle);
                }
            }, delay);

            this.timers.push(timer);
        }
    }

    // 장애물 해결
    resolveObstacle() {
        if (this.queueData.currentObstacle) {
            this.queueData.currentObstacle = null;
            this.queueData.obstacleCount++;
        }
    }

    // 대기열 클릭
    clickQueue() {
        if (this.currentStep !== GAME_STEPS.QUEUE || this.isPaused) return null;
        if (this.queueData.currentObstacle) return null; // 장애물 있으면 클릭 무시

        const now = Date.now();

        // 연타 보너스
        if (now - this.queueData.lastClickTime < 300) {
            this.queueData.streak = Math.min(5, this.queueData.streak + 0.5);
        } else {
            this.queueData.streak = Math.max(1, this.queueData.streak - 0.5);
        }
        this.queueData.lastClickTime = now;

        // 클릭 효과
        const baseReduction = Math.floor(this.settings.queueSize / this.settings.queueClicksNeeded);
        const reduction = Math.floor(baseReduction * this.queueData.streak);

        this.queueData.clicks++;
        this.queueData.position = Math.max(1, this.queueData.position - reduction);

        // 특수 이벤트 체크
        if (Math.random() < this.settings.eventChance * 0.5) {
            this.checkSpecialEvent();
        }

        this.onProgress({
            step: 'queue',
            position: this.queueData.position,
            clicks: this.queueData.clicks,
            clicksNeeded: this.queueData.clicksNeeded,
            streak: Math.floor(this.queueData.streak)
        });

        // 완료 체크
        if (this.queueData.clicks >= this.queueData.clicksNeeded && this.queueData.position <= 5) {
            this.completeStep(GAME_STEPS.QUEUE);
            return { success: true, position: this.queueData.position };
        }

        return {
            success: false,
            position: this.queueData.position,
            clicks: this.queueData.clicks,
            streak: Math.floor(this.queueData.streak)
        };
    }

    // ==========================================
    // 3단계: 보안문자
    // ==========================================
    initCaptchaStep() {
        this.captchaData = {
            answer: this.generateCaptcha(),
            attempts: 0,
            timeLeft: this.settings.captchaTimeLimit,
            startTime: Date.now()
        };
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let captcha = '';
        for (let i = 0; i < this.settings.captchaLength; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }

    getCaptchaAnswer() {
        return this.captchaData.answer;
    }

    submitCaptcha(input) {
        if (this.currentStep !== GAME_STEPS.CAPTCHA || this.isPaused) return null;

        const userInput = input.toUpperCase().trim();
        this.captchaData.attempts++;

        if (userInput === this.captchaData.answer) {
            this.completeStep(GAME_STEPS.CAPTCHA);
            return { success: true, attempts: this.captchaData.attempts };
        } else {
            this.captchaData.answer = this.generateCaptcha();
            return {
                success: false,
                attempts: this.captchaData.attempts,
                newCaptcha: this.captchaData.answer
            };
        }
    }

    // ==========================================
    // 4단계: 좌석 선택 (연타로 확보)
    // ==========================================
    initSeatStep() {
        this.generateSeats();
        this.seatData.targetClicks = this.settings.seatClickRace;
        this.seatData.clickCount = 0;
        this.seatData.targetSeat = null;
        this.startSeatGrabbing();
    }

    generateSeats() {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const cols = 12;
        const allSeats = [];

        for (const row of rows) {
            for (let col = 1; col <= cols; col++) {
                allSeats.push(`${row}${col}`);
            }
        }

        const preoccupiedCount = Math.floor(allSeats.length * (this.settings.seatPreoccupied / 100));
        const shuffled = [...allSeats].sort(() => Math.random() - 0.5);

        this.seatData.soldSeats = shuffled.slice(0, preoccupiedCount);
        this.seatData.availableSeats = shuffled.slice(preoccupiedCount);
        this.seatData.selectedSeat = null;

        this.onSeatUpdate({
            available: [...this.seatData.availableSeats],
            sold: [...this.seatData.soldSeats],
            selected: null,
            clickProgress: 0
        });
    }

    startSeatGrabbing() {
        const grabSeats = () => {
            if (this.currentStep !== GAME_STEPS.SEAT_SELECT || this.isPaused) return;
            if (this.seatData.selectedSeat) return;

            // 랜덤하게 좌석 선점
            for (let i = 0; i < this.settings.seatGrabCount; i++) {
                if (this.seatData.availableSeats.length > 5) {
                    const idx = Math.floor(Math.random() * this.seatData.availableSeats.length);
                    const seat = this.seatData.availableSeats.splice(idx, 1)[0];
                    this.seatData.soldSeats.push(seat);

                    // 선택 중인 좌석이 선점당하면 알림
                    if (seat === this.seatData.targetSeat) {
                        this.seatData.targetSeat = null;
                        this.seatData.clickCount = 0;
                    }
                }
            }

            this.onSeatUpdate({
                available: [...this.seatData.availableSeats],
                sold: [...this.seatData.soldSeats],
                selected: this.seatData.selectedSeat,
                clickProgress: this.seatData.clickCount
            });

            if (this.seatData.availableSeats.length === 0 && !this.seatData.selectedSeat) {
                this.gameOver(false, '좌석이 모두 매진되었습니다.');
                return;
            }

            const timer = setTimeout(grabSeats, this.settings.seatGrabSpeed);
            this.timers.push(timer);
        };

        const timer = setTimeout(grabSeats, this.settings.seatGrabSpeed);
        this.timers.push(timer);
    }

    // 좌석 선택 (selectSeat로 통일)
    selectSeat(seatId) {
        if (this.currentStep !== GAME_STEPS.SEAT_SELECT || this.isPaused) return null;

        // 이미 판매된 좌석
        if (this.seatData.soldSeats.includes(seatId)) {
            return { success: false, reason: 'already_sold' };
        }

        // 사용 가능한 좌석인지 확인
        if (!this.seatData.availableSeats.includes(seatId)) {
            return { success: false, reason: 'not_available' };
        }

        // 다른 좌석을 클릭하면 초기화
        if (this.seatData.targetSeat && this.seatData.targetSeat !== seatId) {
            this.seatData.targetSeat = seatId;
            this.seatData.clickCount = 1;
        } else if (this.seatData.targetSeat === seatId) {
            this.seatData.clickCount++;
        } else {
            this.seatData.targetSeat = seatId;
            this.seatData.clickCount = 1;
        }

        this.onSeatUpdate({
            available: [...this.seatData.availableSeats],
            sold: [...this.seatData.soldSeats],
            selected: this.seatData.selectedSeat,
            clickProgress: this.seatData.clickCount
        });

        // 충분히 클릭했으면 좌석 확보
        if (this.seatData.clickCount >= this.seatData.targetClicks) {
            this.seatData.selectedSeat = seatId;

            const idx = this.seatData.availableSeats.indexOf(seatId);
            if (idx > -1) {
                this.seatData.availableSeats.splice(idx, 1);
            }

            this.onSeatUpdate({
                available: [...this.seatData.availableSeats],
                sold: [...this.seatData.soldSeats],
                selected: seatId,
                clickProgress: this.seatData.clickCount
            });

            this.completeStep(GAME_STEPS.SEAT_SELECT);
            return { success: true, confirmed: true, seat: seatId };
        }

        return {
            success: true,
            confirmed: false,
            reason: 'need_more_clicks',
            clickCount: this.seatData.clickCount,
            targetClicks: this.seatData.targetClicks
        };
    }

    // ==========================================
    // 5단계: 결제 확인
    // ==========================================
    initPaymentStep() {
        this.paymentData = { confirmed: false };
    }

    confirmPayment() {
        if (this.currentStep !== GAME_STEPS.PAYMENT || this.isPaused) return null;

        this.paymentData.confirmed = true;
        this.completeStep(GAME_STEPS.PAYMENT);
        return { success: true };
    }

    // ==========================================
    // 특수 이벤트 시스템
    // ==========================================
    checkSpecialEvent() {
        if (this.activeEvent) return;
        if (Math.random() > this.settings.eventChance) return;

        const availableEvents = this.settings.eventTypes;
        const eventType = availableEvents[Math.floor(Math.random() * availableEvents.length)];

        this.triggerSpecialEvent(eventType);
    }

    triggerSpecialEvent(eventType) {
        const event = SPECIAL_EVENTS[eventType];
        if (!event) return;

        this.activeEvent = {
            ...event,
            type: eventType,
            startTime: Date.now()
        };

        this.eventHistory.push({
            type: eventType,
            time: Date.now(),
            step: this.currentStep
        });

        if (event.effect === 'freeze' || event.effect === 'progress_bar') {
            this.isPaused = true;
        } else if (event.effect === 'queue_penalty') {
            this.queueData.position = Math.min(
                this.settings.queueSize,
                this.queueData.position + 50
            );
            this.queueData.clicks = Math.max(0, this.queueData.clicks - 5);
        }

        this.onSpecialEvent({
            ...this.activeEvent,
            type: eventType
        });
    }

    resolveSpecialEvent() {
        if (!this.activeEvent) return false;

        this.isPaused = false;
        this.activeEvent = null;
        return true;
    }

    // ==========================================
    // 게임 진행 관리
    // ==========================================
    completeStep(step) {
        // 인터벌 정리
        this.intervals.forEach(i => clearInterval(i));
        this.intervals = [];

        const stepIndex = this.getStepIndex(step);
        this.stepProgress = stepIndex;

        this.onProgress({
            step: step,
            stepIndex: stepIndex,
            totalSteps: this.totalSteps
        });

        const nextStep = this.getNextStep(step);
        if (nextStep) {
            setTimeout(() => {
                this.startStep(nextStep);
            }, 500);
        } else {
            this.gameOver(true);
        }
    }

    getNextStep(currentStep) {
        const steps = [GAME_STEPS.CONNECTION, GAME_STEPS.QUEUE, GAME_STEPS.CAPTCHA, GAME_STEPS.SEAT_SELECT, GAME_STEPS.PAYMENT];
        const idx = steps.indexOf(currentStep);
        return idx < steps.length - 1 ? steps[idx + 1] : null;
    }

    gameOver(success, message = '') {
        this.isRunning = false;
        this.finishTime = Date.now() - this.startTime;
        this.currentStep = GAME_STEPS.FINISHED;

        this.timers.forEach(t => clearTimeout(t));
        this.timers = [];
        this.intervals.forEach(i => clearInterval(i));
        this.intervals = [];

        this.onComplete({
            success: success,
            time: this.finishTime,
            message: message,
            data: {
                connection: this.connectionData,
                queue: this.queueData,
                captcha: this.captchaData,
                seat: this.seatData,
                payment: this.paymentData,
                events: this.eventHistory
            }
        });
    }

    getProgress() {
        return (this.stepProgress / this.totalSteps) * 100;
    }

    destroy() {
        this.isRunning = false;
        this.timers.forEach(t => clearTimeout(t));
        this.timers = [];
        this.intervals.forEach(i => clearInterval(i));
        this.intervals = [];
    }
}

// =============================================
// AI 시뮬레이터 클래스
// =============================================
class AIBattleSimulator {
    constructor(options = {}) {
        this.difficulty = options.difficulty || 'normal';
        this.profile = options.profile || 'normal';
        this.settings = DIFFICULTY_SETTINGS[this.difficulty];

        this.currentStep = 0;
        this.progress = 0;
        this.isRunning = false;
        this.actions = [];

        this.profiles = {
            casual: { speed: 1.5, accuracy: 0.6, mistakeChance: 0.3 },
            normal: { speed: 1.0, accuracy: 0.8, mistakeChance: 0.15 },
            pro: { speed: 0.7, accuracy: 0.9, mistakeChance: 0.08 },
            master: { speed: 0.5, accuracy: 0.95, mistakeChance: 0.03 },
            legend: { speed: 0.35, accuracy: 0.98, mistakeChance: 0.01 }
        };

        this.profileSettings = this.profiles[this.profile] || this.profiles.normal;

        this.onAction = options.onAction || (() => {});
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onStepChange = options.onStepChange || (() => {});

        this.timers = [];
    }

    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.simulateStep(0);
    }

    simulateStep(stepIndex) {
        if (!this.isRunning) return;

        const steps = ['connection', 'queue', 'captcha', 'seat_select', 'payment'];
        const step = steps[stepIndex];

        this.currentStep = stepIndex + 1;
        this.onStepChange(step, stepIndex + 1);

        switch(step) {
            case 'connection':
                this.simulateConnection(stepIndex);
                break;
            case 'queue':
                this.simulateQueue(stepIndex);
                break;
            case 'captcha':
                this.simulateCaptcha(stepIndex);
                break;
            case 'seat_select':
                this.simulateSeatSelect(stepIndex);
                break;
            case 'payment':
                this.simulatePayment(stepIndex);
                break;
        }
    }

    simulateConnection(stepIndex) {
        let gauge = 0;
        const targetClicks = this.settings.connectionClicks;

        const click = () => {
            if (!this.isRunning) return;

            gauge += (100 / targetClicks) * (0.8 + Math.random() * 0.4);
            gauge = Math.min(100, gauge);

            this.onAction({
                step: 'connection',
                action: 'click',
                gauge: gauge,
                progress: gauge
            });

            if (gauge >= 100) {
                this.completeStep(stepIndex);
                return;
            }

            const delay = 100 * this.profileSettings.speed + Math.random() * 50;
            const timer = setTimeout(click, delay);
            this.timers.push(timer);
        };

        const timer = setTimeout(click, 500 * this.profileSettings.speed);
        this.timers.push(timer);
    }

    simulateQueue(stepIndex) {
        let clicks = 0;
        const needed = this.settings.queueClicksNeeded;

        const clickQueue = () => {
            if (!this.isRunning || clicks >= needed) {
                this.completeStep(stepIndex);
                return;
            }

            clicks++;
            this.onAction({
                step: 'queue',
                action: 'click',
                clicks: clicks,
                needed: needed,
                progress: clicks / needed * 100
            });

            const baseDelay = 150 * this.profileSettings.speed;
            const delay = Math.random() < this.profileSettings.mistakeChance
                ? baseDelay * 3
                : baseDelay + Math.random() * 100;

            const timer = setTimeout(clickQueue, delay);
            this.timers.push(timer);
        };

        clickQueue();
    }

    simulateCaptcha(stepIndex) {
        const captchaLength = this.settings.captchaLength;
        const baseTime = 400 * captchaLength * this.profileSettings.speed;
        const willMistake = Math.random() < this.profileSettings.mistakeChance;

        if (willMistake) {
            this.onAction({
                step: 'captcha',
                action: 'typing',
                status: 'mistake',
                progress: 50
            });

            const timer = setTimeout(() => {
                this.onAction({
                    step: 'captcha',
                    action: 'retry',
                    progress: 0
                });

                const timer2 = setTimeout(() => {
                    this.onAction({
                        step: 'captcha',
                        action: 'complete',
                        progress: 100
                    });
                    this.completeStep(stepIndex);
                }, baseTime);
                this.timers.push(timer2);
            }, baseTime * 0.7);
            this.timers.push(timer);
        } else {
            let progress = 0;
            const updateProgress = () => {
                if (!this.isRunning) return;

                progress += 20;
                this.onAction({
                    step: 'captcha',
                    action: 'typing',
                    progress: Math.min(progress, 100)
                });

                if (progress < 100) {
                    const timer = setTimeout(updateProgress, baseTime / 5);
                    this.timers.push(timer);
                } else {
                    this.completeStep(stepIndex);
                }
            };
            updateProgress();
        }
    }

    simulateSeatSelect(stepIndex) {
        const clicksNeeded = this.settings.seatClickRace;
        let clicks = 0;
        const searchTime = 500 * this.profileSettings.speed;

        const timer = setTimeout(() => {
            this.onAction({
                step: 'seat_select',
                action: 'found_seat',
                progress: 10
            });

            const clickSeat = () => {
                if (!this.isRunning || clicks >= clicksNeeded) {
                    this.completeStep(stepIndex);
                    return;
                }

                clicks++;
                this.onAction({
                    step: 'seat_select',
                    action: 'click_seat',
                    clicks: clicks,
                    needed: clicksNeeded,
                    progress: 10 + (clicks / clicksNeeded * 90)
                });

                const delay = 120 * this.profileSettings.speed + Math.random() * 80;
                const timer2 = setTimeout(clickSeat, delay);
                this.timers.push(timer2);
            };

            clickSeat();
        }, searchTime);
        this.timers.push(timer);
    }

    simulatePayment(stepIndex) {
        const paymentTime = 800 * this.profileSettings.speed;

        this.onAction({
            step: 'payment',
            action: 'processing',
            progress: 50
        });

        const timer = setTimeout(() => {
            this.onAction({
                step: 'payment',
                action: 'complete',
                progress: 100
            });
            this.completeStep(stepIndex);
        }, paymentTime);
        this.timers.push(timer);
    }

    completeStep(stepIndex) {
        this.progress = ((stepIndex + 1) / 5) * 100;

        this.onProgress({
            step: stepIndex + 1,
            totalSteps: 5,
            progress: this.progress
        });

        if (stepIndex < 4) {
            const delay = 300 + Math.random() * 200;
            const timer = setTimeout(() => {
                this.simulateStep(stepIndex + 1);
            }, delay);
            this.timers.push(timer);
        } else {
            this.finish();
        }
    }

    finish() {
        this.isRunning = false;
        this.finishTime = Date.now() - this.startTime;

        this.onComplete({
            time: this.finishTime,
            actions: this.actions
        });
    }

    destroy() {
        this.isRunning = false;
        this.timers.forEach(t => clearTimeout(t));
        this.timers = [];
    }
}

// CAPTCHA 이미지 생성기
class CaptchaRenderer {
    constructor(canvas, difficulty = 'normal') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.settings = DIFFICULTY_SETTINGS[difficulty];
    }

    render(text) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        // 배경
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // 배경 왜곡
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(${50 + Math.random() * 50}, ${50 + Math.random() * 50}, ${80 + Math.random() * 50}, 0.3)`;
            ctx.lineWidth = 20 + Math.random() * 30;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.quadraticCurveTo(
                Math.random() * width, Math.random() * height,
                Math.random() * width, Math.random() * height
            );
            ctx.stroke();
        }

        // 노이즈 라인
        for (let i = 0; i < this.settings.captchaNoise; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`;
            ctx.lineWidth = Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // 텍스트
        const fontSize = Math.min(35, width / text.length * 1.3);
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const charWidth = width / (text.length + 1);

        for (let i = 0; i < text.length; i++) {
            ctx.save();

            const x = charWidth * (i + 1);
            const y = height / 2 + (Math.random() - 0.5) * 15;
            const rotation = (Math.random() - 0.5) * 0.6;
            const scale = 0.8 + Math.random() * 0.4;

            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(text[i], 3, 3);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeText(text[i], 0, 0);

            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#a29bfe', '#fd79a8'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillText(text[i], 0, 0);

            ctx.restore();
        }

        // 노이즈 점
        for (let i = 0; i < this.settings.captchaNoise * 3; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`;
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 전역 export
window.BattleGameEngine = BattleGameEngine;
window.AIBattleSimulator = AIBattleSimulator;
window.CaptchaRenderer = CaptchaRenderer;
window.GAME_STEPS = GAME_STEPS;
window.DIFFICULTY_SETTINGS = DIFFICULTY_SETTINGS;
window.SPECIAL_EVENTS = SPECIAL_EVENTS;
window.QUEUE_OBSTACLES = QUEUE_OBSTACLES;

console.log('Battle Game Engine v2.1 로드 완료!');
