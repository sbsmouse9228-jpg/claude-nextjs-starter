"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateShort } from "@/lib/format";
import type { Customer } from "@/lib/generated/prisma/client";

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const router = useRouter();

  if (customers.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        등록된 고객이 없습니다.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>회사</TableHead>
          <TableHead>전화번호</TableHead>
          <TableHead>등록일</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow
            key={customer.id}
            className="cursor-pointer"
            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
          >
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.company ?? "-"}</TableCell>
            <TableCell>{customer.phone ?? "-"}</TableCell>
            <TableCell>{formatDateShort(customer.createdAt)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    상세 보기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
