"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceDeleteDialog } from "./invoice-delete-dialog";

interface InvoiceDetailActionsProps {
  invoiceId: string;
  invoiceNumber: string;
}

export function InvoiceDetailActions({ invoiceId, invoiceNumber }: InvoiceDetailActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
        <Button variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          수정
        </Button>
      </Link>
      <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
        삭제
      </Button>
      <InvoiceDeleteDialog
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
