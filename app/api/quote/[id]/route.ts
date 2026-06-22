import { APIResponseError } from "@notionhq/client";
import { getQuote } from "@/lib/notion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const quote = await getQuote(id);

    if (!quote) {
      return Response.json(
        { error: "견적서를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return Response.json({ data: quote });
  } catch (error) {
    if (error instanceof APIResponseError) {
      if (error.status === 429) {
        return Response.json(
          { error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
          { status: 429 }
        );
      }
      if (error.status === 404) {
        return Response.json(
          { error: "견적서를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }

    return Response.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
