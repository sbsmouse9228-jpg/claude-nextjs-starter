import { z } from "zod";
import type { Customer, Invoice, InvoiceItem, InvoiceStatus } from "../lib/generated/prisma/client";

// Zod 스키마
export const InvoiceItemInputSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "항목 설명을 입력해주세요."),
  quantity: z.coerce.number().min(0.01, "수량은 0보다 커야 합니다."),
  unitPrice: z.coerce.number().min(0, "단가는 0 이상이어야 합니다."),
  amount: z.number().optional(),
  order: z.number().optional(),
});

export const InvoiceFormSchema = z.object({
  customerId: z.string().min(1, "고객을 선택해주세요."),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  taxRate: z.coerce.number().min(0).max(1),
  notes: z.string().optional(),
  items: z.array(InvoiceItemInputSchema).min(1, "항목을 하나 이상 추가해주세요."),
});

export const CustomerFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
});

// TypeScript 타입
export type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;
export type CustomerFormValues = z.infer<typeof CustomerFormSchema>;

export type InvoiceWithCustomer = Invoice & {
  customer: Customer;
};

export type InvoiceWithDetails = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
};

export type CustomerWithInvoices = Customer & {
  invoices: Invoice[];
};

export type DashboardStats = {
  thisMonthRevenue: number;
  sentCount: number;
  totalReceivable: number;
  overdueCount: number;
  recentInvoices: InvoiceWithCustomer[];
};

export type InvoiceListResponse = {
  invoices: InvoiceWithCustomer[];
  total: number;
};

export type CustomerListResponse = {
  customers: Customer[];
  total: number;
};

export { InvoiceStatus };
