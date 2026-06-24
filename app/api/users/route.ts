import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const CreateUserSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  const body = await request.json()
  const parsed = CreateUserSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값 오류" },
      { status: 422 }
    )
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) {
    return Response.json(
      { error: "이미 사용 중인 이메일입니다." },
      { status: 409 }
    )
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
    },
    select: { id: true, name: true, email: true, role: true },
  })

  return Response.json({ data: user }, { status: 201 })
}
