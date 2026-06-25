"use client";

import { useState } from "react";
import Link from "next/link";
import { parseISO, endOfDay, isBefore } from "date-fns";
import { CheckCircle2, Clock, Send, XCircle, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatQuoteAmount, formatQuoteDate } from "@/lib/format";
import type { QuoteListItem, QuoteStatus } from "@/types/quote";
import { QuoteCopyLinkButton } from "@/components/quote/quote-copy-link-button";

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "초안", label: "초안" },
  { value: "발송됨", label: "발송됨" },
  { value: "승인됨", label: "승인됨" },
  { value: "거절됨", label: "거절됨" },
];

const STATUS_CONFIG: Record<QuoteStatus, { label: string; icon: React.ElementType; className: string }> = {
  초안: { label: "초안", icon: Clock, className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  발송됨: { label: "발송됨", icon: Send, className: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" },
  승인됨: { label: "승인됨", icon: CheckCircle2, className: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300" },
  거절됨: { label: "거절됨", icon: XCircle, className: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300" },
};

function isExpiredQuote(dueDate: string | null, status: QuoteStatus | null): boolean {
  if (!dueDate || status === "승인됨") return false;
  return isBefore(endOfDay(parseISO(dueDate)), new Date());
}

type Props = {
  quotes: QuoteListItem[];
};

export function QuoteListTable({ quotes }: Props) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredQuotes =
    statusFilter === "ALL" ? quotes : quotes.filter((q) => q.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
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
        <p className="text-sm text-muted-foreground">{filteredQuotes.length}건</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">견적서가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">제목</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">클라이언트</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">상태</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">발행일</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">만료일</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">총액</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredQuotes.map((q) => {
                    const statusConf = q.status ? STATUS_CONFIG[q.status] : null;
                    const StatusIcon = statusConf?.icon;
                    const expired = isExpiredQuote(q.dueDate, q.status);

                    return (
                      <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/quote/${q.id}`}
                            target="_blank"
                            className="font-medium text-foreground hover:underline"
                          >
                            {q.title || "제목 없음"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{q.clientName || "-"}</td>
                        <td className="px-4 py-3">
                          {statusConf && StatusIcon ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.className}`}
                            >
                              <StatusIcon className="size-3" />
                              {statusConf.label}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatQuoteDate(q.issueDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">{formatQuoteDate(q.dueDate)}</span>
                            {expired && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                                <AlertTriangle className="size-3" />
                                만료됨
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatQuoteAmount(q.total, q.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <QuoteCopyLinkButton quoteId={q.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
