import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatsCards } from "@/components/invoice/dashboard-stats";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { InvoiceStatus } from "@/types/invoice";

async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [paidThisMonth, sentInvoices, receivableInvoices, overdueInvoices, recentInvoices] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          issueDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.invoice.count({ where: { status: "SENT" } }),
      prisma.invoice.aggregate({
        where: { status: { in: ["SENT", "OVERDUE"] } },
        _sum: { total: true },
      }),
      prisma.invoice.count({ where: { status: "OVERDUE" } }),
      prisma.invoice.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return {
    thisMonthRevenue: paidThisMonth._sum.total ?? 0,
    sentCount: sentInvoices,
    totalReceivable: receivableInvoices._sum.total ?? 0,
    overdueCount: overdueInvoices,
    recentInvoices,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 청구서
          </Button>
        </Link>
      </div>

      <DashboardStatsCards stats={stats} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>최근 청구서</CardTitle>
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="sm">
              전체 보기
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">청구서가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentInvoices.map((invoice) => (
                <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium font-mono text-sm">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customer.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{formatDateShort(invoice.dueDate)}</span>
                      <span className="font-medium">{formatCurrency(invoice.total)}</span>
                      <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
