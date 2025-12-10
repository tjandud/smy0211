# TicketPro 프로젝트 문서

## 3줄 요약

1. **TicketPro는 실제 티켓팅 환경을 시뮬레이션하는 웹 기반 연습 플랫폼**으로, 콘서트/굿즈/식당 예약을 난이도별로 연습할 수 있습니다.
2. **Supabase(실시간 DB) + Gemini AI(피드백 분석) + DB 기반 API 키 관리** 기술을 활용하여 사용자 기록 저장, 랭킹 시스템, AI 코칭을 제공합니다.
3. **정밀한 타이머(ms 단위) + 대기열 시뮬레이션 + 보안문자 + AI/친구 대결 모드**로 실제 티켓팅과 동일한 긴장감을 재현합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [핵심 기능 상세](#4-핵심-기능-상세)
5. [데이터베이스 구조](#5-데이터베이스-구조)
6. [API 연동 방식](#6-api-연동-방식)
7. [페이지별 기능 설명](#7-페이지별-기능-설명)
8. [대결 모드 시스템](#8-대결-모드-시스템) **[NEW]**
9. [추가된 기능 목록](#9-추가된-기능-목록)
10. [다른 프로젝트 적용 가이드](#10-다른-프로젝트-적용-가이드)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 소개

**TicketPro**는 실제 티켓 예매 환경을 시뮬레이션하여 사용자가 티켓팅 스킬을 연습할 수 있는 웹 애플리케이션입니다.

### 1.2 주요 목표

- 실제 티켓팅과 동일한 타이밍 연습
- 난이도별 단계적 학습
- AI 기반 개인 맞춤 피드백
- 경쟁을 통한 동기 부여 (랭킹 시스템)

### 1.3 모듈 구성

| 모듈 | 경로 | 설명 |
|------|------|------|
| **Folder A** | `/a/` | AI 채팅 시스템 + 메인 랜딩 페이지 |
| **Folder B** | `/b/` | 멜론티켓 클론 (결제 UI) |
| **Folder C** | `/c/test_ticket/` | TicketPro 메인 (티케팅 시뮬레이터) |

---

## 2. 기술 스택

### 2.1 프론트엔드

| 기술 | 용도 | 버전 |
|------|------|------|
| **HTML5** | 마크업 | - |
| **CSS3** | 스타일링 (Grid, Flexbox, 애니메이션) | - |
| **Vanilla JavaScript** | 게임 로직, API 연동 | ES6+ |
| **Google Fonts** | 웹폰트 (Inter, Noto Sans KR) | - |
| **SweetAlert2** | 모달/알림 UI | CDN |

### 2.2 백엔드 서비스

| 서비스 | 용도 | 특징 |
|------|------|------|
| **Supabase** | 실시간 데이터베이스 | PostgreSQL 기반, 실시간 구독 지원 |
| **Gemini API** | AI 피드백 분석 | gemini-2.5-flash 모델 사용 |

### 2.3 상태 관리

| 저장소 | 용도 | 지속성 |
|--------|------|--------|
| **sessionStorage** | 로그인 정보 (userId, nickname) | 탭 닫으면 삭제 |
| **localStorage** | 게임 데이터 (`ticketpro_feedback_data`) | 영구 저장 |
| **URL Parameters** | 페이지 간 데이터 전달 | 일회성 |

### 2.4 보안

| 기술 | 용도 |
|------|------|
| **SHA-256 해시** | 관리자 비밀번호 검증 |
| **API 키 마스킹** | 키 값 중간 부분 숨김 처리 |
| **DB 기반 키 저장** | API 키를 Supabase에 안전하게 저장 |

---

## 3. 프로젝트 구조

```
ticketpro-main/
├── a/                              # AI 채팅 + 메인 페이지
│   ├── index.html                 # 메인 랜딩 페이지 (3D 카드 UI) [UPDATED - 별 애니메이션 로고]
│   └── chat.html                  # AI 채팅 (Gemini 2.5 Flash)
│
├── b/                              # 멜론티켓 클론
│   └── payment.html               # 결제 페이지 UI
│
├── c/test_ticket/                  # TicketPro 메인
│   ├── main-pages/                # 메인 페이지들
│   │   ├── login.html            # 로그인 (닉네임 입력) [UPDATED - 메인으로 리다이렉트]
│   │   ├── choice.html           # 카테고리 선택 [UPDATED - 별 애니메이션 로고]
│   │   ├── ranking.html          # 순위표 [UPDATED - 별 애니메이션 로고]
│   │   ├── chat.html             # 실시간 채팅 [UPDATED - 별 애니메이션 로고]
│   │   └── ai-feedback.html      # AI 피드백 [UPDATED - 별 애니메이션 로고]
│   │
│   ├── admin/                     # 관리자 페이지
│   │   └── key-manager.html      # API 키 관리 페이지
│   │
│   ├── battle-pages/              # 대결 모드 [NEW]
│   │   ├── battle-mode.html      # 대결 모드 선택 (AI/친구)
│   │   ├── ai-select.html        # AI 난이도 선택
│   │   ├── ai-battle-game.html   # AI 대결 게임
│   │   ├── friend-lobby.html     # 친구 대결 로비 (방 생성/참가)
│   │   └── friend-battle-game.html # 친구 대결 게임
│   │
│   ├── concert-pages/             # 콘서트 티켓팅
│   │   ├── hall-choice.html      # 공연장 선택 [UPDATED - 별 애니메이션 로고]
│   │   ├── concert-level.html    # 난이도 선택 [UPDATED - 별 애니메이션 로고]
│   │   ├── concert-timer.html    # 타이머 게임 [UPDATED - 별 애니메이션 로고]
│   │   ├── ticketingMain.html    # 공연 정보 + 날짜 선택
│   │   └── yes24hall.html        # 좌석 선택 + 보안문자
│   │
│   ├── goods-pages/               # 굿즈 구매
│   │   ├── goods-choice.html     # 굿즈 종류 선택 [UPDATED - 별 애니메이션 로고]
│   │   ├── goods-level.html      # 난이도 선택 [UPDATED - 별 애니메이션 로고]
│   │   ├── goods-timer.html      # 타이머 + 미션 생성
│   │   ├── goods-album.html      # 앨범 구매
│   │   ├── goods-photo.html      # 포토카드 구매
│   │   └── goods-clothes.html    # 의상 구매
│   │
│   ├── restaurant-pages/          # 식당 예약
│   │   ├── restaurant-level.html # 난이도 선택 [UPDATED - 별 애니메이션 로고]
│   │   └── restaurant-timer.html # 타이머
│   │
│   ├── js/
│   │   ├── supabase-config.js    # Supabase 설정 + API 함수
│   │   ├── api-manager.js        # API 키 관리 모듈
│   │   ├── ai-battle.js          # AI 대결 로직 [NEW]
│   │   ├── friend-battle.js      # 친구 대결 로직 [NEW]
│   │   └── battle-game-engine.js # 대결 게임 엔진 [NEW]
│   │
│   ├── common/
│   │   └── theme.css             # 공통 스타일
│   │
│   └── image/                     # 이미지 리소스
│       ├── concert/              # 아티스트 이미지
│       ├── goods/                # 굿즈 이미지
│       └── restaurant/           # 식당 이미지
│
├── TICKETPRO_DOCUMENTATION.md     # 이 문서
└── 가상대결.MD                     # 가상 대결 구현 계획서
```

---

## 4. 핵심 기능 상세

### 4.1 사용자 인증 시스템

**작동 방식:**
1. 사용자가 닉네임 입력
2. Supabase RPC `check_nickname_exists` 호출하여 중복 체크
3. `login_or_create` 호출하여 로그인/회원가입 처리
4. `sessionStorage`에 userId, nickname 저장
5. 로그인 상태 유지 (탭 닫기 전까지)

```javascript
// 로그인 함수
async function loginOrCreate(nickname) {
    const { data, error } = await supabase
        .rpc('login_or_create', { input_nickname: nickname });

    sessionStorage.setItem('userId', data);
    sessionStorage.setItem('nickname', nickname);
    return data;
}
```

### 4.2 API 키 관리 시스템 [NEW]

**특징:**
- Supabase `api_keys` 테이블에 API 키 저장
- SHA-256 해시로 관리자 비밀번호 검증
- 키 값 마스킹 (중간 부분 숨김)
- 활성화/비활성화 토글

**구현:**
```javascript
// API 키 조회
async function getApiKey(keyName) {
    const { data, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('key_name', keyName)
        .eq('is_active', true)
        .single();
    return data?.key_value || null;
}

// 비밀번호 해시 검증
async function verifyAdminPassword(password) {
    const hash = await hashPassword(password);
    return hash === ADMIN_PASSWORD_HASH;
}
```

### 4.3 타이머 게임 엔진

**정밀 타이머 구현:**
- `performance.now()` 사용 (ms 단위 정밀도)
- `requestAnimationFrame` 으로 60fps 업데이트
- 드리프트 없는 정확한 시간 측정

**난이도별 설정:**

| 난이도 | 타이머 | 성공 윈도우 | 대기열 기본 | 대기열 증가율 |
|--------|--------|-----------|------------|--------------|
| 쉬움 | 10초 | 150ms | 50명 | 50명/초 |
| 보통 | 5초 | 80ms | 83명 | 150명/초 |
| 어려움 | 5초 | 40ms | 120명 | 300명/초 |

### 4.4 순위표 시스템 [UPDATED]

**표시 정보 (5열):**
- 순위 (1~3위: 메달 아이콘)
- 플레이어 닉네임
- 기록 시간
- 카테고리 배지 (콘서트/굿즈/식당)
- 날짜

**카테고리 배지 색상:**
| 카테고리 | 배경색 | 텍스트색 |
|----------|--------|----------|
| 콘서트 | 보라색 (`#8b5cf6`) | 밝은 보라 |
| 굿즈 | 파란색 (`#3b82f6`) | 밝은 파랑 |
| 식당 | 주황색 (`#f97316`) | 밝은 주황 |

**난이도 배지 색상:**
| 난이도 | 배경색 | 텍스트색 |
|--------|--------|----------|
| 쉬움 | 녹색 (`#22c55e`) | 밝은 녹색 |
| 보통 | 노란색 (`#eab308`) | 밝은 노랑 |
| 어려움 | 빨간색 (`#ef4444`) | 밝은 빨강 |

### 4.5 AI 피드백 시스템 [UPDATED]

**데이터 흐름:**
1. 게임 완료 시 `localStorage.setItem('ticketpro_feedback_data', ...)` 저장
2. ai-feedback.html에서 `localStorage.getItem('ticketpro_feedback_data')` 로드
3. DB에서 API 키 동적 로드: `await getApiKey('gemini')`
4. Gemini API 호출하여 분석 결과 생성

**분석 항목:**
- 종합 점수 (0-100점)
- 종합 평가
- 잘한 점 (3가지)
- 개선할 점 (2가지)
- 실전 팁
- 다음 목표

---

## 5. 데이터베이스 구조

### 5.1 Supabase 테이블

**users (사용자)**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | UUID | 기본키 |
| nickname | VARCHAR | 닉네임 (고유) |
| created_at | TIMESTAMP | 가입일 |

**booking_records (예매 기록)**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본키 |
| user_id | UUID | 사용자 ID (FK) |
| category | VARCHAR | 카테고리 (콘서트/굿즈/식당) |
| difficulty | VARCHAR | 난이도 (쉬움/보통/어려움) |
| elapsed_time | INTEGER | 소요 시간 (ms) |
| selection_data | JSON | 추가 데이터 |
| created_at | TIMESTAMP | 기록 시간 |

**api_keys (API 키 저장) [NEW]**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본키 |
| key_name | VARCHAR | 키 이름 (gemini, openai 등) |
| key_value | TEXT | 실제 API 키 값 |
| description | TEXT | 키 설명 |
| is_active | BOOLEAN | 활성화 상태 |
| created_at | TIMESTAMP | 생성일 |
| updated_at | TIMESTAMP | 수정일 |

**chat_rooms (채팅방)**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본키 |
| name | VARCHAR | 채팅방 이름 |
| is_active | BOOLEAN | 활성화 상태 |

**chat_messages (채팅 메시지)**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본키 |
| room_id | UUID | 채팅방 ID |
| user_id | UUID | 사용자 ID |
| nickname | VARCHAR | 닉네임 |
| message | TEXT | 메시지 내용 |
| created_at | TIMESTAMP | 전송 시간 |

### 5.2 api_keys 테이블 생성 SQL

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(50) UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_api_keys_name ON api_keys(key_name);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
```

---

## 6. API 연동 방식

### 6.1 Supabase 연동

**초기화:**
```javascript
const SUPABASE_URL = 'https://klcceivyqgqbpjdwlnvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**랭킹 조회 (카테고리/난이도 포함):**
```javascript
async function getRanking(category, difficulty, limit = 10) {
    // 영어→한글 변환
    const categoryMap = {
        'concert': '콘서트', 'goods': '굿즈', 'restaurant': '식당'
    };
    const difficultyMap = {
        'easy': '쉬움', 'normal': '보통', 'hard': '어려움'
    };

    const { data, error } = await supabase
        .from('booking_records')
        .select(`
            id, user_id, category, difficulty, elapsed_time, created_at,
            users!inner(nickname)
        `)
        .eq('category', categoryMap[category] || category)
        .eq('difficulty', difficultyMap[difficulty] || difficulty)
        .order('elapsed_time', { ascending: true })
        .limit(limit);

    return data.map(item => ({
        ...item,
        nickname: item.users?.nickname || '알 수 없음'
    }));
}
```

### 6.2 Gemini AI 연동 (DB 기반)

**API 키 동적 로드:**
```javascript
// DB에서 API 키 가져오기
let API_KEY = null;

async function loadApiKey() {
    API_KEY = await getApiKey('gemini');
    if (!API_KEY) {
        console.error('Gemini API 키를 찾을 수 없습니다.');
    }
}

// 페이지 로드 시 호출
document.addEventListener('DOMContentLoaded', loadApiKey);
```

**AI 요청:**
```javascript
async function getAIFeedback(gameData) {
    // API 키가 없으면 먼저 로드
    if (!API_KEY) {
        API_KEY = await getApiKey('gemini');
        if (!API_KEY) {
            throw new Error('API 키를 불러올 수 없습니다.');
        }
    }

    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        })
    });

    return await response.json();
}
```

---

## 7. 페이지별 기능 설명

### 7.1 메인 페이지 (a/index.html)

- 3D 카드 레이아웃 UI
- Spline 3D 배경 애니메이션
- TODAY 플레이 통계 (실시간 DB 연동)
- 카테고리 소개 카드
- **관리자 페이지 바로가기 버튼** [NEW]

### 7.2 AI 채팅 (a/chat.html) [UPDATED]

- Gemini 2.5 Flash 기반 대화
- **DB에서 API 키 동적 로드**
- 다양한 페르소나 선택 가능
- 티켓팅 관련 질문/답변

### 7.3 API 키 관리자 (admin/key-manager.html) [NEW]

- 관리자 비밀번호 인증
- API 키 목록 조회 (마스킹 처리)
- 새 API 키 추가/수정
- API 키 삭제 (비활성화/완전 삭제)
- 키 유효성 검사 (형식 체크)

### 7.4 순위표 (ranking.html) [UPDATED]

- 카테고리/난이도 필터
- **카테고리 배지** (콘서트/굿즈/식당)
- **난이도 배지** (쉬움/보통/어려움)
- 메달 표시 (1~3위)
- 내 기록 강조

### 7.5 AI 피드백 (ai-feedback.html) [UPDATED]

- **올바른 localStorage 키 사용** (`ticketpro_feedback_data`)
- **DB에서 API 키 동적 로드**
- 실제 게임 데이터 기반 메트릭스 표시
- Gemini AI 코칭

---

## 8. 대결 모드 시스템 [NEW]

### 8.1 개요

TicketPro에 추가된 실시간 대결 기능으로, AI 또는 친구와 티켓팅 스킬을 겨룰 수 있습니다.

### 8.2 대결 모드 종류

| 모드 | 설명 | 특징 |
|------|------|------|
| **AI 대결** | AI와 1:1 대결 | 난이도별 AI (쉬움/보통/어려움) |
| **친구 대결** | 실시간 친구 대결 | 방 생성/참가, 실시간 동기화 |

### 8.3 AI 대결 시스템

**AI 난이도별 특성:**

| 난이도 | 반응속도 | 실수율 | 설명 |
|--------|---------|--------|------|
| 쉬움 | 800-1200ms | 30% | 초보자용 AI |
| 보통 | 400-700ms | 15% | 중급자용 AI |
| 어려움 | 150-350ms | 5% | 고수용 AI |

**구현 기술:**
```javascript
// AI 반응 시뮬레이션
class AIPlayer {
    constructor(difficulty) {
        this.config = AI_CONFIGS[difficulty];
    }

    async react() {
        const delay = this.randomInRange(
            this.config.minReaction,
            this.config.maxReaction
        );
        await this.sleep(delay);

        // 실수 확률 체크
        if (Math.random() < this.config.mistakeRate) {
            return { success: false, time: delay + 500 };
        }
        return { success: true, time: delay };
    }
}
```

### 8.4 친구 대결 시스템

**실시간 동기화:**
- Supabase Realtime을 활용한 실시간 게임 상태 동기화
- 방 생성/참가 시스템
- 게임 시작 카운트다운 동기화

**방 상태 관리:**
```javascript
// 방 상태 구독
const channel = supabase
    .channel(`battle-room-${roomId}`)
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_rooms',
        filter: `id=eq.${roomId}`
    }, handleRoomUpdate)
    .subscribe();
```

**승패 결정 로직:**
- 두 플레이어 모두 게임 완료 시 시간 비교
- 빠른 시간 = 승리
- 동점 시 먼저 완료한 플레이어 승리

### 8.5 대결 페이지 구성

| 페이지 | 경로 | 기능 |
|--------|------|------|
| battle-mode.html | 대결 모드 선택 | AI/친구 선택 화면 |
| ai-select.html | AI 난이도 선택 | 쉬움/보통/어려움 선택 |
| ai-battle-game.html | AI 대결 게임 | 실제 대결 진행 |
| friend-lobby.html | 친구 대결 로비 | 방 생성/참가 |
| friend-battle-game.html | 친구 대결 게임 | 실시간 대결 진행 |

### 8.6 관련 JavaScript 모듈

| 파일 | 역할 |
|------|------|
| ai-battle.js | AI 플레이어 로직, 난이도 설정 |
| friend-battle.js | 친구 대결 실시간 동기화 |
| battle-game-engine.js | 공통 게임 엔진 |

---

## 9. 추가된 기능 목록

### 9.1 2025-12-10 (1차) 추가/수정 내역

| 기능 | 파일 | 설명 |
|------|------|------|
| **API 키 관리 시스템** | api-manager.js, key-manager.html | DB 기반 API 키 관리 |
| **관리자 인증** | api-manager.js | SHA-256 해시 비밀번호 검증 |
| **API 키 마스킹** | api-manager.js | 키 값 중간 부분 숨김 (6자...4자) |
| **동적 API 키 로드** | ai-feedback.html, chat.html | DB에서 Gemini 키 로드 |
| **localStorage 키 수정** | ai-feedback.html | `ticketingResult` → `ticketpro_feedback_data` |
| **랜덤 메트릭스 제거** | ai-feedback.html | 실제 데이터 없으면 "-" 표시 |
| **카테고리 배지** | ranking.html | 콘서트/굿즈/식당 색상 배지 |
| **난이도 배지** | ranking.html | 쉬움/보통/어려움 색상 배지 |
| **전체 기록 조회** | supabase-config.js | `getAllRecords()` 함수 추가 |
| **랭킹 쿼리 수정** | supabase-config.js | RPC → 직접 쿼리 (카테고리/난이도 포함) |
| **관리자 버튼** | a/index.html | 메인 페이지에 관리자 바로가기 |
| **가상 대결 계획서** | 가상대결.MD | AI/친구 대결 모드 구현 계획 |

### 9.2 2025-12-10 (2차) 추가/수정 내역 [NEW]

#### 🎮 대결 모드 시스템 (신규)

| 기능 | 파일 | 설명 |
|------|------|------|
| **대결 모드 선택** | battle-mode.html | AI/친구 대결 선택 화면 |
| **AI 난이도 선택** | ai-select.html | 쉬움/보통/어려움 AI 선택 |
| **AI 대결 게임** | ai-battle-game.html | AI와 실시간 대결 |
| **친구 대결 로비** | friend-lobby.html | 방 생성/참가 시스템 |
| **친구 대결 게임** | friend-battle-game.html | 실시간 친구 대결 |
| **AI 대결 로직** | ai-battle.js | AI 플레이어 클래스, 난이도 설정 |
| **친구 대결 로직** | friend-battle.js | Supabase Realtime 동기화 |
| **게임 엔진** | battle-game-engine.js | 공통 대결 게임 엔진 |

#### 🎨 UI/UX 개선 (별 애니메이션 로고)

| 파일 | 변경 내용 |
|------|----------|
| a/index.html | 별 애니메이션 로고 (호버 시 별이 흩날림) |
| ranking.html | 별 애니메이션 로고 적용 |
| chat.html | 별 애니메이션 로고 적용 |
| choice.html | 별 애니메이션 로고 적용 |
| ai-feedback.html | 별 애니메이션 로고 적용 |
| battle-mode.html | 별 애니메이션 로고 적용 |
| ai-select.html | 별 애니메이션 로고 적용 |
| friend-lobby.html | 별 애니메이션 로고 적용 |
| hall-choice.html | 별 애니메이션 로고 적용 |
| concert-level.html | 별 애니메이션 로고 적용 |
| concert-timer.html | 별 애니메이션 로고 적용 |
| goods-choice.html | 별 애니메이션 로고 적용 |
| goods-level.html | 별 애니메이션 로고 적용 |
| restaurant-level.html | 별 애니메이션 로고 적용 |

#### 🔧 네비바 통일 및 버그 수정

| 파일 | 변경 내용 |
|------|----------|
| login.html | 로그인 후 메인(a/index.html)으로 리다이렉트 |
| a/index.html | 비로그인 시 대결 버튼 제거 |
| ranking.html | 깨진 `userInfo` 요소 참조 제거 |
| chat.html | 깨진 `userInfo` 요소 참조 제거 |
| 전체 페이지 | 로고 클릭 시 메인으로 이동 (경로 통일) |

### 9.3 기술적 변경사항

| 변경 | 이전 | 이후 |
|------|------|------|
| API 키 저장 | 하드코딩 | Supabase DB |
| localStorage 키 | `ticketingResult` | `ticketpro_feedback_data` |
| 랭킹 조회 | RPC 함수 | 직접 Supabase 쿼리 |
| 메트릭스 | `Math.random()` | 실제 데이터 or "-" |
| Gemini 모델 | 2.0-flash | 2.5-flash |
| 로고 스타일 | 텍스트만 | SVG 별 애니메이션 |
| 네비바 | 페이지별 다름 | 통일된 스타일 |

### 9.4 보안 개선사항

- API 키가 코드에 노출되지 않음
- 관리자 비밀번호 해시 검증
- API 키 마스킹으로 전체 키 숨김

---

## 10. 다른 프로젝트 적용 가이드

### 10.1 Supabase 설정

**1. 프로젝트 생성:**
```
1. https://supabase.com 접속
2. New Project 클릭
3. 프로젝트 이름, 비밀번호 설정
4. Region: Northeast Asia (Seoul) 선택
```

**2. 테이블 생성 (SQL Editor):**
```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API 키 테이블
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(50) UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. 클라이언트 설정:**
```html
<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>
```

### 10.2 API 키 관리 시스템 적용

**1. api-manager.js 복사:**
```javascript
// 관리자 비밀번호 해시 변경 (SHA-256)
// 새 비밀번호의 해시값 생성:
const encoder = new TextEncoder();
const data = encoder.encode('your-password');
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
console.log(hash); // 이 값을 ADMIN_PASSWORD_HASH에 설정
```

**2. key-manager.html 수정:**
- Supabase URL/Key 변경
- 스타일 커스터마이징

**3. API 키 사용 페이지에서:**
```javascript
// api-manager.js 로드
<script src="../js/api-manager.js"></script>

// API 키 가져오기
const apiKey = await getApiKey('gemini');
```

### 10.3 실시간 채팅 적용

**1. Realtime 활성화:**
```sql
-- Supabase Dashboard > Database > Replication
-- 테이블 체크박스 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

**2. 채널 구독:**
```javascript
const channel = supabase
    .channel(`chat-${roomId}`)
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
    }, (payload) => {
        displayMessage(payload.new);
    })
    .subscribe();
```

### 10.4 Gemini AI 연동

**1. API 키 발급:**
```
1. https://aistudio.google.com 접속
2. Get API Key 클릭
3. Create API key in new project
4. 키 복사하여 DB에 저장
```

**2. 요청 형식:**
```javascript
const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: 'Your prompt here' }] }]
        })
    }
);

const data = await response.json();
const text = data.candidates[0].content.parts[0].text;
```

### 10.5 정밀 타이머 구현

```javascript
class PrecisionTimer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration;
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.startTime = null;
        this.animationId = null;
    }

    start() {
        this.startTime = performance.now();
        this.tick();
    }

    tick() {
        const elapsed = performance.now() - this.startTime;
        const remaining = Math.max(0, this.duration - elapsed);

        this.onTick(remaining);

        if (remaining > 0) {
            this.animationId = requestAnimationFrame(() => this.tick());
        } else {
            this.onComplete();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// 사용 예시
const timer = new PrecisionTimer(
    5000, // 5초
    (remaining) => display.textContent = (remaining / 1000).toFixed(2),
    () => alert('시간 종료!')
);
timer.start();
```

### 10.6 카테고리/난이도 배지 CSS

```css
/* 카테고리 배지 */
.category-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

.category-badge.concert {
    background: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
}

.category-badge.goods {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
}

.category-badge.restaurant {
    background: rgba(249, 115, 22, 0.2);
    color: #fb923c;
}

/* 난이도 배지 */
.difficulty-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

.difficulty-badge.easy {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
}

.difficulty-badge.normal {
    background: rgba(234, 179, 8, 0.2);
    color: #facc15;
}

.difficulty-badge.hard {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
}
```

### 10.7 별 애니메이션 로고 CSS [NEW]

```css
/* 로고 컨테이너 */
.nav-logo {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    padding: 10px 24px;
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%);
    border: 2px solid #a78bfa;
    border-radius: 12px;
    box-shadow: 0 0 0 rgba(139, 92, 246, 0.5);
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    overflow: visible;
}

.nav-logo:hover {
    background: transparent;
    box-shadow: 0 0 25px rgba(139, 92, 246, 0.6);
}

/* 로고 텍스트 */
.nav-logo-text {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    z-index: 2;
    transition: all 0.3s ease;
}

.nav-logo:hover .nav-logo-text {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* 별 애니메이션 */
.nav-logo .star {
    position: absolute;
    width: 20px;
    height: auto;
    filter: drop-shadow(0 0 0 #e0d4ff);
    z-index: -5;
    transition: all 1s cubic-bezier(0.05, 0.83, 0.43, 0.96);
}

.nav-logo .star svg { width: 100%; height: 100%; }

/* 별 초기 위치 */
.nav-logo .star-1 { top: 50%; left: 20%; width: 18px; transform: translateY(-50%); }
.nav-logo .star-2 { top: 50%; left: 50%; width: 12px; transform: translate(-50%, -50%); }
.nav-logo .star-3 { top: 50%; left: 35%; width: 6px; transform: translateY(-50%); }
.nav-logo .star-4 { top: 50%; left: 65%; width: 8px; transform: translateY(-50%); }
.nav-logo .star-5 { top: 50%; left: 75%; width: 14px; transform: translateY(-50%); }
.nav-logo .star-6 { top: 50%; left: 85%; width: 5px; transform: translateY(-50%); }

/* 호버 시 별 흩날림 효과 */
.nav-logo:hover .star-1 { top: -60%; left: -15%; width: 22px; filter: drop-shadow(0 0 10px #c4b5fd); z-index: 2; }
.nav-logo:hover .star-2 { top: -30%; left: 5%; width: 14px; filter: drop-shadow(0 0 10px #a78bfa); z-index: 2; }
.nav-logo:hover .star-3 { top: 70%; left: 15%; width: 6px; filter: drop-shadow(0 0 8px #ec4899); z-index: 2; }
.nav-logo:hover .star-4 { top: 20%; left: 90%; width: 10px; filter: drop-shadow(0 0 10px #c4b5fd); z-index: 2; }
.nav-logo:hover .star-5 { top: -40%; left: 105%; width: 16px; filter: drop-shadow(0 0 12px #a78bfa); z-index: 2; }
.nav-logo:hover .star-6 { top: 80%; left: 95%; width: 6px; filter: drop-shadow(0 0 8px #ec4899); z-index: 2; }

.star-fill { fill: #e0d4ff; }
```

**별 SVG HTML:**
```html
<a href="index.html" class="nav-logo">
    <span class="nav-logo-text">TicketPro</span>
    <div class="star star-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53">
            <path class="star-fill" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"/>
        </svg>
    </div>
    <!-- star-2 ~ star-6 동일한 SVG 구조 -->
</a>
```

---

## 부록: 주요 코드 스니펫

### A. SHA-256 해시 함수
```javascript
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### B. API 키 마스킹
```javascript
function maskApiKey(key) {
    if (!key || key.length < 10) return '********';
    const start = key.substring(0, 6);
    const end = key.substring(key.length - 4);
    return `${start}${'*'.repeat(key.length - 10)}${end}`;
}
// 예: "AIzaSyC26pMkzOZD1AtfZOQf4-5jkezrgW6yW98"
// 결과: "AIzaSy**************************yW98"
```

### C. 카테고리/난이도 한글 변환
```javascript
function getCategoryKorean(category) {
    const map = { 'concert': '콘서트', 'goods': '굿즈', 'restaurant': '식당' };
    return map[category] || category;
}

function getDifficultyKorean(difficulty) {
    const map = { 'easy': '쉬움', 'normal': '보통', 'hard': '어려움' };
    return map[difficulty] || difficulty;
}
```

### D. 전체 기록 조회
```javascript
async function getAllRecords(limit = 50) {
    const { data, error } = await supabase
        .from('booking_records')
        .select(`
            id, user_id, category, difficulty, elapsed_time, created_at,
            users!inner(nickname)
        `)
        .order('elapsed_time', { ascending: true })
        .limit(limit);

    return data.map(item => ({
        ...item,
        nickname: item.users?.nickname || '알 수 없음'
    }));
}
```

---

## 작성 정보

- **최종 수정일**: 2025년 12월 10일
- **프로젝트**: TicketPro 티켓팅 시뮬레이터
- **GitHub**: https://github.com/tjandud/smy0211
- **배포 URL**: https://tjandud.github.io/smy0211/

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-09 | 1.0 | 초기 문서 작성 |
| 2025-12-10 | 2.0 | API 키 관리 시스템, 랭킹 배지, 다른 프로젝트 적용 가이드 추가 |
| 2025-12-10 | 3.0 | **[NEW]** 대결 모드 시스템 (AI/친구), 별 애니메이션 로고, 네비바 통일, 버그 수정 |
