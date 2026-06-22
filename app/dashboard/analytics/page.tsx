import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { formatCurrency } from "@/lib/format";
import type { InvoiceStatus } from "@/types/invoice";

async function getAnalyticsData() {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { issueDate: "desc" },
  });

  // 월별 매출 (최근 6개월)
  const monthlyData: Record<string, { revenue: number; count: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = { revenue: 0, count: 0 };
  }

  invoices.forEach((inv) => {
    if (inv.status !== "PAID") return;
    const d = new Date(inv.issueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyData[key]) {
      monthlyData[key].revenue += inv.total;
      monthlyData[key].count += 1;
    }
  });

  // 상태별 집계
  const statusCount: Record<string, number> = {};
  invoices.forEach((inv) => {
    statusCount[inv.status] = (statusCount[inv.status] ?? 0) + 1;
  });

  // 상위 고객 (결제 완료 기준)
  const customerRevenue: Record<string, { name: string; company: string | null; total: number; count: number }> = {};
  invoices
    .filter((inv) => inv.status === "PAID")
    .forEach((inv) => {
      if (!customerRevenue[inv.customerId]) {
        customerRevenue[inv.customerId] = {
          name: inv.customer.name,
          company: inv.customer.company,
          total: 0,
          count: 0,
        };
      }
      customerRevenue[inv.customerId].total += inv.total;
      customerRevenue[inv.customerId].count += 1;
    });

  const topCustomers = Object.values(customerRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return { monthlyData, statusCount, topCustomers };
}

export default async function AnalyticsPage() {
  const { monthlyData, statusCount, topCustomers } = await getAnalyticsData();

  const STATUS_LABELS: Record<string, string> = {
    DRAFT: "임시저장",
    SENT: "발송됨",
    PAID: "결제완료",
    OVERDUE: "연체",
    CANCELLED: "취소됨",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">통계</h1>

      {/* 월별 매출 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 매출 (결제 완료 기준)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>월</TableHead>
                <TableHead className="text-right">청구서 수</TableHead>
                <TableHead className="text-right">매출액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(monthlyData).map(([month, data]) => (
                <TableRow key={month}>
                  <TableCell>{month}</TableCell>
                  <TableCell className="text-right">{data.count}건</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(data.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 상태별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>상태별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCount).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <InvoiceStatusBadge status={status as InvoiceStatus} />
                  <span className="font-medium">{count}건</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 상위 고객 */}
        <Card>
          <CardHeader>
            <CardTitle>상위 고객 (결제 완료 기준)</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      {customer.company && (
                        <p className="text-xs text-muted-foreground">{customer.company}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(customer.total)}</p>
                      <p className="text-xs text-muted-foreground">{customer.count}건</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
