import { Users, DollarSign, Activity, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "총 사용자",
    value: "2,350",
    change: "+20.1%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "월 매출",
    value: "₩4,231,000",
    change: "+15.3%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "활성 세션",
    value: "573",
    change: "+8.2%",
    trend: "up" as const,
    icon: Activity,
  },
  {
    title: "전환율",
    value: "3.24%",
    change: "-2.1%",
    trend: "down" as const,
    icon: TrendingUp,
  },
]

const activities = [
  { user: "김철수", action: "새 계정 생성", time: "2분 전", initial: "김" },
  { user: "이영희", action: "결제 완료 — ₩89,000", time: "15분 전", initial: "이" },
  { user: "박민준", action: "프로필 업데이트", time: "1시간 전", initial: "박" },
  { user: "최수진", action: "구독 플랜 변경", time: "3시간 전", initial: "최" },
  { user: "정현우", action: "비밀번호 재설정", time: "5시간 전", initial: "정" },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground mt-1">환영합니다. 오늘의 현황입니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card key={stat.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.title}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
                <div className="flex items-center gap-1">
                  <TrendIcon
                    className={`size-3 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change} 지난달 대비
                  </span>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>최근 활동</CardTitle>
            <Badge variant="secondary">오늘</Badge>
          </div>
          <CardDescription>최근 사용자 활동 내역입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {activity.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{activity.user}</p>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
