import { prisma } from "@/lib/prisma";
import { InvoiceFormSchema } from "@/types/invoice";
import { z } from "zod";

const StatusUpdateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { orderBy: { order: "asc" } },
      },
    });

    if (!invoice) {
      return Response.json({ error: "청구서를 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json({ data: invoice });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 상태만 업데이트하는 경우
    if (body.status && Object.keys(body).length === 1) {
      const parsed = StatusUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json({ error: "올바르지 않은 상태값입니다." }, { status: 422 });
      }
      const invoice = await prisma.invoice.update({
        where: { id },
        data: { status: parsed.data.status },
        include: { customer: true, items: true },
      });
      return Response.json({ data: invoice });
    }

    const parsed = InvoiceFormSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { customerId, issueDate, dueDate, taxRate, notes, items } = parsed.data;
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // 기존 항목 전체 교체
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerId,
        issueDate,
        dueDate,
        taxRate,
        notes,
        subtotal,
        taxAmount,
        total,
        items: {
          create: items.map((item, idx) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            order: idx,
          })),
        },
      },
      include: { customer: true, items: { orderBy: { order: "asc" } } },
    });

    return Response.json({ data: invoice });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
