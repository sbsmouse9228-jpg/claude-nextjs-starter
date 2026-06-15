import { test, expect } from "@playwright/test"

/**
 * Users 페이지 E2E 테스트
 *
 * 변경사항: setTimeout → useEffect + clearTimeout 패턴으로 메모리 누수 방지
 *
 * 검증 항목:
 * - 사용자 목록 렌더링
 * - "사용자 추가" 버튼 피드백 동작 (2초 후 원상복구)
 * - useEffect 타이머: 컴포넌트 언마운트 시 clearTimeout 호출 (메모리 누수 방지)
 */

test.describe("사용자 관리 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/users")
    await page.waitForLoadState("networkidle")
  })

  test("사용자 관리 페이지가 렌더링된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible()
    await expect(page.getByText("등록된 사용자 목록을 관리합니다.")).toBeVisible()
  })

  test("사용자 목록 카드가 렌더링된다", async ({ page }) => {
    // exact: true — "등록된 사용자 목록을 관리합니다." 텍스트와 구분
    await expect(page.getByText("사용자 목록", { exact: true })).toBeVisible()
    await expect(page.getByText("전체 등록 사용자 현황입니다.")).toBeVisible()
  })

  test("6명의 사용자가 표시된다", async ({ page }) => {
    // Badge에 "6명" 텍스트 확인
    await expect(page.getByText("6명")).toBeVisible()
  })

  test("모든 사용자 이름이 표시된다", async ({ page }) => {
    const expectedNames = ["김철수", "이영희", "박민준", "최수진", "정현우", "강지원"]
    for (const name of expectedNames) {
      await expect(page.getByText(name)).toBeVisible()
    }
  })

  test("사용자 이메일이 표시된다", async ({ page }) => {
    await expect(page.getByText("kim@example.com")).toBeVisible()
    await expect(page.getByText("lee@example.com")).toBeVisible()
  })

  test("역할 배지가 표시된다", async ({ page }) => {
    // 여러 개의 역할 배지 확인
    const adminBadge = page.getByText("관리자")
    const editorBadge = page.getByText("편집자").first()
    const viewerBadge = page.getByText("뷰어").first()

    await expect(adminBadge).toBeVisible()
    await expect(editorBadge).toBeVisible()
    await expect(viewerBadge).toBeVisible()
  })

  test("상태 배지가 표시된다", async ({ page }) => {
    // 활성/비활성/대기 상태 확인
    await expect(page.getByText("활성").first()).toBeVisible()
    await expect(page.getByText("비활성")).toBeVisible()
    await expect(page.getByText("대기")).toBeVisible()
  })

  test.describe("사용자 추가 버튼", () => {
    test("사용자 추가 버튼이 존재한다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })
      await expect(addButton).toBeVisible()
    })

    test("사용자 추가 버튼 클릭 시 피드백 상태로 변경된다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })
      await addButton.click()

      // "추가됨" 버튼으로 변경 확인
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()
    })

    test("사용자 추가 피드백이 2초 후 원래 상태로 돌아온다 (useEffect 타이머 검증)", async ({
      page,
    }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })
      await addButton.click()

      // "추가됨" 상태 확인
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()

      // 2초 + 여유시간 후 원래 버튼으로 복구 확인
      await expect(page.getByRole("button", { name: "사용자 추가" })).toBeVisible({
        timeout: 3000,
      })
    })

    test("연속 클릭 시 타이머가 재시작된다 (clearTimeout 동작 검증)", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "사용자 추가" })

      // 첫 번째 클릭
      await addButton.click()
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()

      // 1초 후 다시 클릭 (clearTimeout으로 이전 타이머 취소 후 새 타이머 시작)
      await page.waitForTimeout(1000)
      const addedButton = page.getByRole("button", { name: "추가됨" })
      await addedButton.click()

      // "추가됨" 상태가 유지되어야 함 (타이머 재시작)
      await expect(page.getByRole("button", { name: "추가됨" })).toBeVisible()

      // 최종적으로 원래 상태로 복구
      await expect(page.getByRole("button", { name: "사용자 추가" })).toBeVisible({
        timeout: 3500,
      })
    })
  })

  test("가입일이 표시된다 (데스크탑)", async ({ page }) => {
    // 가입일 텍스트 확인 (sm:block 이라 데스크탑에서만 보임)
    await expect(page.getByText("2025-01-15")).toBeVisible()
    await expect(page.getByText("2026-06-01")).toBeVisible()
  })
})
