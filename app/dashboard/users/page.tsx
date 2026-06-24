import { Users } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { AddUserButton } from "./add-user-button"

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
}

const roleLabel: Record<string, string> = {
  admin: "관리자",
  editor: "편집자",
  viewer: "뷰어",
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
          <p className="text-muted-foreground mt-1">등록된 사용자 목록을 관리합니다.</p>
        </div>
        <AddUserButton />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>사용자 목록</CardTitle>
            <Badge variant="secondary">{users.length}명</Badge>
          </div>
          <CardDescription>전체 등록 사용자 현황입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">등록된 사용자가 없습니다.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                <code>npm run db:admin</code>으로 관리자를 생성하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const initial = user.name.trim().charAt(0).toUpperCase() || "?"
                const joinedAt = new Date(user.createdAt).toLocaleDateString("ko-KR")
                const role = user.role
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={roleVariant[role] ?? "outline"}>
                        {roleLabel[role] ?? role}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      {joinedAt}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
