import { test, expect, type Page } from "@playwright/test"

/**
 * Settings 페이지 E2E 테스트
 *
 * 전제 조건: npm run db:admin으로 관리자 계정 생성 (globalSetup에서 자동 처리)
 *
 * 검증 항목:
 * - 프로필 정보 섹션 (이름/이메일 폼, 저장 피드백)
 * - 알림 설정 섹션 (토글 스위치 aria 속성)
 * - 보안 설정 섹션 (비밀번호 변경 폼)
 */

async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.fill("#email", "admin@example.com")
  await page.fill("#password", "admin1234")
  await page.click('button[type="submit"]')
  await page.waitForURL("/dashboard")
}

test.describe("설정 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
  })

  test("설정 페이지가 렌더링된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "설정" })).toBeVisible()
    await expect(page.getByText("계정 및 앱 설정을 관리합니다.")).toBeVisible()
  })

  test.describe("프로필 설정 섹션", () => {
    test("프로필 카드가 렌더링된다", async ({ page }) => {
      await expect(page.getByText("프로필 정보", { exact: true })).toBeVisible()
    })

    test("이름 label이 input과 올바르게 연결되어 있다", async ({ page }) => {
      const label = page.locator('label[for="profile-name"]')
      const input = page.locator("#profile-name")
      await expect(label).toBeVisible()
      await expect(input).toBeVisible()
      await label.click()
      await expect(input).toBeFocused()
    })

    test("이메일 label이 input과 올바르게 연결되어 있다", async ({ page }) => {
      const label = page.locator('label[for="profile-email"]')
      const input = page.locator("#profile-email")
      await expect(label).toBeVisible()
      await expect(input).toBeVisible()
      await label.click()
      await expect(input).toBeFocused()
    })

    test("변경사항 저장 버튼 클릭 시 피드백 메시지가 표시된다", async ({ page }) => {
      const saveButton = page.getByRole("button", { name: "변경사항 저장" })
      await saveButton.click()
      await expect(page.getByText("프로필이 저장되었습니다.")).toBeVisible()
      await expect(page.getByRole("button", { name: "저장됨" })).toBeVisible()
    })

    test("프로필 저장 피드백이 2초 후 사라진다", async ({ page }) => {
      const saveButton = page.getByRole("button", { name: "변경사항 저장" })
      await saveButton.click()
      await expect(page.getByText("프로필이 저장되었습니다.")).toBeVisible()
      await expect(page.getByText("프로필이 저장되었습니다.")).not.toBeVisible({ timeout: 3000 })
    })
  })

  test.describe("알림 설정 섹션", () => {
    test("알림 설정 카드가 렌더링된다", async ({ page }) => {
      await expect(page.getByText("알림 설정")).toBeVisible()
    })

    test("알림 토글 스위치가 3개 존재하며 aria 속성이 있다", async ({ page }) => {
      const switches = page.getByRole("switch")
      await expect(switches).toHaveCount(3)

      const firstSwitch = switches.first()
      await expect(firstSwitch).toHaveAttribute("aria-checked")
      await expect(firstSwitch).toHaveAttribute("aria-label")
    })

    test("알림 토글 클릭 시 aria-checked 값이 변경된다", async ({ page }) => {
      const firstSwitch = page.getByRole("switch").first()
      const initialChecked = await firstSwitch.getAttribute("aria-checked")
      await firstSwitch.click()
      const newChecked = await firstSwitch.getAttribute("aria-checked")
      expect(newChecked).not.toBe(initialChecked)
    })

    test("세 번째 알림(보안 경고)은 기본값이 비활성이다", async ({ page }) => {
      const thirdSwitch = page.getByRole("switch").nth(2)
      await expect(thirdSwitch).toHaveAttribute("aria-checked", "false")
    })
  })

  test.describe("보안 설정 섹션", () => {
    test("보안 설정 카드가 렌더링된다", async ({ page }) => {
      await expect(page.getByText("보안", { exact: true })).toBeVisible()
    })

    test("현재 비밀번호 label이 input과 연결되어 있다", async ({ page }) => {
      const label = page.locator('label[for="current-password"]')
      const input = page.locator("#current-password")
      await expect(label).toBeVisible()
      await expect(input).toBeVisible()
      await label.click()
      await expect(input).toBeFocused()
    })

    test("새 비밀번호 label이 input과 연결되어 있다", async ({ page }) => {
      const label = page.locator('label[for="new-password"]')
      const input = page.locator("#new-password")
      await expect(label).toBeVisible()
      await expect(input).toBeVisible()
      await label.click()
      await expect(input).toBeFocused()
    })

    test("비밀번호 필드가 비어있을 때 변경 버튼이 비활성화된다", async ({ page }) => {
      const changeButton = page.getByRole("button", { name: "비밀번호 변경" })
      await expect(changeButton).toBeDisabled()
    })

    test("잘못된 현재 비밀번호 입력 시 오류 메시지가 표시된다", async ({ page }) => {
      await page.fill("#current-password", "wrong-password")
      await page.fill("#new-password", "newpassword123")

      const changeButton = page.getByRole("button", { name: "비밀번호 변경" })
      await expect(changeButton).toBeEnabled()
      await changeButton.click()

      await expect(page.getByText("현재 비밀번호가 올바르지 않습니다.")).toBeVisible()
    })
  })
})
