import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import type { QuoteData, LineItem } from "@/types/quote";
import type { BlogPost, BlogPostDetail, NotionBlock, RichText } from "@/types/blog";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

function extractRichText(richText: { plain_text: string }[]): string {
  return richText?.map((t) => t.plain_text).join("") ?? "";
}

const _getQuote = async (pageId: string): Promise<QuoteData | null> => {
  try {
    const [page, blocksRes] = await Promise.all([
      notion.pages.retrieve({ page_id: pageId }),
      notion.blocks.children.list({ block_id: pageId }),
    ]);

    if (!("properties" in page)) return null;

    const props = page.properties as Record<string, any>;

    const lineItems: LineItem[] = [];

    // 테이블 블록에서 견적 항목 추출
    for (const block of blocksRes.results) {
      if (!("type" in block) || block.type !== "table") continue;

      const tableRows = await notion.blocks.children.list({
        block_id: block.id,
      });

      let isHeader = true;
      for (const row of tableRows.results) {
        if (!("type" in row) || row.type !== "table_row") continue;
        if (isHeader) { isHeader = false; continue; } // 헤더 행 스킵

        const cells = (row as any).table_row.cells as { plain_text: string }[][];
        if (cells.length < 4) continue;

        const name = cells[0]?.map((c) => c.plain_text).join("") ?? "";
        const quantity = parseFloat(cells[1]?.map((c) => c.plain_text).join("") ?? "0") || 0;
        const unitPriceStr = cells[2]?.map((c) => c.plain_text).join("").replace(/[^0-9.]/g, "") ?? "0";
        const unitPrice = parseFloat(unitPriceStr) || 0;
        const subtotalStr = cells[3]?.map((c) => c.plain_text).join("").replace(/[^0-9.]/g, "") ?? "0";
        const subtotal = parseFloat(subtotalStr) || 0;

        if (name) lineItems.push({ name, quantity, unitPrice, subtotal });
      }
    }

    return {
      id: page.id,
      title: extractRichText(props["이름"]?.title ?? []),
      clientName: extractRichText(props["클라이언트명"]?.rich_text ?? []),
      issueDate: props["발행일"]?.date?.start ?? null,
      dueDate: props["만료일"]?.date?.start ?? null,
      status: props["상태"]?.select?.name ?? null,
      currency: props["통화"]?.select?.name ?? "KRW",
      notes: extractRichText(props["메모"]?.rich_text ?? []),
      discountRate: props["할인율"]?.number ?? 0,
      taxRate: props["세율"]?.number ?? 0,
      subtotal: props["소계"]?.number ?? 0,
      total: props["총액"]?.number ?? 0,
      lineItems,
    };
  } catch {
    return null;
  }
};

export const getQuote = unstable_cache(_getQuote, ["quote"], { revalidate: 60 });

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const databaseId = process.env.NOTION_BLOG_DATABASE_ID!;
    const res = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: "Published", direction: "descending" }],
    });

    return res.results
      .filter((p) => "properties" in p)
      .map((p) => {
        const props = (p as any).properties;
        return {
          id: p.id,
          title: extractRichText(props["Title"]?.title ?? props["이름"]?.title ?? []),
          category: props["Category"]?.select?.name ?? props["카테고리"]?.select?.name ?? null,
          publishedAt: props["Published"]?.date?.start ?? props["발행일"]?.date?.start ?? null,
          status: props["Status"]?.status?.name ?? props["상태"]?.status?.name ?? null,
          slug: p.id.replace(/-/g, ""),
        };
      });
  } catch {
    return [];
  }
}

export async function getBlogPost(pageId: string): Promise<BlogPostDetail | null> {
  try {
    const formattedId = pageId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    const [page, blocksRes] = await Promise.all([
      notion.pages.retrieve({ page_id: formattedId }),
      notion.blocks.children.list({ block_id: formattedId, page_size: 100 }),
    ]);

    if (!("properties" in page)) return null;
    const props = (page as any).properties;

    const blocks: NotionBlock[] = [];
    for (const block of blocksRes.results) {
      if (!("type" in block)) continue;
      const b = block as any;

      if (b.type === "bulleted_list_item" || b.type === "numbered_list_item" || b.type === "toggle") {
        const children = await notion.blocks.children.list({ block_id: b.id });
        b[b.type].children = children.results;
      }
      blocks.push(b as NotionBlock);
    }

    return {
      id: page.id,
      title: extractRichText(props["Title"]?.title ?? props["이름"]?.title ?? []),
      category: props["Category"]?.select?.name ?? props["카테고리"]?.select?.name ?? null,
      publishedAt: props["Published"]?.date?.start ?? props["발행일"]?.date?.start ?? null,
      status: props["Status"]?.status?.name ?? props["상태"]?.status?.name ?? null,
      slug: page.id.replace(/-/g, ""),
      blocks,
    };
  } catch {
    return null;
  }
}
