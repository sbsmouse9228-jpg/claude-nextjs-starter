"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import type { InvoiceWithCustomer } from "@/types/invoice";

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "DRAFT", label: "임시저장" },
  { value: "SENT", label: "발송됨" },
  { value: "PAID", label: "결제완료" },
  { value: "OVERDUE", label: "연체" },
  { value: "CANCELLED", label: "취소됨" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">청구서</h1>
          <p className="text-muted-foreground text-sm mt-1">총 {total}건</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 청구서
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="청구서 번호 검색..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <InvoiceTable invoices={invoices} onRefresh={fetchInvoices} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
