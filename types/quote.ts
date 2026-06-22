export type QuoteStatus = "초안" | "발송됨" | "승인됨" | "거절됨";
export type QuoteCurrency = "KRW" | "USD" | "EUR";

export type LineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type QuoteData = {
  id: string;
  title: string;
  clientName: string;
  issueDate: string | null;
  dueDate: string | null;
  status: QuoteStatus | null;
  currency: QuoteCurrency;
  notes: string;
  discountRate: number;
  taxRate: number;
  subtotal: number;
  total: number;
  lineItems: LineItem[];
};
