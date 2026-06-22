# Development Guidelines — invoice-web

## Project Overview

- **두 개의 독립 도메인**이 하나의 Next.js 앱에 공존
  - **Invoice 도메인**: 청구서/고객 관리 CRUD (`/dashboard/**`) — Prisma 7 + LibSQL + SQLite
  - **Quote 도메인**: Notion 견적서 웹 뷰어 (`/quote/[id]`) — Notion API
- **기술 스택 버전** (모두 최신 major 버전 — breaking changes 있음)
  - Next.js **16.x** (App Router only)
  - Prisma **7.x** + `@prisma/adapter-libsql`
  - Tailwind CSS **v4** (`@tailwindcss/postcss` 방식)
  - Zod **v4**
  - React **19**, TypeScript **5**
- **언어**: UI 텍스트·주석·커밋 메시지 모두 **한국어**

---

## Directory Architecture

| 경로 | 역할 |
|------|------|
| `app/api/invoices/` | Invoice REST API Route Handlers |
| `app/api/customers/` | Customer REST API Route Handlers |
| `app/dashboard/` | Invoice 도메인 페이지 (Server/Client Components) |
| `app/quote/[id]/` | Quote 도메인 웹 뷰어 페이지 |
| `components/invoice/` | Invoice 도메인 전용 컴포넌트 |
| `components/quote/` | Quote 도메인 전용 컴포넌트 |
| `components/ui/` | shadcn/ui 기반 공통 UI 컴포넌트 (직접 수정 금지) |
| `components/layout/` | 전역 레이아웃 (header, sidebar, footer) |
| `lib/prisma.ts` | Prisma 싱글턴 클라이언트 (이것만 사용) |
| `lib/generated/prisma/` | `prisma generate` 산출물 (직접 수정 금지) |
| `lib/notion.ts` | Notion API 연동 (`getQuote()`) |
| `lib/format.ts` | 금액·날짜 포맷팅 유틸 |
| `lib/invoice-number.ts` | 청구서 번호 자동 생성 |
| `types/invoice.ts` | Invoice 도메인 Zod 스키마 + TypeScript 타입 |
| `types/quote.ts` | Quote 도메인 TypeScript 타입 |
| `prisma/schema.prisma` | DB 스키마 정의 |

---

## CRITICAL: Prisma 7 + LibSQL 규칙

### 클라이언트 사용

- **항상** `import { prisma } from "@/lib/prisma"` 사용
- `new PrismaClient()` 직접 호출 **절대 금지**
- `lib/prisma.ts` 내부 패턴 유지 (globalThis 싱글턴 + LibSql 어댑터)

```typescript
// ✅ 올바름
import { prisma } from "@/lib/prisma";
const invoice = await prisma.invoice.findUnique({ where: { id } });

// ❌ 금지
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

### 타입 Import 경로

- Prisma 생성 타입: `import type { X } from "@/lib/generated/prisma/client"` 또는 상대 경로 `"../lib/generated/prisma/client"`
- `@prisma/client`에서 직접 import **금지**

```typescript
// ✅ 올바름
import type { Invoice, Customer, InvoiceStatus } from "@/lib/generated/prisma/client";

// ❌ 금지
import type { Invoice } from "@prisma/client";
```

### 스키마 변경 절차

1. `prisma/schema.prisma` 수정
2. `npx prisma migrate dev --name <설명>` 실행 (개발 환경)
3. `lib/generated/prisma/` 자동 재생성 확인
4. `types/invoice.ts` Zod 스키마 및 타입 동기화

### LibSQL 어댑터 설정

- DB 파일: 프로젝트 루트 `dev.db`
- 환경변수: `DATABASE_URL=file:./dev.db`
- 어댑터 초기화는 `lib/prisma.ts`에서만 처리

---

## CRITICAL: Next.js 16 규칙

- **반드시** `node_modules/next/dist/docs/` 내 관련 문서를 먼저 읽고 코드 작성
- App Router 전용 — `pages/` 디렉터리 생성 **금지**
- Route Handlers 형태:

```typescript
// ✅ 올바른 Route Handler 형태
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
// [id] 라우트
export async function GET(request: Request, { params }: { params: { id: string } }) { ... }
```

- Server Components가 기본 — 클라이언트 상태/이벤트 필요 시만 `"use client"` 선언
- 메타태그: `export async function generateMetadata(...)` 사용
- ISR 캐싱: 페이지 파일 최상단 `export const revalidate = 60`

---

## Code Standards

### 언어 및 포맷

- UI 텍스트: **한국어**
- 코드 주석: **한국어**
- 커밋 메시지: **한국어**
- 들여쓰기: **2칸**
- 변수명·함수명: **영어** (camelCase)
- 컴포넌트명: **PascalCase**

### TypeScript

- `any` 타입 사용 **금지** — `unknown` 또는 구체 타입 사용
- 모든 함수 반환 타입 명시 권장
- Zod 스키마에서 `z.infer<typeof Schema>`로 타입 파생

### Tailwind CSS v4

- `tailwind.config.js` 파일 생성 또는 수정 **금지** (v4는 CSS 기반 설정)
- 설정은 CSS 파일 내 `@theme` 지시어 사용
- `tw-animate-css` 패키지로 애니메이션 적용

### shadcn/ui 컴포넌트

- `components/ui/` 파일 직접 수정 **금지**
- 새 컴포넌트 필요 시 `npx shadcn@latest add <component>` 실행

---

## Invoice 도메인 규칙

### 금액 계산 공식 (반드시 준수)

```
subtotal  = Σ(item.quantity × item.unitPrice)
taxAmount = subtotal × taxRate
total     = subtotal + taxAmount
```

- 계산 로직은 API Route에서 수행 (클라이언트에서 저장 금지)
- `taxRate` 범위: 0.0 ~ 1.0 (10%는 0.1)

### 청구서 번호

- `lib/invoice-number.ts`의 `generateInvoiceNumber()` 함수 사용
- 직접 번호 생성 로직 작성 **금지**

### InvoiceStatus Enum

```typescript
// 허용 값
DRAFT | SENT | PAID | OVERDUE | CANCELLED
```

### API Response 형태

```typescript
// 목록 조회
return Response.json({ invoices, total });
// 단건 조회/생성
return Response.json({ data: invoice }, { status: 201 });
// 에러
return Response.json({ error: "한국어 에러 메시지" }, { status: 4xx });
```

### 폼 Validation

- React Hook Form + Zod + `@hookform/resolvers/zod` 조합 사용
- Zod 스키마는 `types/invoice.ts`에 정의 후 재사용

---

## Quote 도메인 규칙

### 데이터 조회

- `lib/notion.ts`의 `getQuote(pageId)` 함수 사용
- Notion API 직접 호출 금지 (반드시 `lib/notion.ts` 경유)

### 현재 구현 상태 (2026-06-22)

| 기능 | 상태 | 비고 |
|------|------|------|
| 웹 뷰어 `/quote/[id]` | ✅ 완료 | SSR, `QuoteViewer.tsx` |
| PDF 다운로드 버튼 | ⚠️ 임시 | `window.print()` 대체 중 |
| `GET /api/quote/[id]/pdf` | ❌ 미구현 | `@react-pdf/renderer` 사용 예정 |
| ISR revalidate | ❌ 미적용 | Phase 2에서 적용 예정 |

### PDF 구현 시 필수 경로

1. `public/fonts/` 디렉터리에 한국어 폰트(woff2) 추가
2. `components/quote/QuotePdfDocument.tsx` 생성
3. `app/api/quote/[id]/pdf/route.ts` Route Handler 생성
4. `components/quote/QuoteViewer.tsx` 버튼 로직 교체

### Notion DB 속성명 (한국어 고정)

- `이름`, `클라이언트명`, `발행일`, `만료일`, `상태`, `통화`, `세율`, `할인율`, `소계`, `총액`, `메모`
- 속성명 변경 시 반드시 `lib/notion.ts` 파서도 함께 수정

---

## Multi-file Coordination

| 변경 유형 | 수정 대상 파일 (순서대로) |
|-----------|--------------------------|
| Invoice DB 필드 추가 | `prisma/schema.prisma` → (prisma generate) → `types/invoice.ts` → `app/api/invoices/route.ts` + `[id]/route.ts` → `components/invoice/invoice-form.tsx` |
| Customer DB 필드 추가 | `prisma/schema.prisma` → (prisma generate) → `types/invoice.ts` (CustomerFormSchema) → `app/api/customers/route.ts` + `[id]/route.ts` → `components/invoice/customer-form.tsx` |
| 새 Invoice API 엔드포인트 | `app/api/invoices/[id]/route.ts` 또는 신규 `route.ts` → Zod 스키마 `types/invoice.ts`에 추가 |
| Quote Notion 속성 추가 | `lib/notion.ts` → `types/quote.ts` → `components/quote/QuoteViewer.tsx` |
| 새 공통 UI 컴포넌트 | `npx shadcn@latest add <name>` → `components/ui/` 자동 생성 |
| 레이아웃 변경 | `app/layout.tsx` + `app/dashboard/layout.tsx` + `components/layout/` |

---

## AI Decision Making

### 기능 추가 요청 시

```
요청 분석
├── 청구서/고객 관련 → Invoice 도메인
│   ├── DB 변경 필요 → prisma/schema.prisma 먼저 수정
│   └── DB 변경 불필요 → types/invoice.ts → API Route → Component
└── 견적서/Notion 관련 → Quote 도메인
    ├── Notion 속성 변경 → lib/notion.ts + types/quote.ts
    └── UI 변경 → components/quote/QuoteViewer.tsx
```

### Next.js API 불확실 시

- `node_modules/next/dist/docs/` 내 해당 섹션 먼저 확인
- 훈련 데이터의 Next.js 지식은 이 프로젝트에 맞지 않을 수 있음

### 컴포넌트 위치 판단

- 특정 도메인에서만 사용 → `components/invoice/` 또는 `components/quote/`
- 여러 곳에서 재사용 → `components/ui/` (shadcn 방식으로 추가)
- 전역 레이아웃 → `components/layout/`

### Zod 스키마 작성 시

- 기존 `types/invoice.ts` 또는 `types/quote.ts` 먼저 확인
- 새 스키마는 해당 파일에 추가 (별도 파일 생성 금지)

---

## Prohibited Actions

- `new PrismaClient()` 직접 인스턴스화
- `import from "@prisma/client"` (반드시 `@/lib/generated/prisma/client` 사용)
- `lib/generated/prisma/` 파일 직접 수정
- `components/ui/` 파일 직접 수정
- `pages/` 디렉터리 생성
- `tailwind.config.js` 파일 생성 또는 수정
- TypeScript `any` 타입 사용
- 프로덕션 코드에 `console.log` 남기기
- 금액 계산 로직을 클라이언트(브라우저)에서 처리 후 저장
- `lib/invoice-number.ts`를 우회한 청구서 번호 직접 생성
- Notion API를 `lib/notion.ts` 경유 없이 직접 호출
- 영어로 UI 텍스트, 코드 주석, 커밋 메시지 작성
