import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/format";
import type { InvoiceStatus } from "@/types/invoice";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { invoices: { orderBy: { createdAt: "desc" } } },
  });

  if (!customer) notFound();

  const totalRevenue = customer.invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          {customer.company && (
            <p className="text-muted-foreground">{customer.company}</p>
          )}
        </div>
        <Link href={`/dashboard/customers/${customer.id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            수정
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">연락처</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">이메일</span>
              <span>{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">전화번호</span>
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">주소</span>
                <span>{customer.address}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">등록일</span>
              <span>{formatDate(customer.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">거래 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">총 청구서</span>
              <span>{customer.invoices.length}건</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 완료 금액</span>
              <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>청구서 이력</CardTitle>
          <Link href={`/dashboard/invoices/new`}>
            <Button size="sm">새 청구서</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {customer.invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">청구서가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {customer.invoices.map((invoice) => (
                <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-mono text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDateShort(invoice.issueDate)}</p>
                    </div>
                    <div className="flex items-center gap-4">
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
