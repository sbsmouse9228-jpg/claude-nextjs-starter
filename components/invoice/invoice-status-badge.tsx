import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/types/invoice";

const STATUS_MAP: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" }
> = {
  DRAFT: { label: "임시저장", variant: "outline" },
  SENT: { label: "발송됨", variant: "secondary" },
  PAID: { label: "결제완료", variant: "default" },
  OVERDUE: { label: "연체", variant: "destructive" },
  CANCELLED: { label: "취소됨", variant: "ghost" },
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;
  return <Badge variant={variant}>{label}</Badge>;
}
