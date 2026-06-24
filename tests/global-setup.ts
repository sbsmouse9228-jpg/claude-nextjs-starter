import { execSync } from "child_process"

export default async function globalSetup() {
  try {
    execSync("npm run db:admin", { stdio: "pipe", cwd: process.cwd() })
  } catch {
    // 이미 존재하는 계정이면 무시
  }
}
