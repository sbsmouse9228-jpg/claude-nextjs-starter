import { test, expect } from "@playwright/test"

/**
 * Header 컴포넌트 E2E 테스트
 *
 * 홈 페이지(/)에 렌더링되는 Header를 검증한다.
 * - 로고: "청구서 관리" (/dashboard 링크)
 * - 테마 토글 버튼
 * - nav 링크 및 모바일 메뉴는 대시보드 사이드바로 이동됨 (헤더에 없음)
 */

test.describe("Header 컴포넌트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("헤더가 렌더링된다", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible()
  })

  test("로고 텍스트 '청구서 관리'가 표시된다", async ({ page }) => {
    await expect(page.getByText("청구서 관리").first()).toBeVisible()
  })

  test("로고 링크가 /dashboard로 연결된다", async ({ page }) => {
    const logo = page.getByRole("link", { name: /청구서 관리/ }).first()
    await expect(logo).toHaveAttribute("href", "/dashboard")
  })

  test("테마 전환 버튼이 존재한다", async ({ page }) => {
    const themeButton = page.getByRole("button", { name: "테마 전환" }).first()
    await expect(themeButton).toBeVisible()
  })

  test("테마 전환 버튼 클릭 시 html 클래스가 변경된다", async ({ page }) => {
    const html = page.locator("html")
    const initialClass = await html.getAttribute("class")

    const themeButton = page.getByRole("button", { name: "테마 전환" }).first()
    await themeButton.click()

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
    await page.waitForTimeout(500)
    const initialClass = await html.getAttribute("class")

    const themeButton = page.getByRole("button", { name: "테마 전환" }).first()

    await themeButton.click()
    await page.waitForTimeout(300)
    await themeButton.click()
    await page.waitForTimeout(300)

    const finalClass = await html.getAttribute("class")
    expect(finalClass).toBe(initialClass)
  })
})
