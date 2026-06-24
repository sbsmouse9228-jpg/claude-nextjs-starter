import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuote } from "@/lib/notion";
import QuoteViewer from "@/components/quote/QuoteViewer";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) return { title: "견적서를 찾을 수 없습니다" };

  return {
    title: `${quote.title} | 견적서`,
    description: `${quote.clientName}에게 발행된 견적서입니다.`,
    openGraph: {
      title: `${quote.title} | 견적서`,
      description: `${quote.clientName}에게 발행된 견적서입니다.`,
      type: "website",
    },
  };
}

export default async function QuotePage({ params }: Props) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) notFound();

  return <QuoteViewer quote={quote} />;
}
