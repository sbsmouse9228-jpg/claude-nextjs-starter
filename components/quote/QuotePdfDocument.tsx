import path from "path";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { QuoteData } from "@/types/quote";
import { formatQuoteAmount, formatQuoteDate } from "@/lib/format";

Font.register({
  family: "NotoSansKR",
  src: path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.ttf"),
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#111827",
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  headerLabel: {
    color: "#9ca3af",
    fontSize: 9,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerStatusBadge: {
    backgroundColor: "#374151",
    color: "#d1d5db",
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  body: {
    paddingHorizontal: 40,
    paddingVertical: 28,
  },
  section: {
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  infoCell: {
    width: "47%",
    marginBottom: 8,
  },
  infoCellRight: {
    width: "47%",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoValueNormal: {
    color: "#374151",
    fontSize: 10,
  },
  sectionTitle: {
    color: "#6b7280",
    fontSize: 8,
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  colItem: { flex: 3, color: "#1f2937", fontSize: 10 },
  colQty: { flex: 1, textAlign: "right", color: "#4b5563", fontSize: 10 },
  colPrice: { flex: 2, textAlign: "right", color: "#4b5563", fontSize: 10 },
  colSubtotal: { flex: 2, textAlign: "right", color: "#1f2937", fontSize: 10, fontWeight: "bold" },
  colHeaderText: { color: "#9ca3af", fontSize: 9 },
  totalsContainer: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: { color: "#4b5563", fontSize: 10 },
  totalValue: { color: "#4b5563", fontSize: 10 },
  discountLabel: { color: "#ef4444", fontSize: 10 },
  discountValue: { color: "#ef4444", fontSize: 10 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 2,
  },
  grandTotalLabel: { color: "#111827", fontSize: 11, fontWeight: "bold" },
  grandTotalValue: { color: "#111827", fontSize: 11, fontWeight: "bold" },
  notesLabel: {
    color: "#9ca3af",
    fontSize: 8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  notesText: {
    color: "#4b5563",
    fontSize: 10,
    lineHeight: 1.6,
  },
});

export default function QuotePdfDocument({ quote }: { quote: QuoteData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerLabel}>견적서</Text>
              <Text style={styles.headerTitle}>{quote.title}</Text>
            </View>
            {quote.status && (
              <Text style={styles.headerStatusBadge}>{quote.status}</Text>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* 기본 정보 */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>수신</Text>
              <Text style={styles.infoValue}>{quote.clientName || "-"}</Text>
            </View>
            <View style={styles.infoCellRight}>
              <Text style={styles.infoLabel}>통화</Text>
              <Text style={styles.infoValue}>{quote.currency}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>발행일</Text>
              <Text style={styles.infoValueNormal}>
                {formatQuoteDate(quote.issueDate)}
              </Text>
            </View>
            <View style={styles.infoCellRight}>
              <Text style={styles.infoLabel}>만료일</Text>
              <Text style={styles.infoValueNormal}>
                {formatQuoteDate(quote.dueDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 견적 항목 */}
          {quote.lineItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>견적 항목</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.colItem, styles.colHeaderText]}>품목</Text>
                <Text style={[styles.colQty, styles.colHeaderText]}>수량</Text>
                <Text style={[styles.colPrice, styles.colHeaderText]}>단가</Text>
                <Text style={[styles.colSubtotal, styles.colHeaderText]}>소계</Text>
              </View>
              {quote.lineItems.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.colItem}>{item.name}</Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>
                    {formatQuoteAmount(item.unitPrice, quote.currency)}
                  </Text>
                  <Text style={styles.colSubtotal}>
                    {formatQuoteAmount(item.subtotal, quote.currency)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* 합계 */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>소계</Text>
                <Text style={styles.totalValue}>
                  {formatQuoteAmount(quote.subtotal, quote.currency)}
                </Text>
              </View>
              {quote.discountRate > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.discountLabel}>
                    할인 ({(quote.discountRate * 100).toFixed(0)}%)
                  </Text>
                  <Text style={styles.discountValue}>
                    -{formatQuoteAmount(
                      quote.subtotal * quote.discountRate,
                      quote.currency
                    )}
                  </Text>
                </View>
              )}
              {quote.taxRate > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    세금 ({(quote.taxRate * 100).toFixed(0)}%)
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatQuoteAmount(
                      quote.subtotal * (1 - quote.discountRate) * quote.taxRate,
                      quote.currency
                    )}
                  </Text>
                </View>
              )}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>총액</Text>
                <Text style={styles.grandTotalValue}>
                  {formatQuoteAmount(quote.total, quote.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* 메모 */}
          {quote.notes && (
            <>
              <View style={styles.divider} />
              <View>
                <Text style={styles.notesLabel}>메모</Text>
                <Text style={styles.notesText}>{quote.notes}</Text>
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}
