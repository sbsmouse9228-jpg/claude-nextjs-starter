import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Receipt } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="flex items-center justify-center gap-2">
          <Receipt className="size-6 text-primary" />
          <span className="text-xl font-semibold">청구서 관리</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>이메일과 비밀번호로 로그인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
