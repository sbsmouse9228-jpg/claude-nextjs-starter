import { ImageResponse } from "next/og";
import { getQuote } from "@/lib/notion";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;
  const quote = await getQuote(id);

  const title = quote?.title ?? "견적서";
  const clientName = quote?.clientName ?? "";
  const total = quote?.total ?? 0;
  const currency = quote?.currency ?? "KRW";

  const totalDisplay =
    currency === "KRW"
      ? `${total.toLocaleString("ko-KR")}원`
      : `${currency} ${total.toLocaleString()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#111827",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: 18, marginBottom: "auto" }}>
          견적서
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 52,
              fontWeight: "bold",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          {clientName && (
            <div style={{ color: "#9ca3af", fontSize: 24 }}>
              To. {clientName}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ color: "#4b5563", fontSize: 16 }}>Invoice Web</div>
          {total > 0 && (
            <div
              style={{ color: "#60a5fa", fontSize: 40, fontWeight: "bold" }}
            >
              {totalDisplay}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
