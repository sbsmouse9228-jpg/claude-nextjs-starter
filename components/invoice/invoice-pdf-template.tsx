import { formatCurrency, formatDate } from "@/lib/format";
import type { InvoiceWithDetails } from "@/types/invoice";

interface InvoicePdfTemplateProps {
  invoice: InvoiceWithDetails;
}

export function InvoicePdfTemplate({ invoice }: InvoicePdfTemplateProps) {
  return (
    <div
      id="invoice-pdf-template"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "60px",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#1a1a1a",
        fontSize: "14px",
        lineHeight: "1.5",
      }}
    >
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "48px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>청구서</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>{invoice.invoiceNumber}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>Invoice</p>
          <p style={{ margin: "4px 0 0", color: "#666" }}>
            발행일: {formatDate(invoice.issueDate)}
          </p>
          <p style={{ margin: "2px 0 0", color: "#666" }}>
            납기일: {formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* 고객 정보 */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>청구 대상</p>
        <p style={{ fontWeight: "bold", fontSize: "16px", margin: 0 }}>{invoice.customer.name}</p>
        {invoice.customer.company && (
          <p style={{ margin: "2px 0 0", color: "#444" }}>{invoice.customer.company}</p>
        )}
        {invoice.customer.email && (
          <p style={{ margin: "2px 0 0", color: "#666" }}>{invoice.customer.email}</p>
        )}
        {invoice.customer.address && (
          <p style={{ margin: "2px 0 0", color: "#666" }}>{invoice.customer.address}</p>
        )}
      </div>

      {/* 항목 테이블 */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
            <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>항목 설명</th>
            <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", width: "80px" }}>수량</th>
            <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", width: "120px" }}>단가</th>
            <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", width: "120px" }}>금액</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
              <td style={{ padding: "10px 8px" }}>{item.description}</td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>{item.quantity}</td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 합계 */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "240px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ color: "#666" }}>소계</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ color: "#666" }}>세액 ({Math.round(invoice.taxRate * 100)}%)</span>
            <span>{formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0 6px",
              borderTop: "2px solid #1a1a1a",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            <span>합계</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* 메모 */}
      {invoice.notes && (
        <div style={{ marginTop: "40px", padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
          <p style={{ color: "#666", fontSize: "12px", margin: "0 0 4px" }}>메모</p>
          <p style={{ margin: 0 }}>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
