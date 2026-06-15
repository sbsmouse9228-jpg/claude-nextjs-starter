import { test, expect } from "@playwright/test"

/**
 * Header 컴포넌트 E2E 테스트
 *
 * 변경사항: theme → resolvedTheme 사용으로 테마 토글 로직 변경
 * - resolvedTheme은 시스템 테마를 실제 값("light" | "dark")으로 해석
 * - 초기 테마가 "system"일 때도 토글이 정확히 동작해야 함
 */

test.describe("Header 컴포넌트", () => {
  test.beforeEach(async ({ page }) => {
    // 홈 페이지 접속 (Header가 포함된 레이아웃)
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("헤더가 렌더링된다", async ({ page }) => {
    // 헤더 요소가 존재해야 함
    const header = page.locator("header")
    await expect(header).toBeVisible()
  })

  test("로고 링크가 존재한다", async ({ page }) => {
    // Next Starter 로고 텍스트 확인
    const logo = page.getByText("Next Starter")
    await expect(logo).toBeVisible()
  })

  test("네비게이션 링크가 렌더링된다", async ({ page }) => {
    // 데스크탑 nav 영역의 링크 확인
    const homeLink = page.locator("nav").getByRole("link", { name: "홈" })
    const dashboardLink = page.locator("nav").getByRole("link", { name: "대시보드" })

    await expect(homeLink).toBeVisible()
    await expect(dashboardLink).toBeVisible()
  })

  test("테마 전환 버튼이 존재한다", async ({ page }) => {
    // aria-label로 버튼 특정
    const themeButton = page.getByRole("button", { name: "테마 전환" }).first()
    await expect(themeButton).toBeVisible()
  })

  test("테마 전환 버튼 클릭 시 html 클래스가 변경된다", async ({ page }) => {
    // resolvedTheme 기반 토글 동작 검증
    // 초기 html 클래스 확인
    const html = page.locator("html")
    const initialClass = await html.getAttribute("class")

    // 테마 전환 버튼 클릭 (데스크탑 버전)
    const themeButton = page.getByRole("button", { name: "테마 전환" }).first()
    await themeButton.click()

    // 클래스가 변경되었는지 확인 (light ↔ dark 전환)
    await page.waitForFunction(
      (prevClass) => document.documentElement.getAttribute("class") !== prevClass,
      initialClass,
      { timeout: 3000 }
    )

    const newClass = await html.getAttribute("class")
    expect(newClass).not.toBe(initialClass)
  })

  test("테마 전환을 두 번 하면 원래 테마로 돌아온다", async ({ page }) => {
    const html = page.locator("html")

    // next-themes 초기화를 기다림
    await page.waitForTimeout(500)
    const initialClass = await html.getAttribute("class")

    const themeButton = page.getByRole("button", { name: "테마 전환" }).first()

    // 첫 번째 토글
    await themeButton.click()
    await page.waitForTimeout(300)

    // 두 번째 토글 (원래대로)
    await themeButton.click()
    await page.waitForTimeout(300)

    const finalClass = await html.getAttribute("class")
    expect(finalClass).toBe(initialClass)
  })

  test("로고 클릭 시 홈으로 이동한다", async ({ page }) => {
    // 다른 페이지로 이동 후 로고 클릭
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    const logo = page.getByRole("link", { name: /Next Starter/ })
    await logo.click()

    await expect(page).toHaveURL("/")
  })
})

test.describe("Header 모바일 메뉴", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("모바일에서 햄버거 메뉴 버튼이 보인다", async ({ page }) => {
    const menuButton = page.getByRole("button", { name: "메뉴 열기" })
    await expect(menuButton).toBeVisible()
  })

  test("모바일에서 메뉴 버튼 클릭 시 내비게이션이 열린다", async ({ page }) => {
    const menuButton = page.getByRole("button", { name: "메뉴 열기" })
    await menuButton.click()

    // 모바일 드롭다운 메뉴의 링크 확인
    const homeLink = page.getByRole("link", { name: "홈" })
    await expect(homeLink).toBeVisible()
  })
})
