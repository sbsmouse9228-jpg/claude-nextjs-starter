import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { InvoiceDetailActions } from "@/components/invoice/invoice-detail-actions";
import { InvoicePdfButton } from "@/components/invoice/invoice-pdf-button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InvoiceStatus } from "@/types/invoice";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: { orderBy: { order: "asc" } } },
  });

  if (!invoice) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">{invoice.invoiceNumber}</h1>
          <div className="flex items-center gap-2 mt-2">
            <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
            <span className="text-sm text-muted-foreground">
              납기일: {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <InvoicePdfButton invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
          <InvoiceDetailActions invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">고객 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{invoice.customer.name}</p>
            {invoice.customer.company && <p className="text-sm">{invoice.customer.company}</p>}
            <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
            {invoice.customer.phone && (
              <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">청구서 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">발행일</span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">납기일</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">세율</span>
              <span>{Math.round(invoice.taxRate * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>청구 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoice.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_120px_100px] gap-2 text-sm py-2 border-b last:border-0">
                <span>{item.description}</span>
                <span className="text-right text-muted-foreground">{item.quantity}</span>
                <span className="text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</span>
                <span className="text-right font-medium">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">소계</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">세액 ({Math.round(invoice.taxRate * 100)}%)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1 border-t">
              <span>합계</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">메모</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
