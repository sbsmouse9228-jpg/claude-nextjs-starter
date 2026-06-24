import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  })

  if (!user) redirect("/login")

  return <SettingsClient initialUser={user} />
}
