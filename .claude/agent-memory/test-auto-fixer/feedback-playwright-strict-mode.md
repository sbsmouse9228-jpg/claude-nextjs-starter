---
name: feedback-playwright-strict-mode
description: Playwright getByText() strict mode 위반 — 부분 텍스트가 여러 요소에 매칭될 때 exact:true로 해결
metadata:
  type: feedback
---

Playwright의 `getByText()` 는 기본적으로 부분 문자열을 매칭한다. 페이지에 동일 텍스트를 포함하는 요소가 둘 이상이면 strict mode 위반(resolved to N elements) 오류가 발생한다.

**Why:** 이 프로젝트에서 실제로 발생한 사례:
- `"프로필 정보"` → CardTitle + CardDescription(설명 텍스트) 2개 매칭
- `"보안"` → "보안 경고 알림", "보안" 카드 제목, "계정 보안을 강화합니다" 3개 매칭
- `"사용자 목록"` → 페이지 설명 문단 + CardTitle 2개 매칭

**How to apply:** 카드 제목(CardTitle), 섹션 헤딩 등 단독 요소를 특정할 때는 반드시 `{ exact: true }` 옵션을 사용할 것:
```typescript
// 잘못된 예 (strict mode 위반 가능)
page.getByText("보안")

// 올바른 예
page.getByText("보안", { exact: true })
```

**대안:** `getByRole("heading", { name: "..." })` 또는 `locator('[data-slot="card-title"]').getByText("...")` 도 효과적.
