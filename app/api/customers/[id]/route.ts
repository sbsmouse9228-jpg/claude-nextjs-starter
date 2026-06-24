import { prisma } from "@/lib/prisma";
import { CustomerFormSchema } from "@/types/invoice";
import { auth } from "@/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return Response.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json({ data: customer });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = CustomerFormSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });

    return Response.json({ data: customer });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  try {
    const { id } = await params;

    const invoiceCount = await prisma.invoice.count({ where: { customerId: id } });
    if (invoiceCount > 0) {
      return Response.json(
        { error: "청구서가 있는 고객은 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    await prisma.customer.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
