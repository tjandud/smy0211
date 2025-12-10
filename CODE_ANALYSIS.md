# 프로젝트 코드 분석 보고서

## 1. 프로젝트 개요

이 프로젝트는 **3개의 독립적인 서브 프로젝트**로 구성된 웹 애플리케이션입니다:

| 폴더 | 프로젝트명 | 설명 |
|------|-----------|------|
| `a/` | 채팅 시스템 | HTML 기반 채팅 인터페이스 |
| `b/` | 멜론티켓 클론 | 실제 멜론티켓 사이트를 모방한 티켓 예매 시스템 |
| `c/` | 티켓킹 (티케팅 연습기) | 티케팅 연습용 시뮬레이터 |

---

## 2. 파일 구조 및 역할

### 2.1 폴더 A - 채팅 시스템

```
a/
├── aaa.html          # 메인 채팅 인터페이스
├── chat.html         # 확장 채팅 기능
└── .vscode/
    └── launch.json   # VS Code 디버그 설정
```

**핵심 기능:**
- HTML/CSS/JS 기반 채팅 UI
- 실시간 메시지 송수신 인터페이스

---

### 2.2 폴더 B - 멜론티켓 클론

```
b/
├── index.html            # 메인 공연 상세 페이지 (177KB)
├── payment.html          # 결제 페이지
├── seat_local.html       # 좌석 선택 페이지
│
├── cdnticket/resource/   # 정적 리소스
│   ├── image/            # 좌석 이미지 (SVG, PNG)
│   └── style/            # CSS 스타일시트
│       ├── common_onestop.css
│       └── onestop.css
│
├── ticket/               # 티켓 예매 핵심 로직
│   ├── stepSeat.htm      # 좌석 선택 팝업
│   └── web/common/       # 공통 JavaScript 라이브러리
│       ├── jquery-3.6.0.min.js
│       ├── jquery.inputmask.bundle.js
│       ├── iscroll-min.js
│       ├── melonweb_comm.js    # 멜론 프레임워크 (447KB)
│       └── netfunnel.js        # 대기열 시스템
│
├── ssl/melona/libs/
│   └── synchronizer.js   # 동기화 라이브러리
│
└── wcs/
    └── wcslog.js         # 네이버 로깅 시스템
```

**핵심 컴포넌트:**

| 파일 | 역할 | 크기 |
|------|------|------|
| `index.html` | 공연 상세 정보, 날짜/시간/좌석 선택 UI | 177KB |
| `melonweb_comm.js` | 멜론 웹 공통 프레임워크 (jQuery 확장) | 447KB |
| `netfunnel.js` | 트래픽 대기열 관리 시스템 | - |

---

### 2.3 폴더 C - 티켓킹 (티케팅 연습기)

```
c/test_ticket/
├── ticketingMain.html       # 공연 예매 메인 페이지
├── 사이트 설명.txt
│
├── main-pages/              # 메인/선택 페이지
│   ├── main.html            # 인트로 페이지
│   └── choice.html          # 카테고리 선택 (굿즈/콘서트/식당)
│
├── concert-pages/           # 콘서트 티케팅 플로우
│   ├── hall-choice.html     # 공연장 선택
│   ├── concert-level.html   # 난이도 선택 (Easy/Normal/Hard)
│   ├── concert-timer.html   # 타이머 게임 (3-2-1 카운트다운)
│   ├── ticketingMain.html   # 공연 상세/날짜 선택
│   └── yes24hall.html       # 좌석 선택 + 보안문자(CAPTCHA)
│
├── goods-pages/             # 굿즈 구매 플로우
│   ├── goods-choice.html    # 굿즈 종류 선택 (앨범/포토카드/의상)
│   ├── goods-level.html     # 난이도 선택
│   ├── goods-timer.html     # 타이머 + 미션 생성
│   ├── goods-album.html     # 앨범 구매 페이지
│   ├── goods-photo.html     # 포토카드 구매 페이지
│   └── goods-clothes.html   # 의상 구매 페이지
│
├── restaurant-pages/        # 레스토랑 예약 플로우
│   ├── restaurant-level.html   # 난이도 선택
│   ├── restaurant-timer.html   # 타이머 게임
│   └── restaurant-main.html    # 예약 메인
│
├── image/                   # 이미지 리소스
│   ├── concert/             # 공연 관련 GIF/SVG
│   ├── goods/               # 굿즈 이미지
│   ├── main/                # 메인 배너 이미지
│   └── restaurant/          # 레스토랑 사진
│
└── audio/
    └── 까톡 소리.mp3        # 알림 사운드
```

---

## 3. 의존성(Dependency) 관계

### 3.1 전체 의존성 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        프로젝트 전체 구조                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────────┐    │
│  │  폴더 A  │     │    폴더 B    │     │      폴더 C      │    │
│  │  채팅    │     │  멜론티켓    │     │    티켓킹        │    │
│  │ (독립)   │     │   클론       │     │  (연습 시뮬)     │    │
│  └──────────┘     └──────────────┘     └──────────────────┘    │
│       │                  │                      │               │
│       ▼                  ▼                      ▼               │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────────┐    │
│  │ chat.html│     │  jQuery 3.6  │     │   Vanilla JS     │    │
│  │ aaa.html │     │ melonweb.js  │     │   localStorage   │    │
│  └──────────┘     │ netfunnel.js │     │   URL Params     │    │
│                   └──────────────┘     └──────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 폴더 B (멜론티켓) 의존성

```
index.html
    │
    ├─► jQuery 3.6.0 (jquery-3.6.0.min.js)
    │       │
    │       └─► jquery.inputmask.bundle.js (입력 마스킹)
    │
    ├─► melonweb_comm.js (멜론 프레임워크)
    │       │
    │       ├─► MELON.WEBSVC 네임스페이스
    │       ├─► jQuery 확장 플러그인
    │       └─► 레이어 팝업/Ajax 유틸리티
    │
    ├─► netfunnel.js (대기열 시스템)
    │
    ├─► 외부 CDN
    │       ├─► cdnticket.melon.co.kr (CSS/이미지)
    │       ├─► wcs.naver.net (네이버 로깅)
    │       └─► t1.daumcdn.net (카카오 픽셀)
    │
    └─► payment.html / seat_local.html
            │
            └─► stepSeat.htm (좌석 선택 팝업)
```

### 3.3 폴더 C (티켓킹) 의존성 및 페이지 플로우

```
┌─────────────────────────────────────────────────────────────────┐
│                     티켓킹 페이지 플로우                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        main.html                                │
│                            │                                    │
│                            ▼                                    │
│                       choice.html                               │
│                     ┌─────┼─────┐                               │
│                     ▼     ▼     ▼                               │
│              ┌──────┐ ┌──────┐ ┌──────────┐                     │
│              │굿즈  │ │콘서트│ │식당      │                     │
│              └──┬───┘ └──┬───┘ └────┬─────┘                     │
│                 │        │          │                           │
│                 ▼        ▼          ▼                           │
│         goods-choice  hall-choice  restaurant-level             │
│                 │        │          │                           │
│                 ▼        ▼          ▼                           │
│         goods-level   concert-level restaurant-timer            │
│                 │        │          │                           │
│                 ▼        ▼          ▼                           │
│         goods-timer   concert-timer restaurant-main             │
│                 │        │                                      │
│        ┌───────┼────────┐│                                      │
│        ▼       ▼        ▼▼                                      │
│   goods-album  goods-photo  ticketingMain                       │
│   goods-clothes              │                                  │
│        │                     ▼                                  │
│        │               yes24hall.html                           │
│        │                     │                                  │
│        └─────────────────────┴──► 결과 모달 (성공/실패)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 데이터 흐름 (URL 파라미터 & localStorage)

```
┌─────────────────────────────────────────────────────────────────┐
│                      데이터 전달 방식                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  URL Parameters (페이지 간 상태 전달)                            │
│  ───────────────────────────────────────                        │
│                                                                 │
│  hall-choice.html                                               │
│       │ ?hall=YES24홀                                           │
│       ▼                                                         │
│  concert-level.html                                             │
│       │ ?level=easy&hall=YES24홀                                │
│       ▼                                                         │
│  concert-timer.html                                             │
│       │ ?level=easy&hall=YES24홀&timerEnd=...                   │
│       ▼                                                         │
│  ticketingMain.html                                             │
│       │ ?level=easy&hall=YES24홀&date=2025.01.15                │
│       ▼                                                         │
│  yes24hall.html                                                 │
│                                                                 │
│                                                                 │
│  localStorage (미션 데이터 저장)                                 │
│  ────────────────────────────────                               │
│                                                                 │
│  goods-timer.html                                               │
│       │ localStorage.setItem('questData', {...})                │
│       │ localStorage.setItem('questEndAt', ...)                 │
│       ▼                                                         │
│  goods-album/photo/clothes.html                                 │
│       │ localStorage.getItem('questData')                       │
│       │ localStorage.getItem('questEndAt')                      │
│       ▼                                                         │
│  미션 검증 및 결과 표시                                          │
│                                                                 │
│                                                                 │
│  globalSound 설정                                                │
│  ─────────────────                                              │
│  localStorage.getItem('globalSound') // 'on' | 'off'            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 핵심 로직 분석

### 4.1 타이머 게임 시스템 (concert-timer.html, goods-timer.html)

```javascript
// 난이도별 설정
var levelConfigs = {
  easy:   { duration: 10000, successWindow: 150 },  // 10초, 150ms 허용
  normal: { duration: 5000,  successWindow: 80 },   // 5초, 80ms 허용
  hard:   { duration: 5000,  successWindow: 40 }    // 5초, 40ms 허용
};

// 게임 흐름
1. 3-2-1 프리카운트 표시
2. 타이머 시작 (duration 기반)
3. 사용자가 "사이트 접속하기" 클릭
4. 클릭 타이밍 검증:
   - 너무 빠름: 실패 ("티케팅이 열리기 전에 접속했습니다!")
   - 적절한 타이밍: 대기열 모달 → 다음 페이지
   - 늦음: 대기열 인원 증가 (초당 rate만큼)
```

### 4.2 대기열 시뮬레이션

```javascript
// 대기열 인원 계산
var ratesPerSecond = {
  easy: 50,     // 초당 50명 증가
  normal: 150,  // 초당 150명 증가
  hard: 300     // 초당 300명 증가
};

var baseByLevel = {
  easy: 50,
  normal: 83,
  hard: 120
};

var initialQueue = base + (rate * extraSeconds);

// 6.5초에 걸쳐 대기열 0으로 감소 애니메이션
```

### 4.3 미션(퀘스트) 시스템 (굿즈)

```javascript
// 난이도별 미션 생성
function generateQuestData() {
  if (selectedLevel === 'easy') {
    // 아무 상품 1개 구매
    questRequirements = [{ version: '아무 앨범', count: 1 }];
  } else if (selectedLevel === 'normal') {
    // 특정 버전 1-2개 구매
    const count = Math.random() < 0.5 ? 1 : 2;
    const randomVersion = versions[random];
    questRequirements = [{ version: randomVersion, count: count }];
  } else { // hard
    // 서로 다른 버전 2개 각 1개씩 구매
    questRequirements = [
      { version: 'A ver', count: 1 },
      { version: 'B ver', count: 1 }
    ];
  }

  localStorage.setItem('questData', JSON.stringify({...}));
}
```

### 4.4 좌석 선택 시스템 (yes24hall.html)

```javascript
// 좌석 배치 정의
const rowPatterns = {
  A: { left: 4, center: 11, right: 3 },
  B: { left: 5, center: 12, right: 4 },
  // ...
};

// 좌석 상태
- 초록색: 선택 가능
- 빨간색: 선택됨
- 회색: 매진

// 보안문자(CAPTCHA) 검증 후 좌석 선택 가능
// 선택 완료 시 성공/실패 모달 표시
```

---

## 5. 통합 구조 개요

### 5.1 공통 컴포넌트

```
┌─────────────────────────────────────────────────────────────────┐
│                      공통 UI 컴포넌트                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 헤더 컴포넌트                                                │
│     ┌──────────────────────────────────────────────┐            │
│     │ 🎫 티켓킹                              🔊    │            │
│     └──────────────────────────────────────────────┘            │
│     - 로고 + 브랜드명                                            │
│     - 사운드 토글 버튼 (localStorage 연동)                       │
│                                                                 │
│  2. 난이도 선택 버튼                                             │
│     ┌─────────────────────┐                                     │
│     │   🟢 Easy (초록)    │                                     │
│     │   🔵 Normal (파랑)  │                                     │
│     │   🔴 Hard (빨강)    │                                     │
│     └─────────────────────┘                                     │
│                                                                 │
│  3. 타이머 오버레이                                              │
│     - 3-2-1 프리카운트                                          │
│     - 메인 타이머 (10.00 / 5.00 형식)                           │
│     - "사이트 접속하기" 버튼 (펄스 애니메이션)                    │
│                                                                 │
│  4. 대기열 모달                                                  │
│     - 대기 인원 카운트                                          │
│     - 프로그레스 바 애니메이션                                   │
│                                                                 │
│  5. 결과 모달                                                    │
│     - 성공: 체크마크 아이콘 + "예매에 성공하셨습니다!"           │
│     - 실패: X마크 아이콘 + "좌석이 모두 매진되었어요."           │
│     - 액션 버튼: 다시하기 / 난이도 선택 / 메인으로               │
│                                                                 │
│  6. 업데이트 예정 모달                                           │
│     - 미구현 기능 클릭 시 표시                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 스타일 테마

```css
/* 공통 색상 팔레트 */
:root {
  --primary-green: #16a34a;      /* 브랜드 메인 */
  --primary-blue: #2563EB;       /* 액션 버튼 */
  --success-teal: #00d9c8;       /* 성공/구매 버튼 */
  --level-easy: #22c55e;         /* Easy 난이도 */
  --level-normal: #2563EB;       /* Normal 난이도 */
  --level-hard: #ef4444;         /* Hard 난이도 */
  --background: #f3f4f6;         /* 페이지 배경 */
  --text-primary: #111827;       /* 주요 텍스트 */
  --text-secondary: #6b7280;     /* 보조 텍스트 */
}

/* 공통 폰트 */
font-family: "Pretendard Std", "Pretendard", system-ui, -apple-system,
             BlinkMacSystemFont, sans-serif;
```

---

## 6. 실행 가능한 통합 스크립트

### 6.1 핵심 게임 로직 (통합 JavaScript)

```javascript
/**
 * 티켓킹 핵심 게임 로직 통합 모듈
 * @module TicketingGame
 */
const TicketingGame = (function() {
  'use strict';

  // ===== 설정 =====
  const CONFIG = {
    levels: {
      easy:   { duration: 10000, successWindow: 150, queueBase: 50,  queueRate: 50 },
      normal: { duration: 5000,  successWindow: 80,  queueBase: 83,  queueRate: 150 },
      hard:   { duration: 5000,  successWindow: 40,  queueBase: 120, queueRate: 300 }
    },
    preCountNumbers: ['3', '2', '1'],
    queueAnimationDuration: 6500
  };

  // ===== 상태 =====
  let state = {
    level: 'normal',
    category: 'concert',  // concert | goods | restaurant
    hall: 'YES24홀',
    goods: '앨범',
    timerId: null,
    startTime: 0,
    remaining: 0,
    timerEndTime: null,
    isGameActive: false
  };

  // ===== URL 파라미터 처리 =====
  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.level = params.get('level') || 'normal';
    state.hall = params.get('hall') || 'YES24홀';
    state.goods = params.get('goods') || '앨범';
    return state;
  }

  // ===== 프리카운트 (3-2-1) =====
  function runPreCount(callback) {
    const nums = CONFIG.preCountNumbers;
    let i = 0;

    const preCountEl = document.getElementById('pre-count');
    if (!preCountEl) return callback();

    preCountEl.style.display = 'block';
    preCountEl.textContent = nums[i];

    const interval = setInterval(() => {
      i++;
      if (i < nums.length) {
        preCountEl.textContent = nums[i];
      } else {
        clearInterval(interval);
        preCountEl.style.display = 'none';
        callback();
      }
    }, 1000);
  }

  // ===== 메인 타이머 =====
  function startTimer() {
    const config = CONFIG.levels[state.level];
    const timerEl = document.getElementById('ten-timer');
    if (!timerEl) return;

    state.startTime = performance.now();
    state.remaining = config.duration;
    state.timerEndTime = null;
    state.isGameActive = true;

    function tick() {
      const now = performance.now();
      const elapsed = now - state.startTime;
      state.remaining = Math.max(0, config.duration - elapsed);

      // 포맷: Hard는 정수, 나머지는 소수점 2자리
      const seconds = state.remaining / 1000;
      timerEl.textContent = state.level === 'hard'
        ? Math.ceil(seconds).toString()
        : seconds.toFixed(2);

      if (state.remaining <= 0) {
        cancelAnimationFrame(state.timerId);
        state.timerId = null;
        state.timerEndTime = performance.now();
        timerEl.textContent = state.level === 'hard' ? '0' : '0.00';
        // 버튼 펄스 효과
        const btn = document.getElementById('connect-btn');
        if (btn) btn.classList.add('pulse-red');
        return;
      }

      state.timerId = requestAnimationFrame(tick);
    }

    state.timerId = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (state.timerId) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
  }

  // ===== 클릭 타이밍 검증 =====
  function validateClick() {
    const config = CONFIG.levels[state.level];

    // 너무 빠름
    if (state.remaining > config.successWindow) {
      return {
        success: false,
        message: '이런.. 티케팅이 열리기 전에 접속했습니다!'
      };
    }

    // 대기열 계산
    const clickTime = performance.now();
    const endTime = state.timerEndTime || clickTime;
    const extraMs = Math.max(0, clickTime - endTime);
    const extraSec = extraMs / 1000;
    const addedQueue = Math.round(config.queueRate * extraSec);
    const initialQueue = Math.max(0, config.queueBase + addedQueue);

    return {
      success: true,
      queueCount: initialQueue
    };
  }

  // ===== 대기열 애니메이션 =====
  function showQueueModal(initialCount, onComplete) {
    const modal = document.getElementById('queue-modal');
    const countEl = document.getElementById('queue-count');
    const bar = document.getElementById('queue-bar');

    if (!modal || !countEl || !bar) return onComplete();

    modal.style.display = 'flex';
    let queueCount = initialCount;
    const start = performance.now();
    const duration = CONFIG.queueAnimationDuration;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const percent = Math.round(t * 100);
      bar.style.width = percent + '%';
      countEl.textContent = Math.max(0, Math.round(queueCount * (1 - t)));

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(onComplete, 1200);
      }
    }

    requestAnimationFrame(frame);
  }

  // ===== 미션 시스템 (굿즈용) =====
  function generateQuest() {
    const versions = state.goods === '의상'
      ? ['S', 'M', 'L', 'XL']
      : state.goods === '포토카드'
        ? ['Random', 'Member A', 'Member B', 'Member C']
        : ['Random', 'A ver', 'B ver', 'C ver'];

    let requirements = [];
    let objective = '';

    if (state.level === 'easy') {
      requirements = [{ version: '아무 ' + state.goods, count: 1 }];
      objective = `아무 ${state.goods}이나 1개 이상 구매하세요!`;
    } else if (state.level === 'normal') {
      const count = Math.random() < 0.5 ? 1 : 2;
      const version = versions[Math.floor(Math.random() * versions.length)];
      requirements = [{ version, count }];
      objective = `${version} ${state.goods}을 ${count}개 구매하세요!`;
    } else { // hard
      const selected = [];
      while (selected.length < 2) {
        const v = versions[Math.floor(Math.random() * versions.length)];
        if (!selected.includes(v)) selected.push(v);
      }
      requirements = selected.map(v => ({ version: v, count: 1 }));
      objective = `다음 ${state.goods}들을 각각 1개씩 구매하세요!`;
    }

    const questData = { level: state.level, requirements, objective };
    localStorage.setItem('questData', JSON.stringify(questData));

    return questData;
  }

  function getQuest() {
    try {
      return JSON.parse(localStorage.getItem('questData'));
    } catch (e) {
      return null;
    }
  }

  // ===== 사운드 설정 =====
  function isSoundEnabled() {
    return localStorage.getItem('globalSound') !== 'off';
  }

  function toggleSound() {
    const current = localStorage.getItem('globalSound');
    localStorage.setItem('globalSound', current === 'off' ? 'on' : 'off');
    return isSoundEnabled();
  }

  // ===== 공개 API =====
  return {
    init: parseUrlParams,
    runPreCount,
    startTimer,
    stopTimer,
    validateClick,
    showQueueModal,
    generateQuest,
    getQuest,
    isSoundEnabled,
    toggleSound,
    getState: () => ({ ...state }),
    getConfig: (level) => CONFIG.levels[level || state.level]
  };
})();

// 사용 예시:
// TicketingGame.init();
// TicketingGame.runPreCount(() => {
//   TicketingGame.startTimer();
// });
```

---

## 7. 전체 흐름 요약

### 7.1 콘서트 티케팅 플로우

```
[main.html] 인트로/소개
     │
     ▼
[choice.html] 카테고리 선택 → "콘서트" 클릭
     │
     ▼
[hall-choice.html] 공연장 선택 → "YES24홀" 클릭
     │ (다른 홀: 업데이트 예정 모달)
     ▼
[concert-level.html] 난이도 선택 → Easy/Normal/Hard
     │
     ▼
[concert-timer.html] 타이머 게임 시작
     │ ┌─ 3-2-1 카운트다운
     │ ├─ 메인 타이머 (10초 or 5초)
     │ └─ "사이트 접속하기" 버튼
     │
     │ 클릭 타이밍에 따라:
     │ ├─ 너무 빠름 → 실패 메시지
     │ └─ 적절/늦음 → 대기열 모달 → 다음 페이지
     ▼
[ticketingMain.html] 공연 상세 + 날짜 선택
     │ - 아티스트 정보 표시 (난이도별 랜덤)
     │ - 캘린더에서 날짜 선택
     │ - "예매하기" 클릭
     ▼
[yes24hall.html] 좌석 선택
     │ ┌─ 보안문자(CAPTCHA) 입력
     │ ├─ 좌석 맵에서 좌석 클릭
     │ └─ "좌석선택완료" 클릭
     │
     │ 결과:
     ├─ 성공 → 성공 모달
     └─ 실패 (매진) → 실패 모달
              │
              ▼
         [다시하기] / [난이도 선택] / [메인으로]
```

### 7.2 굿즈 구매 플로우

```
[choice.html] → "굿즈" 클릭
     │
     ▼
[goods-choice.html] 굿즈 종류 선택 → 앨범/포토카드/의상
     │
     ▼
[goods-level.html] 난이도 선택
     │
     ▼
[goods-timer.html] 타이머 + 미션 생성
     │ ┌─ 미션 패널 표시 (우상단)
     │ ├─ 타이머 게임
     │ └─ localStorage에 미션 데이터 저장
     ▼
[goods-album/photo/clothes.html] 구매 페이지
     │ ┌─ 상품 이미지/정보
     │ ├─ 버전 선택 + 수량 조절
     │ ├─ 미션 타이머 카운트다운
     │ └─ "구매하기" 버튼
     │
     │ 미션 검증:
     ├─ 성공 (조건 충족) → 성공 모달
     └─ 실패 (시간 초과/조건 미충족) → 실패 모달
```

---

## 8. 기술 스택 요약

| 구분 | 기술 |
|------|------|
| **프론트엔드** | HTML5, CSS3, Vanilla JavaScript |
| **UI 프레임워크** | 없음 (순수 CSS, Flexbox/Grid) |
| **라이브러리** | jQuery 3.6.0 (폴더 B만), localStorage API |
| **상태 관리** | URL Parameters, localStorage |
| **애니메이션** | CSS Animation, requestAnimationFrame |
| **폰트** | Pretendard, Malgun Gothic, system-ui |

---

## 9. 개선 제안

1. **컴포넌트 모듈화**: 공통 헤더, 모달, 버튼을 별도 JS 모듈로 분리
2. **상태 관리**: 전역 상태 객체 또는 간단한 store 패턴 도입
3. **빌드 도구**: Webpack/Vite 도입으로 번들링 및 코드 최적화
4. **반응형 강화**: 모바일 대응 CSS 미디어 쿼리 확장
5. **접근성**: ARIA 레이블 및 키보드 네비게이션 개선
6. **테스트**: Jest 등으로 게임 로직 단위 테스트 추가

---

*문서 작성일: 2025-12-04*
*분석 도구: Claude Code*
