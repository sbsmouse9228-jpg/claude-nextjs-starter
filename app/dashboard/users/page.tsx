"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Check } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const users = [
  { name: "김철수", email: "kim@example.com", role: "관리자", status: "활성", initial: "김", joined: "2025-01-15" },
  { name: "이영희", email: "lee@example.com", role: "편집자", status: "활성", initial: "이", joined: "2025-02-20" },
  { name: "박민준", email: "park@example.com", role: "뷰어", status: "활성", initial: "박", joined: "2025-03-10" },
  { name: "최수진", email: "choi@example.com", role: "편집자", status: "비활성", initial: "최", joined: "2025-04-05" },
  { name: "정현우", email: "jung@example.com", role: "뷰어", status: "활성", initial: "정", joined: "2025-05-18" },
  { name: "강지원", email: "kang@example.com", role: "뷰어", status: "대기", initial: "강", joined: "2026-06-01" },
]

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  관리자: "default",
  편집자: "secondary",
  뷰어: "outline",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  활성: "default",
  비활성: "destructive",
  대기: "outline",
}

export default function UsersPage() {
  const [added, setAdded] = useState(false)

  const handleAddUser = () => setAdded(true)

  useEffect(() => {
    if (!added) return
    const id = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(id)
  }, [added])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
          <p className="text-muted-foreground mt-1">등록된 사용자 목록을 관리합니다.</p>
        </div>
        <Button size="sm" onClick={handleAddUser}>
          {added ? <Check className="mr-1 size-4" /> : <UserPlus className="mr-1 size-4" />}
          {added ? "추가됨" : "사용자 추가"}
        </Button>
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
          <div className="space-y-3">
            {users.map((user, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-border/50 p-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {user.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={roleVariant[user.role] ?? "outline"}>{user.role}</Badge>
                  <Badge variant={statusVariant[user.status] ?? "outline"}>{user.status}</Badge>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                  {user.joined}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
