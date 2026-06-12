import { BarChart3, TrendingUp, Eye, Users } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  { title: "페이지 조회수", value: "124,523", change: "+12.4%", icon: Eye },
  { title: "순 방문자", value: "38,291", change: "+8.1%", icon: Users },
  { title: "평균 체류시간", value: "3분 42초", change: "+5.3%", icon: BarChart3 },
  { title: "이탈률", value: "42.1%", change: "-3.2%", icon: TrendingUp },
]

const pageStats = [
  { page: "/dashboard", views: "32,410", unique: "18,200", bounce: "38%" },
  { page: "/dashboard/analytics", views: "15,820", unique: "9,400", bounce: "44%" },
  { page: "/dashboard/users", views: "12,340", unique: "7,100", bounce: "41%" },
  { page: "/dashboard/settings", views: "8,910", unique: "5,300", bounce: "51%" },
  { page: "/", views: "55,043", unique: "31,200", bounce: "35%" },
]

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">분석</h1>
        <p className="text-muted-foreground mt-1">웹사이트 트래픽 및 사용자 행동 분석</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.change.startsWith("+")
          return (
            <Card key={stat.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.title}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change} 지난달 대비
                </span>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>페이지별 통계</CardTitle>
            <Badge variant="secondary">이번 달</Badge>
          </div>
          <CardDescription>각 페이지의 조회수 및 이탈률입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 text-left font-medium">페이지</th>
                  <th className="pb-3 text-right font-medium">조회수</th>
                  <th className="pb-3 text-right font-medium">순 방문자</th>
                  <th className="pb-3 text-right font-medium">이탈률</th>
                </tr>
              </thead>
              <tbody>
                {pageStats.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{row.page}</td>
                    <td className="py-3 text-right">{row.views}</td>
                    <td className="py-3 text-right">{row.unique}</td>
                    <td className="py-3 text-right">{row.bounce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
