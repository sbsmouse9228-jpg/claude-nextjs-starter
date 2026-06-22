import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../lib/generated/prisma/client";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 고객 샘플 데이터
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: "kim@acme.co.kr" },
      update: {},
      create: {
        name: "김철수",
        email: "kim@acme.co.kr",
        phone: "010-1234-5678",
        company: "에이스 주식회사",
        address: "서울시 강남구 테헤란로 123",
      },
    }),
    prisma.customer.upsert({
      where: { email: "lee@btech.co.kr" },
      update: {},
      create: {
        name: "이영희",
        email: "lee@btech.co.kr",
        phone: "010-2345-6789",
        company: "비텍 솔루션",
        address: "서울시 서초구 반포대로 456",
      },
    }),
    prisma.customer.upsert({
      where: { email: "park@cdesign.co.kr" },
      update: {},
      create: {
        name: "박민준",
        email: "park@cdesign.co.kr",
        phone: "010-3456-7890",
        company: "씨 디자인",
        address: "서울시 마포구 합정동 789",
      },
    }),
    prisma.customer.upsert({
      where: { email: "choi@dlogistics.co.kr" },
      update: {},
      create: {
        name: "최지은",
        email: "choi@dlogistics.co.kr",
        company: "디 로지스틱스",
        address: "인천시 연수구 송도동 101",
      },
    }),
    prisma.customer.upsert({
      where: { email: "jung@emarketing.co.kr" },
      update: {},
      create: {
        name: "정수현",
        email: "jung@emarketing.co.kr",
        phone: "010-5678-9012",
        company: "이 마케팅",
      },
    }),
  ]);

  console.log(`고객 ${customers.length}명 생성 완료`);

  // 청구서 샘플 데이터
  const now = new Date();
  const invoicesData = [
    {
      invoiceNumber: "INV-2026-0001",
      customerId: customers[0].id,
      status: "PAID" as const,
      issueDate: new Date(now.getFullYear(), now.getMonth(), 1),
      dueDate: new Date(now.getFullYear(), now.getMonth(), 31),
      taxRate: 0.1,
      notes: "1월 웹개발 용역비",
      items: [
        { description: "웹사이트 개발 (프론트엔드)", quantity: 1, unitPrice: 3000000, order: 0 },
        { description: "웹사이트 개발 (백엔드)", quantity: 1, unitPrice: 2000000, order: 1 },
      ],
    },
    {
      invoiceNumber: "INV-2026-0002",
      customerId: customers[1].id,
      status: "SENT" as const,
      issueDate: new Date(now.getFullYear(), now.getMonth(), 5),
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      taxRate: 0.1,
      notes: "UI/UX 디자인 컨설팅",
      items: [
        { description: "UI 설계 및 디자인", quantity: 20, unitPrice: 80000, order: 0 },
        { description: "프로토타입 제작", quantity: 1, unitPrice: 500000, order: 1 },
      ],
    },
    {
      invoiceNumber: "INV-2026-0003",
      customerId: customers[2].id,
      status: "DRAFT" as const,
      issueDate: new Date(now.getFullYear(), now.getMonth(), 10),
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
      taxRate: 0.1,
      items: [
        { description: "브랜드 아이덴티티 디자인", quantity: 1, unitPrice: 1500000, order: 0 },
        { description: "명함 디자인", quantity: 1, unitPrice: 200000, order: 1 },
        { description: "인쇄물 디자인 (전단지)", quantity: 3, unitPrice: 150000, order: 2 },
      ],
    },
    {
      invoiceNumber: "INV-2026-0004",
      customerId: customers[3].id,
      status: "OVERDUE" as const,
      issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
      taxRate: 0.1,
      notes: "물류 시스템 유지보수",
      items: [
        { description: "시스템 유지보수 (월)", quantity: 1, unitPrice: 800000, order: 0 },
        { description: "긴급 장애 대응", quantity: 2, unitPrice: 200000, order: 1 },
      ],
    },
    {
      invoiceNumber: "INV-2026-0005",
      customerId: customers[4].id,
      status: "PAID" as const,
      issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      taxRate: 0.1,
      notes: "마케팅 콘텐츠 제작",
      items: [
        { description: "SNS 콘텐츠 제작 (월 20건)", quantity: 20, unitPrice: 50000, order: 0 },
        { description: "영상 편집 (30초)", quantity: 2, unitPrice: 300000, order: 1 },
      ],
    },
  ];

  for (const data of invoicesData) {
    const { items, ...invoiceData } = data;
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * invoiceData.taxRate;
    const total = subtotal + taxAmount;

    await prisma.invoice.upsert({
      where: { invoiceNumber: invoiceData.invoiceNumber },
      update: {},
      create: {
        ...invoiceData,
        subtotal,
        taxAmount,
        total,
        items: {
          create: items.map((item) => ({
            ...item,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
    });
  }

  console.log(`청구서 ${invoicesData.length}건 생성 완료`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
