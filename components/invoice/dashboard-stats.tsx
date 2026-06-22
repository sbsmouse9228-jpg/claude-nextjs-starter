import { TrendingUp, Send, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { DashboardStats } from "@/types/invoice";

export function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            이번 달 매출
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">결제 완료 기준</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            발송된 청구서
          </CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.sentCount}건</p>
          <p className="text-xs text-muted-foreground mt-1">결제 대기 중</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            미수금 총액
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalReceivable)}</p>
          <p className="text-xs text-muted-foreground mt-1">발송됨 + 연체 합계</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            연체 건수
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">{stats.overdueCount}건</p>
          <p className="text-xs text-muted-foreground mt-1">즉시 처리 필요</p>
        </CardContent>
      </Card>
    </div>
  );
}
