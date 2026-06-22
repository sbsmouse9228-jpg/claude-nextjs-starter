import { prisma } from "@/lib/prisma";
import { CustomerFormSchema } from "@/types/invoice";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return Response.json({ customers, total });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CustomerFormSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return Response.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }

    const customer = await prisma.customer.create({ data: parsed.data });
    return Response.json({ data: customer }, { status: 201 });
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
