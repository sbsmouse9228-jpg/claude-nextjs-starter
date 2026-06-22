# Notion 견적서 웹 뷰어 개발 로드맵

> **문서 버전**: v1.1
> **최종 업데이트**: 2026-06-22
> **작성자**: PM/기술 아키텍트
> **상태**: 진행 중

---

## 프로젝트 개요

### 비전

프리랜서와 소규모 사업자가 익숙한 Notion 워크플로우를 그대로 유지하면서, 클라이언트에게는 전문적인 웹 견적서와 PDF 다운로드 경험을 제공한다. 별도 견적서 SaaS 도입 없이 Notion 하나로 작성부터 공유까지 완결된다.

### 핵심 목표

- Notion 데이터베이스에 작성된 견적서를 `/quote/[notionPageId]` URL로 즉시 공유 가능하게 한다
- 클라이언트가 URL 접속 후 30초 이내에 PDF 다운로드까지 완료할 수 있는 UX를 제공한다
- 작성자는 코드 배포나 설정 변경 없이 Notion에서만 내용을 수정하면 즉시 반영된다

### 성공 지표 (KPI)

| 지표 | 목표값 | 측정 방법 |
|------|--------|----------|
| 웹 뷰어 LCP (Largest Contentful Paint) | 3초 이하 | Vercel Analytics |
| PDF 생성 및 다운로드 완료 시간 | 8초 이하 | Vercel 함수 실행 로그 |
| 견적서 로딩 에러율 | 1% 이하 | Vercel 에러 모니터링 |
| Notion API 호출 실패율 | 0.5% 이하 | API Route 응답 코드 집계 |
| MVP 출시 후 4주 내 공유 URL 생성 건수 | 측정 기준 수립 | 접근 로그 |

---

## 기술 아키텍처 개요

### 기술 스택

- **프레임워크**: Next.js 16.x (App Router), TypeScript
- **스타일링**: Tailwind CSS v4, shadcn/ui
- **데이터 소스**: Notion API (`@notionhq/client`)
- **PDF 생성**: `@react-pdf/renderer` (ADR-01 참조)
- **배포**: Vercel (서버리스 함수 + Edge Network)
- **현재 프로젝트 기존 의존성**: Prisma 7 + LibSQL (청구서 관리 기능용, 이번 기능과 독립적으로 공존)

### 아키텍처 결정 사항 (ADR)

**ADR-01: PDF 라이브러리 선택 — `@react-pdf/renderer` 채택**

| 항목 | `@react-pdf/renderer` | `puppeteer` |
|------|----------------------|-------------|
| Vercel 서버리스 호환성 | 높음 (순수 JS) | 낮음 (Chromium 번들 필요, 배포 용량 초과 위험) |
| 함수 실행 시간 | 2~5초 (경량) | 5~15초 (Chromium 실행 포함) |
| 레이아웃 정밀도 | React 컴포넌트 기반, 학습 필요 | HTML/CSS 그대로 렌더링 |
| Cold Start 비용 | 낮음 | 높음 |
| 한국어 폰트 지원 | 커스텀 폰트 로드 필요 | 시스템 폰트 사용 가능 |

**결론**: Vercel 10초 함수 제한과 배포 용량 제약으로 `@react-pdf/renderer` 채택. 한국어 폰트는 Noto Sans KR 또는 Pretendard를 정적 에셋으로 번들링하여 해결한다.

> **가정**: Vercel Hobby 플랜 기준 배포. Pro 플랜이라면 puppeteer + Vercel Edge Functions 조합도 재검토 가능.

**ADR-02: Notion 데이터 조회 전략 — API Route 경유 방식 채택**

Server Component에서 직접 Notion API를 호출하는 대신 `/api/quote/[id]` Route를 경유한다.

- **이유**: ISR(Incremental Static Regeneration) revalidate 캐싱 전략을 API 레이어에서 일관되게 적용 가능
- **이유**: PDF 엔드포인트(`/api/quote/[id]/pdf`)와 웹 뷰어가 동일한 데이터 변환 로직을 공유 가능
- **이유**: Rate Limit 대응(캐싱, 재시도 로직)을 단일 지점에서 처리 가능

> **구현 현황 (2026-06-22)**: `lib/notion.ts`에서 `getQuote()` 함수가 구현되어 `/quote/[id]/page.tsx`가 서버 컴포넌트에서 직접 Notion API를 호출하는 방식으로 동작 중. `/api/quote/[id]` API Route는 아직 미구현 상태. PDF Route 구현 시 공유 로직을 위해 별도 API Route 생성 필요.

**ADR-03: 접근 제어 — MVP는 퍼블릭 링크, 토큰 인증은 Phase 3 이후**

pageId 자체가 추측 불가능한 UUID로 구성되어 있어 MVP 범위에서는 별도 인증 없이 퍼블릭 링크로 운영한다. 민감 정보 보호가 필요한 경우 Phase 3에서 서명된 URL(Signed URL) 방식을 도입한다.

### 데이터 플로우

```
[Notion DB] ──Notion API──▶ [lib/notion.ts getQuote()]
                                    │
                    ┌───────────────┴──────────────┐
                    ▼                              ▼
           [GET /quote/[id]]           [GET /api/quote/[id]/pdf]
             (SSR 웹 뷰어)               (@react-pdf/renderer)
                    │                              │
            브라우저 렌더링                    PDF 스트림 반환
```

### 환경변수 목록

```env
NOTION_API_KEY=secret_xxxx          # Notion Integration Token (필수)
NOTION_DATABASE_ID=xxxx             # 견적서 DB ID (필수)
NEXT_PUBLIC_BASE_URL=https://...    # OG 메타태그용 베이스 URL
PDF_CACHE_TTL=300                   # PDF 응답 캐시 TTL (초, 선택)
```

---

## 기능 우선순위 (MoSCoW)

### Must Have — MVP 필수 (P0)

- [x] **FR-01** Notion 페이지 데이터 조회 (`lib/notion.ts` → `getQuote()` 구현, 테이블 블록 파서 포함)
- [x] **FR-02** 견적서 웹 뷰어 페이지 (`/quote/[id]`, SSR — `app/quote/[id]/page.tsx` 구현)
- [ ] **FR-03** PDF 생성 및 다운로드 (`GET /api/quote/[id]/pdf` — 미구현, `window.print()` 임시 대체 중)
- [x] **FR-04** 견적서 항목 렌더링 (품목명, 수량, 단가, 소계, 세금, 총액 — `QuoteViewer.tsx` 구현)
- [x] **FR-05** 모바일 반응형 레이아웃 (`QuoteViewer.tsx` Tailwind CSS v4 적용)
- [x] **FR-06** 존재하지 않는 페이지 / Notion API 에러 처리 (`not-found.tsx` 구현)
- [x] **FR-07** 로딩 상태 UI (`loading.tsx` — Skeleton 애니메이션 구현)
- [ ] **FR-08** 한국어 폰트 PDF 적용 (PDF 미구현으로 보류 중, `public/fonts/` 디렉터리 미생성)

### Should Have (P1)

- [x] **FR-09** Open Graph 메타태그 (`generateMetadata` — `page.tsx`에 OG title/description 구현)
- [ ] **FR-10** 견적서 만료일 표시 및 만료 상태 배지 (만료일 표시는 구현, 만료 여부 판단 배지 미구현)
- [ ] **FR-11** ISR 캐싱 적용 (revalidate 60초 — 미적용)
- [x] **FR-12** 할인율 적용 렌더링 (`QuoteViewer.tsx` — 할인 전/후 금액 표시 구현)
- [x] **FR-13** 통화 포맷팅 (`QuoteViewer.tsx` — KRW/USD/EUR 포맷팅 구현)

### Could Have (P2)

- [x] **FR-14** 인쇄 최적화 CSS (`QuoteViewer.tsx` — `print:hidden`, `print:shadow-none` 등 적용)
- [x] **FR-15** 견적서 상태 배지 색상 (`QuoteViewer.tsx` — 초안/발송됨/승인됨/거절됨 색상 배지 구현)
- [ ] **FR-16** 작성자 회사 로고 표시 (Notion 커버 이미지 or 파일 속성 — 미구현)
- [ ] **FR-17** 다크 모드 지원

### Won't Have — 이번 버전 제외

- Notion 외부 자체 DB 저장 기능
- 견적서 편집 UI (Notion에서만 편집)
- 이메일 자동 발송
- 서명/승인 워크플로우
- 다중 사용자 계정 관리
- 토큰/비밀번호 기반 접근 제어 (Phase 3 검토)

---

## 개발 단계별 계획

### Phase 0: 프로젝트 셋업 ✅ 완료

**기간**: 2026-06-18 ~ 2026-06-20 (완료)
**목표**: Notion API 연동 기반 구축 및 개발 환경 확정

**주요 산출물**:

- [x] `@notionhq/client` 의존성 추가 및 타입 정의 확인
- [x] `@react-pdf/renderer` 의존성 추가 및 Vercel 배포 호환성 검증
- [x] Notion Integration 생성 및 테스트 DB 연결
- [x] 환경변수 구성 (`.env.local`, Vercel 프로젝트 설정)
- [x] Notion DB 스키마 확정 (견적서 속성 및 항목 구조)
- [x] TypeScript 인터페이스 정의 (`types/quote.ts` — `QuoteData`, `LineItem`, `QuoteStatus`, `QuoteCurrency` 정의 완료)
- [ ] 한국어 폰트 파일 번들링 (`public/fonts/` — PDF 구현 시 함께 진행 필요)
- [x] `node_modules/next/dist/docs/` 관련 섹션 검토 (App Router, Route Handlers, ISR)

**완료 기준**: Notion API 연결 및 샘플 페이지 데이터 조회 성공, 팀 전원 로컬 환경 실행 가능

---

### Phase 1: MVP 핵심 기능 구현 (진행 중)

**기간**: 2026-06-21 ~ 2026-06-27
**목표**: 웹 뷰어 + PDF 다운로드 Happy Path 완성
**현황**: 웹 뷰어 구현 완료, PDF 생성 작업 남음

#### 에픽 1: Notion 데이터 조회

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| Notion 페이지 조회 서비스 함수 구현 (`lib/notion.ts`) | BE | 1d | High | ✅ 완료 |
| Notion 블록 → QuoteData 변환 파서 구현 (테이블 블록) | BE | 2d | High | ✅ 완료 |
| TypeScript 응답 타입 정의 (`types/quote.ts`) | BE | 0.5d | High | ✅ 완료 |
| `GET /api/quote/[id]` Route Handler 구현 | BE | 1d | High | 미완료 |
| 에러 핸들링 (404, Rate Limit 429, 500) | BE | 0.5d | High | 부분 완료 (lib 레벨) |

**에픽 1 소계**: 5d (버퍼 20% 포함 실질 6d) / 핵심 로직 완료, API Route 미구현

#### 에픽 2: 견적서 웹 뷰어

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| `/quote/[id]` 페이지 레이아웃 구성 (SSR) | FE | 1d | High | ✅ 완료 |
| `QuoteHeader` — 클라이언트명, 발행일, 만료일, 상태 배지 | FE | 1d | High | ✅ 완료 |
| `QuoteLineItems` — 품목 테이블 | FE | 1.5d | High | ✅ 완료 |
| `QuoteSummary` — 소계, 할인, 세금, 총액 | FE | 1d | High | ✅ 완료 |
| 모바일 반응형 레이아웃 (Tailwind CSS v4) | FE | 1d | High | ✅ 완료 |
| Skeleton 로딩 상태 UI (`loading.tsx`) | FE | 0.5d | High | ✅ 완료 |
| 404 에러 페이지 (`not-found.tsx`) | FE | 0.5d | High | ✅ 완료 |

**에픽 2 소계**: 6.5d / 전체 완료

#### 에픽 3: PDF 생성

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| `@react-pdf/renderer` PDF 문서 컴포넌트 구현 | FE/BE | 2d | High | 미완료 |
| 한국어 폰트 등록 및 적용 (`public/fonts/`) | FE/BE | 0.5d | High | 미완료 |
| `GET /api/quote/[id]/pdf` Route Handler 구현 | BE | 1d | High | 미완료 |
| PDF 레이아웃 — 웹 뷰어와 일관성 맞추기 | FE | 1d | High | 미완료 |
| "PDF 다운로드" 버튼 UI 연결 (현재 `window.print()` 임시 대체) | FE | 0.5d | High | 미완료 |

**에픽 3 소계**: 5d (버퍼 20% 포함 실질 6d) / 전체 미완료

> **참고**: 현재 `QuoteViewer.tsx`의 "PDF 저장" 버튼은 `window.print()`를 호출하는 임시 구현 상태. 에픽 3 완료 후 `/api/quote/[id]/pdf`를 통한 실제 PDF 스트림 방식으로 교체 필요.

**Phase 1 완료 기준**:
- [x] Notion 테스트 DB의 견적서가 `/quote/[id]`에서 정상 렌더링
- [ ] PDF 다운로드 버튼 클릭 후 8초 이내 PDF 수신
- [x] 모바일(375px) 및 데스크톱(1280px)에서 레이아웃 깨짐 없음
- [ ] Vercel 스테이징 배포 성공

---

### Phase 2: 품질 완성 및 P1 기능 (예정)

**기간**: 2026-06-28 ~ 2026-07-04
**목표**: 실사용 품질 완성 및 공유 경험 개선

#### 에픽 4: 캐싱 및 성능 최적화

| 태스크 | 담당 | 공수 | 우선순위 |
|--------|------|------|----------|
| ISR revalidate 설정 (60초) 적용 | BE | 0.5d | High |
| Notion API Rate Limit 대응 (exponential backoff) | BE | 1d | High |
| PDF 응답 Cache-Control 헤더 설정 | BE | 0.5d | Medium |
| Vercel Analytics LCP 측정 설정 | DevOps | 0.5d | Medium |

#### 에픽 5: UX 개선

| 태스크 | 담당 | 공수 | 우선순위 |
|--------|------|------|----------|
| Open Graph 이미지 추가 (`opengraph-image`) | FE | 0.5d | Medium |
| 견적서 만료 여부 판단 배지 (현재 날짜 기준) | FE | 0.5d | Medium |
| 통화 포맷팅 고도화 (소수점, 로케일 처리) | FE | 0.5d | Low |
| 견적서 항목 없음(empty state) UI | FE | 0.5d | Medium |

**Phase 2 완료 기준**:
- [ ] Vercel Analytics LCP p75 기준 3초 이하
- [ ] SNS/메신저 공유 시 OG 미리보기 카드 정상 출력
- [ ] Notion API Rate Limit 초과 시 자동 재시도 및 사용자 안내 메시지
- [ ] 프로덕션 배포 및 실제 견적서 공유 테스트 완료

---

### Phase 3: 고도화 및 확장 (별도 스프린트 계획)

**목표**: 보안 강화, 사용성 확대, 추가 기능

**검토 항목**:

- [ ] 서명된 URL(Signed URL) 기반 접근 제어 (만료 시각 포함)
- [ ] 작성자 회사 로고 표시 (Notion 커버 이미지 or 파일 속성)
- [ ] 견적서 버전 이력 (Notion 페이지 히스토리 활용 검토)
- [ ] 다크 모드 지원
- [ ] 다국어 지원 (i18n)
- [ ] 견적 승인/거절 웹훅 연동

> **가정**: Phase 3 시작 시점은 MVP 출시 후 사용자 피드백 수집(4주) 결과에 따라 결정한다.

---

## 주요 기술 명세

### Notion 데이터 모델 (DB 스키마)

```
견적서(Quote) 데이터베이스:
├── 이름(Title)           : title           — 필수 (props["이름"])
├── 클라이언트명(Client)   : rich_text       — 필수 (props["클라이언트명"])
├── 발행일(Issue Date)    : date            — 필수 (props["발행일"])
├── 만료일(Due Date)      : date            — 선택 (props["만료일"])
├── 상태(Status)          : select          — [초안 | 발송됨 | 승인됨 | 거절됨]
├── 통화(Currency)        : select          — [KRW | USD | EUR]
├── 세율(Tax Rate)        : number (%)      — 기본값 0 (props["세율"])
├── 할인율(Discount)      : number (%)      — 기본값 0 (props["할인율"])
├── 소계(Subtotal)        : number          — props["소계"]
├── 총액(Total)           : number          — props["총액"]
└── 메모(Notes)           : rich_text       — 선택 (props["메모"])

견적 항목(Line Item) — 페이지 내 테이블 블록 (4열 구조):
├── 품목명(Item)          : 1열 텍스트
├── 수량(Qty)             : 2열 숫자
├── 단가(Unit Price)      : 3열 숫자 (비숫자 문자 제거 파싱)
└── 소계(Subtotal)        : 4열 숫자 (비숫자 문자 제거 파싱)
```

### API 응답 타입 (TypeScript)

```typescript
// types/quote.ts (구현 완료)
export type QuoteStatus = "초안" | "발송됨" | "승인됨" | "거절됨";
export type QuoteCurrency = "KRW" | "USD" | "EUR";

export type LineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type QuoteData = {
  id: string;
  title: string;
  clientName: string;
  issueDate: string | null;
  dueDate: string | null;
  status: QuoteStatus | null;
  currency: QuoteCurrency;
  notes: string;
  discountRate: number;
  taxRate: number;
  subtotal: number;
  total: number;
  lineItems: LineItem[];
};
```

### API 엔드포인트 명세

| 메서드 | 경로 | 설명 | 캐싱 전략 | 구현 상태 |
|--------|------|------|-----------|-----------|
| `GET` | `/quote/[id]` | 웹 뷰어 (SSR) | ISR revalidate 60초 (미적용) | ✅ 완료 |
| `GET` | `/api/quote/[id]` | Notion 페이지 데이터 조회 | ISR revalidate 60초 | 미구현 |
| `GET` | `/api/quote/[id]/pdf` | PDF 스트림 반환 | Cache-Control: max-age=300 | 미구현 |

**에러 응답 코드**:

| 코드 | 상황 |
|------|------|
| `404` | Notion 페이지 없음 또는 Integration 접근 권한 없음 |
| `429` | Notion Rate Limit 초과 (재시도 안내 포함) |
| `500` | Notion API 일시 장애 또는 데이터 파싱 실패 |
| `504` | PDF 생성 타임아웃 (8초 초과) |

---

## 리스크 및 의존성

### 기술적 리스크

| 리스크 | 영향도 | 가능성 | 대응 방안 |
|--------|--------|--------|----------|
| Vercel 서버리스 함수 10초 제한 초과 (PDF 생성) | 높음 | 중간 | `@react-pdf/renderer` 채택으로 경감. 타임아웃 8초 설정 후 504 에러 안내 페이지 제공. 복잡한 견적서는 항목 수 제한(최대 50줄) 권고 |
| Notion API Rate Limit (3 req/s) | 높음 | 낮음 | ISR 캐싱으로 Notion 직접 호출 최소화. 초과 시 exponential backoff + 429 응답에 `Retry-After` 헤더 포함 |
| Notion DB 스키마 변경 시 하위 호환성 파괴 | 중간 | 중간 | 속성 파싱 시 `?.` optional chaining 및 fallback 기본값 적용 (현재 `lib/notion.ts`에 이미 적용). 속성명은 한국어 고정으로 확정됨 |
| `@react-pdf/renderer` 한국어 폰트 렌더링 불량 | 중간 | 높음 | PDF 구현 시 최우선 검증 필요. Pretendard 또는 Noto Sans KR woff2 정적 번들링 (`public/fonts/` 디렉터리 아직 미생성) |
| Vercel Hobby 플랜 배포 용량 제한 | 낮음 | 낮음 | 폰트 파일은 압축 포맷(woff2) 사용. puppeteer 미사용으로 Chromium 번들 없음 |

### 외부 의존성

| 의존성 | 영향 범위 | 비고 |
|--------|-----------|------|
| Notion API 서비스 가용성 | 전체 기능 | SLA 없음. 장애 시 캐시된 응답 제공 |
| `@notionhq/client` 패키지 | 데이터 조회 전체 | 공식 SDK, 안정적 |
| `@react-pdf/renderer` 패키지 | PDF 생성 | v4.x 기준, 폰트 로딩 방식 확인 필요 |
| Vercel 배포 플랫폼 | 배포 전체 | 함수 실행 시간/메모리 제한 |

### 가정사항

1. Notion Integration이 해당 데이터베이스에 읽기 권한으로 연결되어 있다
2. 견적서 항목은 Notion 테이블 블록(table block) 4열 구조로 작성된다 — 관계형 DB 방식 사용 시 파서 재설계 필요
3. Notion DB 속성명은 한국어 고정으로 확정됨 (`이름`, `클라이언트명`, `발행일`, `만료일`, `상태`, `통화`, `세율`, `할인율`, `소계`, `총액`, `메모`)
4. Vercel Hobby 플랜 기준으로 설계한다 (함수 실행 시간 10초, 배포 용량 제한)
5. 개발팀은 풀스택 개발자 1~2명 기준이다
6. 견적서 항목 수는 최대 50개 이내로 가정한다
7. MVP는 한국어 단일 언어로 운영한다

---

## 전체 타임라인

```
W1 (06-18~06-20)  Phase 0: 셋업 및 Notion 연동 기반          ✅ 완료
W2 (06-21~06-24)  Phase 1: 웹 뷰어 + API Route 구현          진행 중 (웹 뷰어 완료)
W3 (06-25~06-27)  Phase 1: PDF 생성 + 통합 테스트             예정
W4 (06-28~07-01)  Phase 2: 캐싱, OG 최적화, UX 개선          예정
W5 (07-02~07-04)  Phase 2: QA, 프로덕션 배포, 사용자 테스트   예정
```

| Phase | 기간 | 주요 마일스톤 | 상태 |
|-------|------|---------------|------|
| Phase 0 | W1 (3일) | Notion API 연결 성공, 타입 정의 완료 | ✅ 완료 |
| Phase 1 | W2~W3 (1주) | 웹 뷰어 완료, PDF 다운로드 Happy Path 완성, 스테이징 배포 | 진행 중 |
| Phase 2 | W4~W5 (1주) | LCP 3초 이하 달성, 프로덕션 배포, OG 미리보기 완성 | 예정 |
| Phase 3 | 별도 스프린트 | MVP 피드백 수집 후 일정 결정 | 미정 |

**MVP 목표 출시일**: 2026-07-04

---

## 다음 액션 아이템 (2026-06-22 기준)

현재 Phase 1 중 에픽 3(PDF 생성)이 남은 최우선 작업:

1. **[즉시]** `public/fonts/` 디렉터리 생성 후 Pretendard 또는 Noto Sans KR woff2 폰트 파일 배치
2. **[즉시]** `@react-pdf/renderer`로 `QuotePdfDocument` 컴포넌트 구현 — `components/quote/` 하위에 추가
3. **[즉시]** `app/api/quote/[id]/pdf/route.ts` Route Handler 구현 및 PDF 스트림 반환 검증
4. **[즉시]** `QuoteViewer.tsx`의 `window.print()` 임시 버튼을 `/api/quote/[id]/pdf` 실제 요청으로 교체
5. **[이번 주 내]** Vercel 스테이징 배포 후 PDF 생성 시간 측정 (목표: 8초 이내)
6. **[Phase 2 시작 전]** `/quote/[id]/page.tsx`에 ISR `revalidate` 설정 추가

> **주의**: `node_modules/next/dist/docs/` 내 Route Handlers 섹션을 참조하여 이 프로젝트의 Next.js 16.x 버전에 맞는 PDF 스트림 반환 방식을 확인할 것. 기존 버전과 breaking changes 있을 수 있음.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2026-06-18 | 최초 작성 (PRD_PROMPT.md 기반) | PM/기술 아키텍트 |
| v1.1 | 2026-06-22 | Phase 0 완료 반영, Phase 1 진행 현황 업데이트 (웹 뷰어 완료, PDF 생성 미완료), 구현된 파일 완료 표시, ADR-02 실제 구현 방식 반영, Notion DB 속성명 확정 | PM/기술 아키텍트 |
