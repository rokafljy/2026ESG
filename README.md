# GRADE UP — KCGS ESG 평가대응 AI SaaS

> **"보고서 하나로, 등급이 보입니다"**
>
> 기업이 지속가능경영보고서 PDF를 업로드하면, AI가 KCGS(한국ESG기준원) 평가지표 24개의
> 충족 여부를 진단하고 만점 달성 개선과제를 우선순위(등급효과×난이도)로 제시하는 구독형 SaaS.

모든 결과는 *KCGS 모범규준 공개체계 기반 자체 모의진단이며 공식 평가와 다를 수 있습니다.*

## 기능

| 화면 | 경로 | 설명 |
|---|---|---|
| 랜딩 | `/` | 서비스 소개 + 로그인/가입 CTA |
| 대시보드 | `/app` | 모의등급 도넛, E·S·G 게이지, 판정 카운트, Quick Win TOP 5 |
| 새 진단 | `/app/new` | 기업명 + PDF 업로드(30MB) → 5단계 분석 진행 표시 |
| 지표별 진단 | `/app/indicators` | 24개 지표 아코디언, 필터 칩, 판정 배지·근거·갭·개선과제 |
| 개선 로드맵 | `/app/roadmap` | Quick Win / 체계구축 / 인증·시스템 3단계, 체크박스 이행 관리 |

- **AI 파이프라인**: E·S·G 카테고리별 Anthropic API(`claude-sonnet-4-6`) 호출 → 지표별 판정
  (충족/부분충족/미충족/확인불가) + 근거 + 갭 + 개선과제 2~3개
- **모의등급**: 충족=100 / 부분충족=50 / 미충족·확인불가=0 평균 → 85↑ A+, 70↑ A, 55↑ B+, 40↑ B, 25↑ C, 미만 D
- **우선순위 점수**: `impact×10 − effort×3 + (미충족 +5, 부분충족 +3)`
- **플랜**: free(진단 1회) / basic(연 2회) / pro(무제한). 결제 미구현 —
  관리자가 Firestore `users/{uid}.plan` 을 수동 변경 (Security Rules 로 클라이언트 변경 차단)

## 기술 스택

Next.js 14 (App Router, TypeScript) · Tailwind CSS (Pretendard) · Firebase (Auth / Firestore / Storage) · Anthropic API (서버 사이드 전용) · Netlify

## 로컬 실행

### 1. Firebase 프로젝트 준비

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. **Authentication** → 로그인 방법에서 `이메일/비밀번호`, `Google` 활성화
3. **Firestore Database** 생성 (프로덕션 모드)
4. **Storage** 활성화
5. 프로젝트 설정 → 일반 → 웹 앱 추가 → SDK 구성값 확보 (`NEXT_PUBLIC_FIREBASE_*`)
6. 프로젝트 설정 → 서비스 계정 → **새 비공개 키 생성** (JSON) — 서버용 (`FIREBASE_*`)

### 2. 환경변수

```bash
cp .env.example .env.local
# .env.local 에 Firebase 클라이언트/서비스 계정 값과 ANTHROPIC_API_KEY 를 채우세요.
# FIREBASE_PRIVATE_KEY 는 줄바꿈을 \n 으로 이스케이프한 한 줄 문자열로 넣습니다.
```

### 3. Security Rules · 인덱스 배포

```bash
npm install -g firebase-tools
firebase login
firebase use <프로젝트ID>
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 4. 개발 서버

```bash
npm install
npm run dev   # http://localhost:3000
```

### 5. 확인 포인트

- 가입 → `users/{uid}` 문서 생성(plan: free), `/app` 진입
- `/app/new` 에서 PDF 업로드 → 5단계(보고서 인식 → E → S → G → 우선순위) 진행
- free 플랜 2번째 진단 시도 → "무료 플랜은 진단을 1회만…" 403 메시지
- 대시보드 등급/게이지/카운트(합계 24), 지표 필터, 로드맵 체크박스 새로고침 후 유지
- `/app/indicators` 의 **리포트 인쇄** 버튼 → 인쇄 미리보기에서 사이드바 숨김 + 아코디언 전체 펼침

## Netlify 배포

1. GitHub 저장소를 Netlify 에 연결 (빌드 설정은 `netlify.toml` 이 자동 적용)
2. Site settings → Environment variables 에 `.env.example` 의 **모든 변수** 등록
   - `FIREBASE_PRIVATE_KEY` 는 `\n` 이스케이프 형태 그대로 붙여넣기
3. 배포 후 Firebase 콘솔 → Authentication → 설정 → **승인된 도메인**에 Netlify 도메인 추가
4. 프로덕션에서 가입 → 진단 E2E 확인

```bash
# CLI 배포를 선호하면:
npm install -g netlify-cli
netlify init && netlify deploy --build --prod
```

## 아키텍처 메모

- **분석 오케스트레이션**: 클라이언트(`/app/new`)가 `POST /api/assessments`(생성·플랜 검증) 후
  `POST /api/analyze` 를 `E → S → G → finalize` 순서로 호출. 각 호출은 Anthropic 1회로 제한되어
  서버리스 함수 타임아웃을 피하고, 진행 5단계 UI와 1:1 대응합니다. 각 단계는 멱등이라 실패 지점부터 재시도 가능.
- **보안 경계**: 클라이언트는 본인 문서 읽기 + `users` 프로필(plan 제외) + 지표 `actions`(체크박스)만
  쓰기 가능. 진단 생성·판정·점수 기록은 Admin SDK 를 쓰는 API Route 전용 → 플랜 제한·점수 변조 불가.
- **지표 라이브러리**: `lib/indicators.ts` 에 24개 지표와 만점기준이 상수로 분리되어 있어
  KCGS 개정 시 이 파일만 수정하면 됩니다.
