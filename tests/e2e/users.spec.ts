import { test, expect, type Page } from "@playwright/test"

/**
 * Users 페이지 E2E 테스트
 *
 * 전제 조건: npm run db:admin으로 관리자 계정 생성 (globalSetup에서 자동 처리)
 *
 * 검증 항목:
 * - Prisma 실데이터 렌더링 (더미 데이터 제거됨)
 * - 관리자 계정 정보 표시
 * - 사용자 추가 버튼 피드백 동작
 */

async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.fill("#email", "admin@example.com")
  await page.fill("#password", "admin1234")
  await page.click('button[type="submit"]')
  await page.waitForURL("/dashboard")
}

test.describe("사용자 관리 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/dashboard/users")
    await page.waitForLoadState("networkidle")
  })

  test("사용자 관리 페이지가 렌더링된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible()
    await expect(page.getByText("등록된 사용자 목록을 관리합니다.")).toBeVisible()
  })

  test("사용자 목록 카드가 렌더링된다", async ({ page }) => {
    await expect(page.getByText("사용자 목록", { exact: true })).toBeVisible()
    await expect(page.getByText("전체 등록 사용자 현황입니다.")).toBeVisible()
  })

  test("사용자 수 배지가 표시된다", async ({ page }) => {
    // 적어도 1명(관리자)이 있어야 함
    const badge = page.locator(".text-xs", { hasText: /^\d+명$/ })
    await expect(badge).toBeVisible()
  })

  test("관리자 계정이 목록에 표시된다", async ({ page }) => {
    const main = page.getByRole("main")
    await expect(main.getByText("admin@example.com")).toBeVisible()
  })

  test("역할 배지가 표시된다", async ({ page }) => {
    // admin 역할 → "관리자" 배지
    const adminBadge = page.getByText("관리자").first()
    await expect(adminBadge).toBeVisible()
  })

  test.describe("사용자 추가 버튼", () => {
    test("사용자 추가 버튼이 존재한다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })
      await expect(addButton).toBeVisible()
    })

    test("사용자 추가 버튼 클릭 시 피드백 상태로 변경된다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })
      await addButton.click()
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()
    })

    test("사용자 추가 피드백이 2초 후 원래 상태로 돌아온다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })
      await addButton.click()
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()
      await expect(page.getByRole("button", { name: "사용자 추가" })).toBeVisible({ timeout: 3000 })
    })

    test("연속 클릭 시 타이머가 재시작된다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })

      await addButton.click()
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()

      await page.waitForTimeout(1000)
      await page.getByRole("button", { name: "추가됨" }).click()
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()

      await expect(page.getByRole("button", { name: "사용자 추가" })).toBeVisible({ timeout: 3500 })
    })
  })
})
