import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, customers] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: { orderBy: { order: "asc" } } },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">청구서 수정</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">{invoice.invoiceNumber}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>청구서 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm customers={customers} defaultValues={invoice} />
        </CardContent>
      </Card>
    </div>
  );
}
