import { prisma } from "./prisma";

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
  });

  const lastSeq = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.replace(prefix, ""), 10)
    : 0;

  const nextSeq = lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}
