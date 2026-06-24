"use client";

import { useState } from "react";
import { QuoteData } from "@/types/quote";
import { formatQuoteAmount, formatQuoteDate } from "@/lib/format";
import { Download, CheckCircle2, Clock, Send, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { parseISO, endOfDay, isBefore } from "date-fns";

const STATUS_CONFIG = {
  초안: { label: "초안", icon: Clock, className: "bg-gray-100 text-gray-600" },
  발송됨: { label: "발송됨", icon: Send, className: "bg-blue-100 text-blue-600" },
  승인됨: { label: "승인됨", icon: CheckCircle2, className: "bg-green-100 text-green-600" },
  거절됨: { label: "거절됨", icon: XCircle, className: "bg-red-100 text-red-600" },
};


export default function QuoteViewer({ quote }: { quote: QuoteData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const status = quote.status ? STATUS_CONFIG[quote.status] : null;
  const StatusIcon = status?.icon;
  const isExpired =
    quote.dueDate !== null &&
    isBefore(endOfDay(parseISO(quote.dueDate)), new Date()) &&
    quote.status !== "승인됨";

  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/quote/${quote.id}/pdf`);
      if (!response.ok) throw new Error("PDF 생성 실패");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quote.title || "견적서"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* PDF 출력 시 숨김 */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-end print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              PDF 생성 중...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              PDF 저장
            </>
          )}
        </button>
      </div>

      {/* 견적서 본문 */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:rounded-none print:border-none">
        {/* 커버 이미지 */}
        {quote.coverImage && (
          <div className="h-36 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quote.coverImage}
              alt="견적서 커버"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* 헤더 */}
        <div className="bg-gray-900 text-white px-8 py-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">견적서</p>
              <h1 className="text-2xl font-bold">{quote.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {isExpired && (
                <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-900/40 text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  만료됨
                </span>
              )}
              {status && StatusIcon && (
                <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${status.className}`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">수신</p>
              <p className="font-semibold text-gray-900">{quote.clientName || "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">통화</p>
              <p className="font-semibold text-gray-900">{quote.currency}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">발행일</p>
              <p className="text-gray-700">{formatQuoteDate(quote.issueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">만료일</p>
              <p className="text-gray-700">{formatQuoteDate(quote.dueDate)}</p>
            </div>
          </div>

          {/* 구분선 */}
          <hr className="border-gray-100" />

          {/* 견적 항목 테이블 */}
          {quote.lineItems.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">견적 항목</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 text-gray-400 font-medium">품목</th>
                      <th className="text-right py-2 px-4 text-gray-400 font-medium">수량</th>
                      <th className="text-right py-2 px-4 text-gray-400 font-medium">단가</th>
                      <th className="text-right py-2 pl-4 text-gray-400 font-medium">소계</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {quote.lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 pr-4 text-gray-800">{item.name}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatQuoteAmount(item.unitPrice, quote.currency)}
                        </td>
                        <td className="py-3 pl-4 text-right text-gray-800 font-medium">
                          {formatQuoteAmount(item.subtotal, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 합계 영역 */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>소계</span>
                <span>{formatQuoteAmount(quote.subtotal, quote.currency)}</span>
              </div>
              {quote.discountRate > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>할인 ({(quote.discountRate * 100).toFixed(0)}%)</span>
                  <span>-{formatQuoteAmount(quote.subtotal * quote.discountRate, quote.currency)}</span>
                </div>
              )}
              {quote.taxRate > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>세금 ({(quote.taxRate * 100).toFixed(0)}%)</span>
                  <span>
                    {formatQuoteAmount(
                      quote.subtotal * (1 - quote.discountRate) * quote.taxRate,
                      quote.currency
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>총액</span>
                <span>{formatQuoteAmount(quote.total, quote.currency)}</span>
              </div>
            </div>
          </div>

          {/* 메모 */}
          {quote.notes && (
            <>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">메모</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
