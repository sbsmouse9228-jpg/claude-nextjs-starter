import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { listQuotes } from "@/lib/notion";
import { QuoteListTable } from "@/components/quote/quote-list-table";

export const metadata: Metadata = {
  title: "견적서 목록",
};

export default async function QuotesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const quotes = await listQuotes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">견적서</h1>
        <p className="text-muted-foreground text-sm mt-1">Notion 견적서 목록</p>
      </div>
      <QuoteListTable quotes={quotes} />
    </div>
  );
}
