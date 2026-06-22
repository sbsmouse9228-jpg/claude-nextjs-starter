import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default async function NewInvoicePage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 청구서</h1>
        <p className="text-muted-foreground text-sm mt-1">청구서 정보를 입력하세요</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>청구서 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
