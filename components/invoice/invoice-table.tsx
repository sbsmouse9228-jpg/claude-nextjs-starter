"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoiceDeleteDialog } from "./invoice-delete-dialog";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { InvoiceWithCustomer } from "@/types/invoice";

interface InvoiceTableProps {
  invoices: InvoiceWithCustomer[];
  onRefresh?: () => void;
}

export function InvoiceTable({ invoices, onRefresh }: InvoiceTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; number: string } | null>(null);

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        청구서가 없습니다.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>청구서 번호</TableHead>
            <TableHead>고객</TableHead>
            <TableHead>발행일</TableHead>
            <TableHead>납기일</TableHead>
            <TableHead className="text-right">합계</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
            >
              <TableCell className="font-mono font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invoice.customer.name}</p>
                  {invoice.customer.company && (
                    <p className="text-xs text-muted-foreground">{invoice.customer.company}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDateShort(invoice.issueDate)}</TableCell>
              <TableCell>{formatDateShort(invoice.dueDate)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status as import("@/types/invoice").InvoiceStatus} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteTarget({ id: invoice.id, number: invoice.invoiceNumber })}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {deleteTarget && (
        <InvoiceDeleteDialog
          invoiceId={deleteTarget.id}
          invoiceNumber={deleteTarget.number}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
