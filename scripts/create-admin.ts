import path from "path"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "../lib/generated/prisma/client"
import bcrypt from "bcryptjs"

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/")
const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: `file:${dbPath}` }),
})

async function main() {
  const email = "admin@example.com"
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("이미 존재하는 계정:", email)
    return
  }
  const user = await prisma.user.create({
    data: {
      email,
      name: "관리자",
      hashedPassword: await bcrypt.hash("admin1234", 12),
    },
  })
  console.log("관리자 계정 생성 완료")
  console.log("  이메일:", user.email)
  console.log("  비밀번호: admin1234")
  console.log("  (Settings 페이지에서 비밀번호를 변경하세요)")
}

main().catch(console.error).finally(() => prisma.$disconnect())
