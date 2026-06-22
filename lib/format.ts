import type { QuoteCurrency } from "@/types/quote";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function formatQuoteAmount(amount: number, currency: QuoteCurrency): string {
  if (currency === "KRW") {
    return amount.toLocaleString("ko-KR") + "원";
  }
  const symbol = currency === "USD" ? "$" : "€";
  return symbol + amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export function formatQuoteDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return format(new Date(dateStr), "yyyy년 MM월 dd일", { locale: ko });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}
