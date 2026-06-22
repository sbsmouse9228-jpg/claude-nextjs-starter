"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoicePdfTemplate } from "./invoice-pdf-template";
import type { InvoiceWithDetails } from "@/types/invoice";

interface InvoicePdfButtonProps {
  invoiceId: string;
  invoiceNumber: string;
}

export function InvoicePdfButton({ invoiceId, invoiceNumber }: InvoicePdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      const { data } = await res.json();
      setInvoice(data);

      // 잠깐 기다려서 DOM이 렌더링되도록
      await new Promise((r) => setTimeout(r, 300));

      const el = document.getElementById("invoice-pdf-template");
      if (!el) return;

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    } catch (e) {
      console.error("PDF 생성 오류:", e);
    } finally {
      setLoading(false);
      setInvoice(null);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={handleDownload} disabled={loading}>
        <Download className="h-4 w-4 mr-2" />
        {loading ? "생성 중..." : "PDF 다운로드"}
      </Button>

      {invoice &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={containerRef}
            style={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}
          >
            <InvoicePdfTemplate invoice={invoice} />
          </div>,
          document.body
        )}
    </>
  );
}
