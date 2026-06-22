import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { InvoiceFormSchema } from "@/types/invoice";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const customerId = searchParams.get("customerId") ?? undefined;
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status: status as string } : {}),
      ...(customerId ? { customerId } : {}),
      ...(search ? { invoiceNumber: { contains: search } } : {}),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return Response.json({ invoices, total });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
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
      include: { customer: true, items: true },
    });

    return Response.json({ data: invoice }, { status: 201 });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
