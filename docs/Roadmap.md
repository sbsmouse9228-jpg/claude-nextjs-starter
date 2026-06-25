# Notion 견적서 웹 뷰어 개발 로드맵

> **문서 버전**: v1.2
> **최종 업데이트**: 2026-06-25
> **작성자**: PM/기술 아키텍트
> **상태**: Phase 1~3 완료, Phase 4 계획 중

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

**ADR-02: Notion 데이터 조회 전략 — lib/notion.ts 직접 호출 방식 채택**

Server Component에서 `lib/notion.ts`의 `getQuote()` 함수를 직접 호출하는 방식으로 구현 완료.

- **이유**: `unstable_cache`를 통한 ISR 캐싱(revalidate 60초)을 lib 레이어에서 처리
- **이유**: `getQuote()`가 PDF Route Handler와 웹 뷰어 양쪽에서 공유됨
- **이유**: Rate Limit 대응(지수 백오프)도 lib 레이어에서 일관되게 처리

> **구현 현황 (2026-06-25)**: `lib/notion.ts`의 `getQuote()`가 `unstable_cache`로 래핑되어 ISR revalidate 60초 적용 완료. `/api/quote/[id]/pdf` Route Handler 구현 완료. `/api/quote/[id]` 단독 데이터 Route는 `getQuote()` 직접 공유로 불필요하여 미구현 유지.

**ADR-03: 접근 제어 — MVP는 퍼블릭 링크, 토큰 인증은 Phase 3 이후**

pageId 자체가 추측 불가능한 UUID로 구성되어 있어 MVP 범위에서는 별도 인증 없이 퍼블릭 링크로 운영한다. 민감 정보 보호가 필요한 경우 Phase 3에서 서명된 URL(Signed URL) 방식을 도입한다.

### 데이터 플로우

```
[Notion DB] ──Notion API──▶ [lib/notion.ts getQuote() / listQuotes()]
                                    │
                    ┌───────────────┴──────────────┐
                    ▼                              ▼
           [GET /quote/[id]]           [GET /api/quote/[id]/pdf]
             (SSR 웹 뷰어)               (@react-pdf/renderer)
                    │                              │
            브라우저 렌더링                    PDF 스트림 반환


[Notion DB] ──listQuotes()──▶ [GET /dashboard/quotes]
                                (관리자 견적서 목록, Phase 4)
```

### 환경변수 목록

```env
NOTION_API_KEY=secret_xxxx          # Notion Integration Token (필수)
NOTION_DATABASE_ID=xxxx             # 견적서 DB ID (필수, 현재 설정 완료)
NOTION_BLOG_DATABASE_ID=xxxx        # 블로그 DB ID (별도)
NEXT_PUBLIC_BASE_URL=https://...    # OG 메타태그 및 공유 링크 베이스 URL (Phase 4)
PDF_CACHE_TTL=300                   # PDF 응답 캐시 TTL (초, 선택)
```

---

## 기능 우선순위 (MoSCoW)

### Must Have — MVP 필수 (P0)

- [x] **FR-01** Notion 페이지 데이터 조회 (`lib/notion.ts` → `getQuote()` 구현, 테이블 블록 파서 포함)
- [x] **FR-02** 견적서 웹 뷰어 페이지 (`/quote/[id]`, SSR — `app/quote/[id]/page.tsx` 구현)
- [x] **FR-03** PDF 생성 및 다운로드 (`GET /api/quote/[id]/pdf` — `@react-pdf/renderer` 구현 완료)
- [x] **FR-04** 견적서 항목 렌더링 (품목명, 수량, 단가, 소계, 세금, 총액 — `QuoteViewer.tsx` 구현)
- [x] **FR-05** 모바일 반응형 레이아웃 (`QuoteViewer.tsx` Tailwind CSS v4 적용)
- [x] **FR-06** 존재하지 않는 페이지 / Notion API 에러 처리 (`not-found.tsx` 구현)
- [x] **FR-07** 로딩 상태 UI (`loading.tsx` — Skeleton 애니메이션 구현)
- [x] **FR-08** 한국어 폰트 PDF 적용 (`QuotePdfDocument.tsx` — Pretendard 폰트 주입 완료)

### Should Have (P1)

- [x] **FR-09** Open Graph 메타태그 (`generateMetadata` + `opengraph-image.tsx` — OG 이미지 생성 포함)
- [x] **FR-10** 견적서 만료일 표시 및 만료 상태 배지 (만료 여부 판단 배지 구현 완료)
- [x] **FR-11** ISR 캐싱 적용 (`unstable_cache` revalidate 60초 — `lib/notion.ts`에 적용 완료)
- [x] **FR-12** 할인율 적용 렌더링 (`QuoteViewer.tsx` — 할인 전/후 금액 표시 구현)
- [x] **FR-13** 통화 포맷팅 (`QuoteViewer.tsx` — KRW/USD/EUR 포맷팅 구현)

### Could Have (P2)

- [x] **FR-14** 인쇄 최적화 CSS (`QuoteViewer.tsx` — `print:hidden`, `print:shadow-none` 등 적용)
- [x] **FR-15** 견적서 상태 배지 색상 (`QuoteViewer.tsx` — 초안/발송됨/승인됨/거절됨 색상 배지 구현)
- [x] **FR-16** 작성자 회사 로고 표시 (Notion 커버 이미지 → `coverImage` 속성 파싱 및 렌더링 완료)
- [ ] **FR-17** 다크모드 지원 — 어드민 대시보드 완료, **공개 견적서 뷰어 미완료 → Phase 4 FR-20**

### Phase 4 신규 요구사항 (고도화 2차)

- [ ] **FR-18** 관리자 견적서 목록 (`/dashboard/quotes` — Notion DB 쿼리 기반 어드민 뷰)
- [ ] **FR-19** 클라이언트 링크 복사 (견적서 목록에서 공개 URL 원클릭 복사)
- [ ] **FR-20** 공개 견적서 뷰어 다크모드 (`QuoteViewer.tsx` 색상 토큰화)

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
- [x] 한국어 폰트 파일 번들링 (`public/fonts/` — Pretendard 폰트 적용 완료)
- [x] `node_modules/next/dist/docs/` 관련 섹션 검토 (App Router, Route Handlers, ISR)

**완료 기준**: ✅ Notion API 연결 및 샘플 페이지 데이터 조회 성공, 팀 전원 로컬 환경 실행 가능

---

### Phase 1: MVP 핵심 기능 구현 ✅ 완료

**기간**: 2026-06-21 ~ 2026-06-24 (완료)
**목표**: 웹 뷰어 + PDF 다운로드 Happy Path 완성

#### 에픽 1: Notion 데이터 조회

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| Notion 페이지 조회 서비스 함수 구현 (`lib/notion.ts`) | BE | 1d | High | ✅ 완료 |
| Notion 블록 → QuoteData 변환 파서 구현 (테이블 블록) | BE | 2d | High | ✅ 완료 |
| TypeScript 응답 타입 정의 (`types/quote.ts`) | BE | 0.5d | High | ✅ 완료 |
| 에러 핸들링 (404, Rate Limit 429 지수 백오프) | BE | 0.5d | High | ✅ 완료 |

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

#### 에픽 3: PDF 생성

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| `@react-pdf/renderer` PDF 문서 컴포넌트 구현 | FE/BE | 2d | High | ✅ 완료 |
| 한국어 폰트 등록 및 적용 (`public/fonts/`) | FE/BE | 0.5d | High | ✅ 완료 |
| `GET /api/quote/[id]/pdf` Route Handler 구현 | BE | 1d | High | ✅ 완료 |
| PDF 레이아웃 — 웹 뷰어와 일관성 맞추기 | FE | 1d | High | ✅ 완료 |
| "PDF 다운로드" 버튼 UI 연결 | FE | 0.5d | High | ✅ 완료 |

**Phase 1 완료 기준**:
- [x] Notion 테스트 DB의 견적서가 `/quote/[id]`에서 정상 렌더링
- [x] PDF 다운로드 버튼 클릭 후 8초 이내 PDF 수신
- [x] 모바일(375px) 및 데스크톱(1280px)에서 레이아웃 깨짐 없음
- [x] Vercel 스테이징 배포 성공

---

### Phase 2: 품질 완성 및 P1 기능 ✅ 완료

**기간**: 2026-06-24 ~ 2026-06-25 (완료)
**목표**: 실사용 품질 완성 및 공유 경험 개선

#### 에픽 4: 캐싱 및 성능 최적화

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| ISR revalidate 설정 (60초) 적용 | BE | 0.5d | High | ✅ 완료 |
| Notion API Rate Limit 대응 (exponential backoff) | BE | 1d | High | ✅ 완료 |
| PDF 응답 Cache-Control 헤더 설정 | BE | 0.5d | Medium | ✅ 완료 |

#### 에픽 5: UX 개선

| 태스크 | 담당 | 공수 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| Open Graph 이미지 추가 (`opengraph-image.tsx`) | FE | 0.5d | Medium | ✅ 완료 |
| 견적서 만료 여부 판단 배지 (현재 날짜 기준) | FE | 0.5d | Medium | ✅ 완료 |
| 통화 포맷팅 고도화 (소수점, 로케일 처리) | FE | 0.5d | Low | ✅ 완료 |
| 알림 저장 (toast 알림 시스템, sonner) | FE | 0.5d | Medium | ✅ 완료 |

**Phase 2 완료 기준**:
- [x] SNS/메신저 공유 시 OG 미리보기 카드 정상 출력
- [x] Notion API Rate Limit 초과 시 자동 재시도 (최대 3회)
- [x] 프로덕션 배포 및 실제 견적서 공유 테스트 완료

---

### Phase 3: 고도화 1차 ✅ 완료

**기간**: 2026-06-25 (완료)
**목표**: 어드민 대시보드 완성, 보안 강화, Turso 클라우드 연동

| 항목 | 상태 |
|------|------|
| 어드민 대시보드 (청구서·고객·통계·사용자 관리) | ✅ 완료 |
| NextAuth 기반 인증 (로그인/로그아웃) | ✅ 완료 |
| Turso 클라우드 DB 연결 (LibSQL 원격 접속) | ✅ 완료 |
| 어드민 다크모드 (`next-themes` + `ThemeToggle`) | ✅ 완료 |
| 작성자 회사 로고 표시 (Notion 커버 이미지 파싱) | ✅ 완료 |
| Playwright E2E 테스트 (인증 포함) | ✅ 완료 |
| 서명된 URL 기반 접근 제어 | 보류 (UUID로 충분) |
| 공개 견적서 뷰어 다크모드 | → Phase 4 FR-20 |

---

## 🚀 Phase 4: 고도화 2차 (예정)

**기간**: 2026-06-25 ~ 2026-07-11 (예정)
**목표**: 관리자 견적서 관리 UI 신설, 클라이언트 링크 공유 개선, 공개 뷰어 다크모드 완성

---

### Feature 4-1: 관리자 견적서 목록 (FR-18)

#### 배경

현재 견적서는 Notion 워크스페이스에 직접 접속해야 목록을 확인할 수 있다. 관리자가 대시보드(`/dashboard/quotes`)에서 모든 견적서를 일괄 조회·관리할 수 있는 전용 페이지가 필요하다.

#### 구현 항목

| # | 태스크 | 파일 경로 | 공수 | 상태 |
|---|--------|-----------|------|------|
| 1 | `QuoteListItem` 타입 추가 (`QuoteData` 경량 버전) | `types/quote.ts` | 0.5d | 예정 |
| 2 | `listQuotes()` 함수 추가 (Notion DB 쿼리, 발행일 내림차순, ISR revalidate 60초) | `lib/notion.ts` | 1d | 예정 |
| 3 | 견적서 목록 페이지 생성 (Server Component) | `app/dashboard/quotes/page.tsx` | 0.5d | 예정 |
| 4 | 견적서 목록 테이블 컴포넌트 (상태 필터·만료 배지) | `components/quote/quote-list-table.tsx` | 1d | 예정 |
| 5 | 사이드바 "견적서" 메뉴 추가 (`ClipboardList` 아이콘) | `components/layout/sidebar.tsx` | 0.5d | 예정 |

#### 기술 명세

```typescript
// types/quote.ts 추가
export type QuoteListItem = {
  id: string;
  title: string;
  clientName: string;
  status: QuoteStatus | null;
  issueDate: string | null;
  dueDate: string | null;
  total: number;
  currency: QuoteCurrency;
};

// lib/notion.ts 추가
// NOTION_DATABASE_ID 기사용 중 → 별도 환경변수 추가 불필요
export const listQuotes = unstable_cache(
  async (): Promise<QuoteListItem[]> => {
    const res = await withRetry(() =>
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        sorts: [{ property: "발행일", direction: "descending" }],
      })
    );
    // 각 페이지의 properties 파싱
  },
  ["quotes-list"],
  { revalidate: 60 }
);
```

#### 완료 기준

- `/dashboard/quotes`에서 모든 견적서가 테이블로 표시된다
- 테이블 컬럼: 제목, 클라이언트명, 상태 배지, 발행일, 만료일, 총액, 작업
- 상태 필터(전체/초안/발송됨/승인됨/거절됨) 동작
- 만료된 견적서에 "만료됨" 배지 표시 (dueDate 기준)
- 사이드바 "견적서" 메뉴에서 이동 가능하며 활성 상태 표시
- 인증되지 않은 사용자는 `/login`으로 리다이렉트

---

### Feature 4-2: 클라이언트 링크 복사 (FR-19)

#### 배경

관리자가 견적서 목록에서 각 견적서의 공개 URL(`/quote/[id]`)을 클라이언트에게 즉시 공유할 수 있도록 원클릭 복사 기능이 필요하다. 현재는 Notion에서 pageId를 찾아 URL을 수동으로 조합해야 한다.

#### 구현 항목

| # | 태스크 | 파일 경로 | 공수 | 상태 |
|---|--------|-----------|------|------|
| 1 | 링크 복사 버튼 컴포넌트 생성 (Client Component) | `components/quote/quote-copy-link-button.tsx` | 0.5d | 예정 |
| 2 | 클립보드 복사 로직 (`navigator.clipboard.writeText`) | 위 파일 내부 | 0.5d | 예정 |
| 3 | 복사 성공/실패 toast 알림 (sonner) | 위 파일 내부 | 0.5d | 예정 |
| 4 | 복사 후 아이콘 전환 (Copy → Check, 2초 후 원상 복구) | 위 파일 내부 | 0.5d | 예정 |
| 5 | 목록 테이블 "작업" 컬럼에 버튼 통합 | `components/quote/quote-list-table.tsx` | 0.5d | 예정 |

#### 기술 명세

```typescript
// components/quote/quote-copy-link-button.tsx
"use client";

export function QuoteCopyLinkButton({ quoteId }: { quoteId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/quote/${quoteId}`;
    await navigator.clipboard.writeText(url);
    toast.success("링크가 복사되었습니다");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}
```

#### 의존성

Feature 4-1 (관리자 견적서 목록) 완료 후 착수

#### 완료 기준

- 각 견적서 행의 "작업" 컬럼에 "링크 복사" 버튼 표시
- 버튼 클릭 시 `https://[도메인]/quote/[notionPageId]` URL이 클립보드에 복사됨
- 복사 성공 시 "링크가 복사되었습니다" toast 알림 표시
- 복사 아이콘이 체크 아이콘으로 2초간 전환 후 원상 복구
- HTTPS가 아닌 환경(localhost)에서 fallback 처리

---

### Feature 4-3: 공개 견적서 뷰어 다크모드 (FR-20)

#### 배경

어드민 대시보드는 `next-themes` + `ThemeToggle`로 다크모드가 이미 지원된다(`app/layout.tsx`의 `ThemeProvider`가 전체 앱에 적용됨). 그러나 `QuoteViewer.tsx`가 하드코딩된 색상(`bg-gray-50`, `text-gray-900` 등)을 사용하여 시스템 다크모드 설정을 무시한다.

#### 구현 항목

| # | 태스크 | 파일 경로 | 공수 | 상태 |
|---|--------|-----------|------|------|
| 1 | `QuoteViewer.tsx` 색상 토큰화 | `components/quote/QuoteViewer.tsx` | 1d | 예정 |
| 2 | 공개 뷰어 상단 `ThemeToggle` 추가 (수동 전환) | `components/quote/QuoteViewer.tsx` | 0.5d | 예정 |
| 3 | PDF 출력 시 라이트모드 고정 확인 | `components/quote/QuotePdfDocument.tsx` | 0.5d | 예정 |

#### 색상 교체 기준

| 현재 (하드코딩) | 교체 (시맨틱 토큰 / dark: variant) |
|----------------|----------------------------------|
| `bg-gray-50` | `bg-background` |
| `bg-white` | `bg-card` |
| `text-gray-900` | `text-foreground` |
| `text-gray-600`, `text-gray-700` | `text-muted-foreground` |
| `border-gray-100`, `border-gray-200` | `border-border` |
| `bg-gray-900` (헤더 배경) | `dark:bg-gray-800` (`bg-gray-900 dark:bg-gray-800`) |
| `text-white` (헤더 텍스트) | `text-gray-100 dark:text-white` |
| `bg-gray-100 text-gray-600` (초안 배지) | `dark:bg-gray-700 dark:text-gray-300` |

#### 주의사항

- `QuotePdfDocument.tsx`의 `@react-pdf/renderer` 스타일은 CSS가 아닌 React 인라인 스타일 방식이므로 다크모드 영향 없음 — PDF는 항상 라이트 배경 유지
- `ThemeProvider`가 이미 루트 레이아웃(`app/layout.tsx`)에 있으므로 별도 Provider 추가 불필요

#### 의존성

Feature 4-1, 4-2와 독립적으로 병행 가능

#### 완료 기준

- 시스템 다크모드 설정 시 `/quote/[id]` 페이지도 다크 테마로 표시됨
- 공개 뷰어 상단 `ThemeToggle` 버튼으로 수동 전환 가능
- PDF 저장 시 라이트 배경 색상 유지
- 인쇄(print) 시에도 라이트 배경 유지

---

### Phase 4 구현 순서 및 의존 관계

```
Feature 4-1: 관리자 견적서 목록
    └─→ Feature 4-2: 클라이언트 링크 복사 (4-1 완료 후 착수)

Feature 4-3: 공개 견적서 다크모드 (독립적, 병행 가능)
```

**권장 작업 순서**:
1. Feature 4-3 (다크모드) — 독립적이며 범위가 명확, 빠른 완료 가능
2. Feature 4-1 (견적서 목록) — Notion DB 쿼리 + 어드민 UI 신설
3. Feature 4-2 (링크 복사) — Feature 4-1 완료 직후 이어서 구현

**Phase 4 완료 기준**:
- [ ] `/dashboard/quotes`에서 Notion 견적서 목록 조회 가능
- [ ] 견적서 행에서 클라이언트 공유 링크 원클릭 복사
- [ ] 시스템 다크모드 + 수동 전환 시 공개 뷰어 다크 테마 적용
- [ ] 기존 기능 회귀 없음 (Playwright 테스트 통과)

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
// types/quote.ts (구현 완료 + Phase 4 추가 예정)
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
  coverImage: string | null;
};

// Phase 4 추가 예정
export type QuoteListItem = Pick<
  QuoteData,
  "id" | "title" | "clientName" | "status" | "issueDate" | "dueDate" | "total" | "currency"
>;
```

### API 엔드포인트 명세

| 메서드 | 경로 | 설명 | 캐싱 전략 | 구현 상태 |
|--------|------|------|-----------|-----------|
| `GET` | `/quote/[id]` | 웹 뷰어 (SSR) | ISR revalidate 60초 | ✅ 완료 |
| `GET` | `/api/quote/[id]/pdf` | PDF 스트림 반환 | Cache-Control: max-age=300 | ✅ 완료 |
| `GET` | `/dashboard/quotes` | 관리자 견적서 목록 (SSR) | ISR revalidate 60초 | Phase 4 예정 |

**에러 응답 코드**:

| 코드 | 상황 |
|------|------|
| `404` | Notion 페이지 없음 또는 Integration 접근 권한 없음 |
| `429` | Notion Rate Limit 초과 (지수 백오프 3회 후 반환) |
| `500` | Notion API 일시 장애 또는 데이터 파싱 실패 |
| `504` | PDF 생성 타임아웃 (8초 초과) |

---

## 리스크 및 의존성

### 기술적 리스크

| 리스크 | 영향도 | 가능성 | 대응 방안 |
|--------|--------|--------|----------|
| Notion `databases.query()` Rate Limit (listQuotes 반복 호출) | 중간 | 낮음 | ISR revalidate 60초로 Notion 직접 호출 최소화. 초과 시 기존 withRetry 재사용 |
| `navigator.clipboard` 보안 정책 (HTTP 환경) | 낮음 | 낮음 | localhost에서는 clipboard API 제한. 개발 환경에서는 fallback(`execCommand`) 또는 무시 |
| QuoteViewer 색상 토큰화 중 PDF 레이아웃 영향 | 낮음 | 낮음 | `QuotePdfDocument.tsx`는 인라인 스타일 방식, CSS 변수 미사용으로 영향 없음 |
| Vercel 서버리스 함수 10초 제한 초과 (PDF 생성) | 높음 | 낮음 | 기존 구현에서 해결됨. 복잡한 견적서 항목 수 50줄 이내 권고 유지 |

### 외부 의존성

| 의존성 | 영향 범위 | 비고 |
|--------|-----------|------|
| Notion API 서비스 가용성 | 전체 기능 | SLA 없음. 장애 시 캐시된 응답 제공 |
| `@notionhq/client` 패키지 | 데이터 조회 전체 | 공식 SDK, 안정적 |
| `@react-pdf/renderer` 패키지 | PDF 생성 | 구현 완료, 안정 운영 중 |
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
W1 (06-18~06-20)  Phase 0: 셋업 및 Notion 연동 기반              ✅ 완료
W2 (06-21~06-24)  Phase 1: 웹 뷰어 + PDF 생성 완성               ✅ 완료
W3 (06-24~06-25)  Phase 2: 캐싱, OG, Rate Limit, UX 개선         ✅ 완료
W3 (06-25)        Phase 3: 어드민 대시보드 고도화, Turso, 테스트   ✅ 완료
W4 (06-25~07-11)  Phase 4: 견적서 목록, 링크 복사, 다크모드        진행 예정
```

| Phase | 기간 | 주요 마일스톤 | 상태 |
|-------|------|---------------|------|
| Phase 0 | W1 (3일) | Notion API 연결 성공, 타입 정의 완료 | ✅ 완료 |
| Phase 1 | W2 (4일) | 웹 뷰어 완료, PDF 다운로드 완성 | ✅ 완료 |
| Phase 2 | W3 (2일) | ISR, OG, Rate Limit, 알림 완성 | ✅ 완료 |
| Phase 3 | W3 (1일) | 어드민 완성, Turso, 다크모드(어드민), E2E | ✅ 완료 |
| Phase 4 | W4~ (2주) | 견적서 목록, 링크 복사, 공개 뷰어 다크모드 | 예정 |

---

## 다음 액션 아이템 (2026-06-25 기준)

Phase 4 착수를 위한 우선 작업:

1. **[즉시 — Feature 4-3]** `QuoteViewer.tsx` 하드코딩 색상 → 시맨틱 토큰 교체 (가장 독립적, 빠른 완료 가능)
2. **[즉시 — Feature 4-3]** 공개 뷰어 상단에 `ThemeToggle` 버튼 배치
3. **[Feature 4-1]** `lib/notion.ts`에 `listQuotes()` 함수 추가 (`NOTION_DATABASE_ID` 기사용 중 — 환경변수 추가 불필요)
4. **[Feature 4-1]** `types/quote.ts`에 `QuoteListItem` 타입 추가
5. **[Feature 4-1]** `app/dashboard/quotes/page.tsx` + `components/quote/quote-list-table.tsx` 구현
6. **[Feature 4-1]** `components/layout/sidebar.tsx`에 "견적서" 메뉴 항목 추가
7. **[Feature 4-2]** `QuoteCopyLinkButton` 컴포넌트 구현 및 목록 테이블 통합
8. **[완료 후]** Playwright 테스트 업데이트 (새 페이지 경로 추가)

> **주의**: `node_modules/next/dist/docs/` 내 Server Components + `unstable_cache` 섹션을 참조하여 이 프로젝트의 Next.js 버전에 맞는 `listQuotes()` 캐싱 방식을 확인할 것.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2026-06-18 | 최초 작성 (PRD_PROMPT.md 기반) | PM/기술 아키텍트 |
| v1.1 | 2026-06-22 | Phase 0 완료 반영, Phase 1 진행 현황 업데이트 (웹 뷰어 완료, PDF 생성 미완료), 구현된 파일 완료 표시, ADR-02 실제 구현 방식 반영, Notion DB 속성명 확정 | PM/기술 아키텍트 |
| v1.2 | 2026-06-25 | Phase 1~3 완료 반영 (PDF 생성, 한국어 폰트, ISR, OG, Rate Limit, 어드민 다크모드, Turso 클라우드, E2E 테스트), Phase 4 신규 추가 (FR-18 관리자 견적서 목록, FR-19 클라이언트 링크 복사, FR-20 공개 뷰어 다크모드), 데이터 플로우 및 환경변수 목록 업데이트 | PM/기술 아키텍트 |
