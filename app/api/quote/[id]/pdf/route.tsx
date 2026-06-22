import { renderToBuffer } from "@react-pdf/renderer";
import { getQuote } from "@/lib/notion";
import QuotePdfDocument from "@/components/quote/QuotePdfDocument";

export const maxDuration = 8;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await getQuote(id);

  if (!quote) {
    return Response.json(
      { error: "견적서를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  try {
    const buffer = await renderToBuffer(<QuotePdfDocument quote={quote} />);

    const filename = encodeURIComponent(quote.title || "견적서") + ".pdf";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch {
    return Response.json(
      { error: "PDF 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
