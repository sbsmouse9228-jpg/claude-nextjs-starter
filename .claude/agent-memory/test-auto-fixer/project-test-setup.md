---
name: project-test-setup
description: claude-nextjs-starter Playwright 테스트 환경 설정 — 설정 파일 위치, 디렉토리, 개발 서버 정보
metadata:
  type: project
---

claude-nextjs-starter 프로젝트의 Playwright E2E 테스트 환경 (2026-06-15 기준 초기 설정 완료).

**Why:** 프로젝트 최초 생성 시 playwright.config.ts 및 테스트 파일이 없었음. 이번 세션에서 최초 구축.

**How to apply:** 테스트 추가 시 아래 구조를 따를 것.

## 설정 파일
- `playwright.config.ts` — 프로젝트 루트
- `testDir: "./tests/e2e"` — 테스트 파일 위치
- `baseURL: "http://localhost:3000"` — 개발 서버 (자동 시작 미설정, 수동 실행 전제)
- 브라우저: Chromium 단일 실행

## 테스트 파일 위치
- `tests/e2e/header.spec.ts` — Header 컴포넌트 (테마 토글, 모바일 메뉴)
- `tests/e2e/settings.spec.ts` — 설정 페이지 (접근성, useEffect 타이머)
- `tests/e2e/users.spec.ts` — 사용자 관리 페이지 (useEffect 타이머)

## 개발 서버
- 실행 명령: `npm run dev`
- 포트: 3000 (사용 중이면 3001, 3002 순)
- 테스트 실행 전 개발 서버가 구동 중이어야 함

## 타입 검사
- `npx tsc --noEmit` — 오류 없으면 무출력으로 종료
