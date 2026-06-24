import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const ProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다."),
})

export async function PUT(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (body.currentPassword !== undefined) {
    const parsed = PasswordSchema.safeParse(body)
    if (!parsed.success)
      return Response.json({ error: parsed.error.issues[0]?.message ?? "입력값 오류" }, { status: 422 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user)
      return Response.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })

    const match = await bcrypt.compare(parsed.data.currentPassword, user.hashedPassword)
    if (!match)
      return Response.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword: await bcrypt.hash(parsed.data.newPassword, 12) },
    })
    return Response.json({ message: "비밀번호가 변경되었습니다." })
  }

  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success)
    return Response.json({ error: "입력값 오류" }, { status: 422 })

  if (parsed.data.email) {
    const dup = await prisma.user.findFirst({
      where: { email: parsed.data.email, NOT: { id: session.user.id } },
    })
    if (dup) return Response.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true },
  })
  return Response.json({ data: user })
}
