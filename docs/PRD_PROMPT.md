# MVP PRD 생성 메타 프롬프트
# Notion 견적서 → 웹 뷰어 + PDF 다운로드

---

## 사용 방법

아래 `---PROMPT START---` 와 `---PROMPT END---` 사이의 내용을 Claude Code에 그대로 붙여넣으세요.  
`[대괄호]` 로 표시된 항목은 실제 값으로 교체한 뒤 실행하세요.

---PROMPT START---

당신은 시니어 프로덕트 매니저 겸 풀스택 아키텍트입니다.  
아래 제품 컨텍스트를 읽고, **실행 가능한 MVP PRD 문서**를 `docs/PRD.md` 에 작성하세요.

## 제품 컨텍스트

### 핵심 가치 제안
프리랜서 또는 소규모 사업자가 Notion에서 견적서를 작성하면,  
고유 URL을 통해 클라이언트가 웹에서 깔끔하게 확인하고 PDF로 다운로드할 수 있다.

### 기술 스택 (변경 불가)
- **프레임워크**: Next.js 16.x (App Router), TypeScript
- **스타일**: Tailwind CSS v4, shadcn/ui
- **데이터 소스**: Notion API (공식 `@notionhq/client`)
- **PDF 생성**: `@react-pdf/renderer` 또는 `puppeteer` (트레이드오프 분석 후 결정)
- **배포 타깃**: Vercel

### 사용자 유형
1. **작성자(Author)**: 프리랜서 또는 사업자 — Notion에서 견적서 작성
2. **수신자(Recipient)**: 클라이언트 — 링크를 받아 웹에서 확인 및 PDF 저장

### 핵심 플로우 (Happy Path)
1. 작성자가 Notion 데이터베이스에 견적서 페이지를 작성한다.
2. 시스템이 해당 페이지 ID로 고유 URL을 생성한다: `/quote/[notionPageId]`
3. 작성자가 클라이언트에게 URL을 공유한다.
4. 클라이언트가 URL에 접속해 견적서를 웹으로 확인한다.
5. 클라이언트가 "PDF 다운로드" 버튼을 클릭해 견적서를 저장한다.

---

## PRD 작성 지침

아래 섹션 구조를 **반드시** 포함하여 `docs/PRD.md` 를 작성하세요.

### 1. 제품 개요 (Product Overview)
- 한 문장 제품 정의 (Elevator Pitch)
- 해결하는 문제 (Problem Statement)
- MVP 범위 명확화: 포함되는 것 / 포함되지 않는 것 (In-scope / Out-of-scope)

### 2. 사용자 스토리 (User Stories)
- 작성자 관점 스토리 3~5개 (`As a [author], I want to ... so that ...`)
- 수신자 관점 스토리 3~5개 (`As a [recipient], I want to ... so that ...`)
- 각 스토리에 **수용 기준(Acceptance Criteria)** 2~3개 포함

### 3. 기능 요구사항 (Functional Requirements)
우선순위: P0(Must-have) → P1(Should-have) → P2(Nice-to-have)

| 우선순위 | 기능 ID | 기능명 | 설명 |
|---------|--------|--------|------|

반드시 포함할 P0 기능:
- **FR-01** Notion 페이지 데이터 조회 API Route
- **FR-02** 견적서 웹 뷰어 페이지 (`/quote/[id]`)
- **FR-03** PDF 생성 및 다운로드
- **FR-04** 견적서 항목 렌더링 (품목명, 수량, 단가, 합계, 세금, 총액)
- **FR-05** 모바일 반응형 레이아웃

### 4. 비기능 요구사항 (Non-Functional Requirements)
- **성능**: 웹 뷰어 첫 페인트(LCP) 목표
- **보안**: Notion API 키 보호, 페이지 접근 제어 방식
- **접근성**: WCAG 2.1 AA 준수 항목
- **SEO**: 수신자 링크 공유 시 Open Graph 메타태그

### 5. 데이터 모델 (Data Model)
Notion 데이터베이스 스키마 정의:

```
견적서(Quote) 데이터베이스 속성:
- 제목(Title): title
- 클라이언트명(Client): text
- 발행일(Issue Date): date
- 만료일(Due Date): date
- 상태(Status): select [초안 | 발송됨 | 승인됨 | 거절됨]
- 통화(Currency): select [KRW | USD | EUR]
- 메모(Notes): text
- 할인율(Discount): number (%)
- 세율(Tax Rate): number (%)

견적 항목(Line Item) — 하위 블록 또는 관계형 DB:
- 품목명(Item): text
- 수량(Qty): number
- 단가(Unit Price): number
- 소계(Subtotal): formula (Qty × Unit Price)
```

### 6. API 설계 (API Design)

```
GET  /api/quote/[id]          — Notion 페이지 데이터 조회
GET  /api/quote/[id]/pdf      — PDF 스트림 반환 (Content-Type: application/pdf)
GET  /quote/[id]              — 웹 뷰어 페이지 (SSR)
```

각 엔드포인트에 대해:
- Request / Response 타입(TypeScript interface)
- 에러 케이스 및 HTTP 상태코드
- 캐싱 전략 (ISR revalidate 시간)

### 7. UI/UX 명세 (UI/UX Spec)
- 핵심 화면 목록 및 각 화면의 주요 컴포넌트
- 견적서 레이아웃 와이어프레임 (ASCII 또는 설명)
- PDF 출력 레이아웃과 웹 레이아웃의 차이점
- 빈 상태(Empty State) / 에러 상태(Error State) / 로딩 상태 처리 방법

### 8. 기술 아키텍처 (Technical Architecture)
- 컴포넌트 트리 다이어그램 (텍스트 형식)
- Notion API 연동 전략: Server Component에서 직접 호출 vs API Route 경유
- PDF 라이브러리 선택 근거 (`@react-pdf/renderer` vs `puppeteer` 트레이드오프)
- 환경변수 목록 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`, ...)
- Vercel 배포 시 주의사항 (Edge Runtime 제한 등)

### 9. 개발 마일스톤 (Development Milestones)
3주 MVP 스프린트 기준으로 작성:

| 주차 | 목표 | 완료 기준 |
|------|------|----------|
| 1주차 | ... | ... |
| 2주차 | ... | ... |
| 3주차 | ... | ... |

### 10. 성공 지표 (Success Metrics)
MVP 출시 후 4주 기준:
- 핵심 지표(North Star Metric) 1개
- 보조 지표 3개
- 측정 방법

### 11. 리스크 및 의존성 (Risks & Dependencies)
| 리스크 | 영향도 | 발생 가능성 | 완화 방안 |
|--------|--------|------------|----------|

반드시 포함할 리스크:
- Notion API Rate Limit (3 req/s)
- PDF 생성 서버 메모리/시간 제한 (Vercel 함수 10초 제한)
- Notion 데이터베이스 스키마 변경 시 하위 호환성

---

## 출력 요구사항

1. **파일 경로**: `docs/PRD.md` 에 저장
2. **언어**: 한국어로 작성 (코드 블록, 변수명, 기술 용어는 영어 허용)
3. **분량**: 최소 400줄 이상의 실질적인 내용
4. **형식**: GitHub Flavored Markdown (표, 코드블록, 체크리스트 적극 활용)
5. **실행 가능성**: 개발자가 PRD만 읽고 구현을 시작할 수 있는 수준의 구체성
6. **가정 명시**: 불확실한 사항은 `> **가정**: ...` 형식으로 명시

PRD 작성 완료 후, 핵심 설계 결정 사항 3가지를 요약해서 알려주세요.

---PROMPT END---

---

## 커스터마이즈 가이드

| 변수 | 기본값 | 변경 방법 |
|------|--------|----------|
| PDF 라이브러리 | 트레이드오프 분석 후 결정 | 프롬프트 §8에 "반드시 `puppeteer` 사용" 추가 |
| 스프린트 기간 | 3주 | §9의 "3주" 를 원하는 기간으로 수정 |
| 통화 | KRW, USD, EUR | §5 Currency select 옵션 수정 |
| 견적서 항목 구조 | 단일 DB | "관계형 DB 사용 금지, 하위 블록만 사용" 조건 추가 가능 |
| 접근 제어 | 없음(퍼블릭 링크) | §4 보안 항목에 "비밀번호 보호 또는 토큰 기반 접근" 요구사항 추가 |

---

## 관련 파일

- `docs/PRD.md` — 이 프롬프트 실행 결과물 (생성 예정)
- `AGENTS.md` — Claude Code 에이전트 지침
- `package.json` — 현재 의존성 현황
