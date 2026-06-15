import { test, expect } from "@playwright/test"

/**
 * Settings 페이지 E2E 테스트
 *
 * 변경사항:
 * 1. setTimeout → useEffect + clearTimeout 패턴으로 메모리 누수 방지
 * 2. label/id/aria-label 접근성 속성 추가
 *
 * 검증 항목:
 * - 피드백 메시지가 2초 후 사라지는 타이머 동작
 * - 접근성: label이 input과 연결되어 있는지 (htmlFor + id 매핑)
 * - 알림 토글 스위치의 aria 속성 동작
 */

test.describe("설정 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
  })

  test("설정 페이지가 렌더링된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "설정" })).toBeVisible()
    await expect(page.getByText("계정 및 앱 설정을 관리합니다.")).toBeVisible()
  })

  test.describe("프로필 설정 섹션", () => {
    test("프로필 카드가 렌더링된다", async ({ page }) => {
      // exact: true — "공개 프로필 정보를 수정합니다." 설명 텍스트와 구분
      await expect(page.getByText("프로필 정보", { exact: true })).toBeVisible()
    })

    test("label이 input과 올바르게 연결되어 있다 (접근성 검증)", async ({ page }) => {
      // htmlFor="profile-name" 과 id="profile-name" 매핑 검증
      const nameLabel = page.locator('label[for="profile-name"]')
      const nameInput = page.locator("#profile-name")

      await expect(nameLabel).toBeVisible()
      await expect(nameInput).toBeVisible()

      // label 클릭 시 input이 포커스되는지 확인
      await nameLabel.click()
      await expect(nameInput).toBeFocused()
    })

    test("이메일 label이 input과 올바르게 연결되어 있다", async ({ page }) => {
      const emailLabel = page.locator('label[for="profile-email"]')
      const emailInput = page.locator("#profile-email")

      await expect(emailLabel).toBeVisible()
      await expect(emailInput).toBeVisible()

      await emailLabel.click()
      await expect(emailInput).toBeFocused()
    })

    test("소개 label이 input과 올바르게 연결되어 있다", async ({ page }) => {
      const bioLabel = page.locator('label[for="profile-bio"]')
      const bioInput = page.locator("#profile-bio")

      await expect(bioLabel).toBeVisible()
      await expect(bioInput).toBeVisible()

      await bioLabel.click()
      await expect(bioInput).toBeFocused()
    })

    test("변경사항 저장 버튼 클릭 시 피드백 메시지가 표시된다", async ({ page }) => {
      // 저장 버튼 클릭
      const saveButton = page.getByRole("button", { name: "변경사항 저장" })
      await saveButton.click()

      // 피드백 메시지 즉시 나타남
      await expect(page.getByText("프로필이 저장되었습니다.")).toBeVisible()
      // 버튼 텍스트도 "저장됨"으로 변경
      await expect(page.getByRole("button", { name: "저장됨" })).toBeVisible()
    })

    test("프로필 저장 피드백이 2초 후 사라진다 (useEffect 타이머 검증)", async ({ page }) => {
      const saveButton = page.getByRole("button", { name: "변경사항 저장" })
      await saveButton.click()

      // 피드백 나타남 확인
      await expect(page.getByText("프로필이 저장되었습니다.")).toBeVisible()

      // 2초 + 여유시간 후 피드백 사라짐 확인
      await expect(page.getByText("프로필이 저장되었습니다.")).not.toBeVisible({ timeout: 3000 })
    })
  })

  test.describe("알림 설정 섹션", () => {
    test("알림 설정 카드가 렌더링된다", async ({ page }) => {
      await expect(page.getByText("알림 설정")).toBeVisible()
    })

    test("알림 토글 스위치에 aria 속성이 있다 (접근성 검증)", async ({ page }) => {
      // role="switch" 요소들 확인
      const switches = page.getByRole("switch")
      const count = await switches.count()
      expect(count).toBe(3)

      // 첫 번째 스위치: aria-checked 속성 존재 확인
      const firstSwitch = switches.first()
      const ariaChecked = await firstSwitch.getAttribute("aria-checked")
      expect(ariaChecked).not.toBeNull()

      // aria-label 속성 존재 확인
      const ariaLabel = await firstSwitch.getAttribute("aria-label")
      expect(ariaLabel).not.toBeNull()
      expect(ariaLabel).toBeTruthy()
    })

    test("알림 토글 클릭 시 aria-checked 값이 변경된다", async ({ page }) => {
      const firstSwitch = page.getByRole("switch").first()

      // 초기 상태 확인 (첫 번째는 기본 true)
      const initialChecked = await firstSwitch.getAttribute("aria-checked")

      // 토글 클릭
      await firstSwitch.click()

      // aria-checked 값 변경 확인
      const newChecked = await firstSwitch.getAttribute("aria-checked")
      expect(newChecked).not.toBe(initialChecked)
    })

    test("세 번째 알림(보안 경고)은 기본값이 비활성이다", async ({ page }) => {
      // 세 번째 스위치 (index 2) - 기본값 false
      const thirdSwitch = page.getByRole("switch").nth(2)
      await expect(thirdSwitch).toHaveAttribute("aria-checked", "false")
    })
  })

  test.describe("보안 설정 섹션", () => {
    test("보안 설정 카드가 렌더링된다", async ({ page }) => {
      // exact: true — "보안 경고 알림", "계정 보안을 강화합니다" 등과 구분
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

    test("비밀번호 변경 버튼 클릭 시 피드백 메시지가 표시된다", async ({ page }) => {
      const changeButton = page.getByRole("button", { name: "비밀번호 변경" })
      await changeButton.click()

      await expect(page.getByText("비밀번호가 변경되었습니다.")).toBeVisible()
      await expect(page.getByRole("button", { name: "변경됨" })).toBeVisible()
    })

    test("비밀번호 변경 피드백이 2초 후 사라진다 (useEffect 타이머 검증)", async ({ page }) => {
      const changeButton = page.getByRole("button", { name: "비밀번호 변경" })
      await changeButton.click()

      await expect(page.getByText("비밀번호가 변경되었습니다.")).toBeVisible()

      // 2초 + 여유시간 후 사라짐
      await expect(page.getByText("비밀번호가 변경되었습니다.")).not.toBeVisible({ timeout: 3000 })
    })
  })
})
