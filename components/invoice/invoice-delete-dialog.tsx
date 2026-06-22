"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvoiceDeleteDialogProps {
  invoiceId: string;
  invoiceNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InvoiceDeleteDialog({
  invoiceId,
  invoiceNumber,
  open,
  onOpenChange,
  onSuccess,
}: InvoiceDeleteDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("삭제에 실패했습니다.");
        return;
      }
      toast.success(`${invoiceNumber} 청구서가 삭제되었습니다.`);
      onSuccess?.();
      router.push("/dashboard/invoices");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>청구서 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            {invoiceNumber} 청구서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "삭제 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
