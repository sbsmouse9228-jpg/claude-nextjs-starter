import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright 테스트 설정
 * - 개발 서버: localhost:3000 (이미 실행 중 전제)
 * - 브라우저: Chromium 단일 실행 (CI 속도 최적화)
 */
export default defineConfig({
  globalSetup: "./tests/global-setup.ts",

  // 테스트 파일 위치
  testDir: "./tests/e2e",

  // 테스트 타임아웃 (ms)
  timeout: 30000,

  // 전역 assertion 타임아웃
  expect: {
    timeout: 5000,
  },

  // 병렬 실행 설정
  fullyParallel: true,

  // CI 환경에서 재시도 비활성화
  retries: process.env.CI ? 2 : 0,

  // 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터
  reporter: "list",

  use: {
    // 기본 URL (개발 서버)
    baseURL: "http://localhost:3000",

    // 실패 시 트레이스 수집
    trace: "on-first-retry",

    // 스크린샷: 실패 시만
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 개발 서버 자동 시작하지 않음 (이미 실행 중)
  // webServer: { ... }
})
