// =============================================
// AI Battle System - 가상 경쟁자 AI 시스템
// =============================================

// AI 프로필 정의
const AI_PROFILES = {
    // 초보자 AI - 느리고 실수 많음
    beginner: {
        id: 'beginner',
        name: '티켓팅 새내기',
        avatar: '🐣',
        description: '처음 티켓팅을 배우는 중이에요',
        baseSpeed: 2500,
        speedVariance: 1200,
        errorRate: 0.18,
        recoveryTime: 2500,
        difficulty: 'easy',
        winMessage: '새내기도 이겼네요! 더 연습이 필요해요 😅',
        loseMessage: '새내기를 이겼어요! 기초는 탄탄하네요 👍'
    },

    // 일반 사용자 AI
    casual: {
        id: 'casual',
        name: '주말 티켓러',
        avatar: '😊',
        description: '가끔 티켓팅하는 일반인',
        baseSpeed: 1800,
        speedVariance: 800,
        errorRate: 0.10,
        recoveryTime: 1800,
        difficulty: 'easy',
        winMessage: '주말 티켓러한테 졌네요! 연습이 필요해요',
        loseMessage: '주말 티켓러를 이겼어요! 실력이 좋네요!'
    },

    // 숙련자 AI
    experienced: {
        id: 'experienced',
        name: '콘서트 마니아',
        avatar: '🎸',
        description: '수십 번의 티켓팅 경험자',
        baseSpeed: 1200,
        speedVariance: 500,
        errorRate: 0.05,
        recoveryTime: 1000,
        difficulty: 'normal',
        winMessage: '마니아한테 졌어요! 상당한 실력자네요',
        loseMessage: '마니아를 이겼어요! 대단해요! 🎉'
    },

    // 프로 AI
    pro: {
        id: 'pro',
        name: '티켓팅 고수',
        avatar: '⚡',
        description: '실패를 모르는 프로',
        baseSpeed: 700,
        speedVariance: 300,
        errorRate: 0.02,
        recoveryTime: 600,
        difficulty: 'hard',
        winMessage: '고수한테 졌어요... 정말 빠르네요!',
        loseMessage: '고수를 이겼어요! 당신이 진정한 고수! 🏆'
    },

    // 전설 AI
    legend: {
        id: 'legend',
        name: '전설의 티켓러',
        avatar: '👑',
        description: '0.1초 컷을 성공시킨 전설',
        baseSpeed: 400,
        speedVariance: 150,
        errorRate: 0.01,
        recoveryTime: 400,
        difficulty: 'hard',
        winMessage: '전설에게 졌어요... 당연한 결과일지도?',
        loseMessage: '전설을 이겼어요!!! 새로운 전설 탄생! 👑🎊'
    }
};

// AI 시뮬레이터 클래스
class AISimulator {
    constructor(profileId) {
        this.profile = AI_PROFILES[profileId] || AI_PROFILES.casual;
        this.progress = 0;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.isRunning = false;
        this.isFinished = false;
        this.startTime = null;
        this.finishTime = null;
        this.errors = 0;
        this.timeoutIds = [];
    }

    // AI 시뮬레이션 시작
    start(totalSteps) {
        this.totalSteps = totalSteps;
        this.startTime = Date.now();
        this.isRunning = true;
        this.isFinished = false;
        this.simulateNextStep();
    }

    // 다음 단계 시뮬레이션
    simulateNextStep() {
        if (!this.isRunning || this.isFinished) return;

        // 실수 체크
        if (Math.random() < this.profile.errorRate) {
            this.handleError();
            return;
        }

        // 다음 클릭까지 소요 시간 계산
        const delay = this.calculateDelay();

        const timeoutId = setTimeout(() => {
            if (!this.isRunning) return;

            this.currentStep++;
            this.progress = Math.min(100, (this.currentStep / this.totalSteps) * 100);

            // 진행 상황 콜백
            if (this.onProgress) {
                this.onProgress(this.progress, this.currentStep);
            }

            if (this.currentStep >= this.totalSteps) {
                this.finish();
            } else {
                this.simulateNextStep();
            }
        }, delay);

        this.timeoutIds.push(timeoutId);
    }

    // 클릭 딜레이 계산
    calculateDelay() {
        const variance = (Math.random() - 0.5) * 2 * this.profile.speedVariance;
        return Math.max(100, this.profile.baseSpeed + variance);
    }

    // 실수 처리
    handleError() {
        this.errors++;

        if (this.onError) {
            this.onError(this.errors);
        }

        const timeoutId = setTimeout(() => {
            if (this.isRunning) {
                this.simulateNextStep();
            }
        }, this.profile.recoveryTime);

        this.timeoutIds.push(timeoutId);
    }

    // 완료
    finish() {
        this.isFinished = true;
        this.isRunning = false;
        this.finishTime = Date.now();
        const elapsedTime = this.finishTime - this.startTime;

        if (this.onFinish) {
            this.onFinish(elapsedTime, this.errors);
        }
    }

    // 중지
    stop() {
        this.isRunning = false;
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds = [];
    }

    // 경과 시간 가져오기
    getElapsedTime() {
        if (!this.startTime) return 0;
        if (this.finishTime) return this.finishTime - this.startTime;
        return Date.now() - this.startTime;
    }
}

// 대결 관리자 클래스
class BattleManager {
    constructor(options = {}) {
        this.gameType = options.gameType || 'concert';
        this.difficulty = options.difficulty || 'normal';
        this.aiProfileId = options.aiProfile || 'casual';
        this.totalSteps = options.totalSteps || 5;

        this.userProgress = 0;
        this.userStep = 0;
        this.userStartTime = null;
        this.userFinishTime = null;

        this.aiSimulator = null;
        this.isGameRunning = false;
        this.timerInterval = null;

        this.onGameEnd = options.onGameEnd || null;
    }

    // 초기화
    init() {
        this.updateAIInfo();
        this.resetProgress();
    }

    // AI 정보 표시
    updateAIInfo() {
        const profile = AI_PROFILES[this.aiProfileId];

        const aiAvatar = document.getElementById('aiAvatar');
        const aiName = document.getElementById('aiName');
        const aiDesc = document.getElementById('aiDescription');

        if (aiAvatar) aiAvatar.textContent = profile.avatar;
        if (aiName) aiName.textContent = profile.name;
        if (aiDesc) aiDesc.textContent = profile.description;
    }

    // 진행률 초기화
    resetProgress() {
        this.userProgress = 0;
        this.userStep = 0;

        const userProgress = document.getElementById('userProgress');
        const aiProgress = document.getElementById('aiProgress');
        const userStep = document.getElementById('userStep');
        const aiStep = document.getElementById('aiStep');

        if (userProgress) userProgress.style.width = '0%';
        if (aiProgress) aiProgress.style.width = '0%';
        if (userStep) userStep.textContent = '0';
        if (aiStep) aiStep.textContent = '0';
    }

    // 대결 시작
    startBattle() {
        this.isGameRunning = true;
        this.userStartTime = Date.now();

        // 타이머 시작
        this.startTimer();

        // AI 시뮬레이션 시작
        this.aiSimulator = new AISimulator(this.aiProfileId);

        this.aiSimulator.onProgress = (progress, step) => {
            this.updateAIProgress(progress, step);
        };

        this.aiSimulator.onError = (errorCount) => {
            this.showAIError();
        };

        this.aiSimulator.onFinish = (elapsedTime, errors) => {
            this.handleAIFinish(elapsedTime, errors);
        };

        this.aiSimulator.start(this.totalSteps);
    }

    // 타이머 시작
    startTimer() {
        const timerDisplay = document.getElementById('battleTimer');

        this.timerInterval = setInterval(() => {
            if (!this.isGameRunning) return;

            const elapsed = Date.now() - this.userStartTime;
            if (timerDisplay) {
                timerDisplay.textContent = this.formatTime(elapsed);
            }
        }, 10);
    }

    // 시간 포맷
    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
    }

    // 사용자 진행 업데이트
    updateUserProgress(step) {
        this.userStep = step;
        this.userProgress = Math.min(100, (step / this.totalSteps) * 100);

        const userProgress = document.getElementById('userProgress');
        const userStepEl = document.getElementById('userStep');

        if (userProgress) userProgress.style.width = `${this.userProgress}%`;
        if (userStepEl) userStepEl.textContent = step;

        this.checkLeading();

        // 완료 체크
        if (step >= this.totalSteps) {
            this.userFinishTime = Date.now() - this.userStartTime;
            this.checkBattleEnd();
        }
    }

    // AI 진행 업데이트
    updateAIProgress(progress, step) {
        const aiProgress = document.getElementById('aiProgress');
        const aiStepEl = document.getElementById('aiStep');

        if (aiProgress) aiProgress.style.width = `${progress}%`;
        if (aiStepEl) aiStepEl.textContent = step;

        this.checkLeading();
    }

    // 선두 체크
    checkLeading() {
        const userCard = document.querySelector('.player-card.user');
        const aiCard = document.querySelector('.player-card.ai');

        if (!userCard || !aiCard || !this.aiSimulator) return;

        if (this.userProgress > this.aiSimulator.progress) {
            userCard.classList.add('winning');
            aiCard.classList.remove('winning');
        } else if (this.aiSimulator.progress > this.userProgress) {
            aiCard.classList.add('winning');
            userCard.classList.remove('winning');
        } else {
            userCard.classList.remove('winning');
            aiCard.classList.remove('winning');
        }
    }

    // AI 실수 표시
    showAIError() {
        const aiCard = document.querySelector('.player-card.ai');
        if (aiCard) {
            aiCard.classList.add('error-shake');
            setTimeout(() => aiCard.classList.remove('error-shake'), 500);
        }
    }

    // AI 완료 처리
    handleAIFinish(elapsedTime, errors) {
        this.aiFinishTime = elapsedTime;
        this.aiErrors = errors;
        this.checkBattleEnd();
    }

    // 대결 종료 체크
    checkBattleEnd() {
        // 둘 다 완료되면 종료
        if (this.userFinishTime && this.aiSimulator?.isFinished) {
            this.endBattle();
        }
        // 한 명이 완료되면 3초 후 강제 종료
        else if (this.userFinishTime || this.aiSimulator?.isFinished) {
            setTimeout(() => {
                if (this.isGameRunning) {
                    this.endBattle();
                }
            }, 3000);
        }
    }

    // 대결 종료
    endBattle() {
        this.isGameRunning = false;
        clearInterval(this.timerInterval);

        if (this.aiSimulator) {
            this.aiSimulator.stop();
        }

        // 결과 판정
        const userWins = this.determineWinner();
        this.showResult(userWins);
    }

    // 승자 판정
    determineWinner() {
        // 사용자가 완료하지 못함
        if (!this.userFinishTime) return false;

        // AI가 완료하지 못함
        if (!this.aiSimulator?.isFinished) return true;

        // 둘 다 완료 - 시간 비교
        return this.userFinishTime < this.aiSimulator.getElapsedTime();
    }

    // 결과 표시
    showResult(userWins) {
        const userCard = document.querySelector('.player-card.user');
        const aiCard = document.querySelector('.player-card.ai');
        const profile = AI_PROFILES[this.aiProfileId];

        if (userWins) {
            if (userCard) userCard.classList.add('winner');
            if (aiCard) aiCard.classList.add('loser');
        } else {
            if (aiCard) aiCard.classList.add('winner');
            if (userCard) userCard.classList.add('loser');
        }

        // 콜백 호출
        if (this.onGameEnd) {
            this.onGameEnd({
                userWins: userWins,
                userTime: this.userFinishTime,
                aiTime: this.aiSimulator?.getElapsedTime(),
                aiProfile: profile,
                message: userWins ? profile.loseMessage : profile.winMessage
            });
        }
    }

    // 정리
    destroy() {
        this.isGameRunning = false;
        clearInterval(this.timerInterval);
        if (this.aiSimulator) {
            this.aiSimulator.stop();
        }
    }
}

// AI 프로필 목록 가져오기
function getAIProfiles() {
    return AI_PROFILES;
}

// AI 프로필 가져오기
function getAIProfile(profileId) {
    return AI_PROFILES[profileId] || AI_PROFILES.casual;
}

// 전역 export
window.AISimulator = AISimulator;
window.BattleManager = BattleManager;
window.AI_PROFILES = AI_PROFILES;
window.getAIProfiles = getAIProfiles;
window.getAIProfile = getAIProfile;

console.log('AI Battle System 로드 완료!');
