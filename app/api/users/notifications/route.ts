import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const NotifSchema = z.object({
  newUser: z.boolean(),
  payment: z.boolean(),
  security: z.boolean(),
})

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notificationSettings: true },
  })
  if (!user) return Response.json({ error: "Not found" }, { status: 404 })

  return Response.json({ data: JSON.parse(user.notificationSettings) })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = NotifSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "입력값 오류" }, { status: 422 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationSettings: JSON.stringify(parsed.data) },
  })

  return Response.json({ data: parsed.data })
}
