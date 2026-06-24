import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { getBlogPost } from "@/lib/notion";
import BlogPost from "@/components/blog/BlogPost";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post) return { title: "포스트를 찾을 수 없습니다" };
  return {
    title: `${post.title} | 개발 블로그`,
    description: `${post.category ?? ""} 카테고리의 개발 블로그 포스트입니다.`,
  };
}

export const revalidate = 60;

const CATEGORY_COLORS: Record<string, string> = {
  CSS: "bg-blue-100 text-blue-700",
  "Next.js": "bg-black text-white",
  TypeScript: "bg-pink-100 text-pink-700",
  기타: "bg-gray-100 text-gray-600",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          블로그 목록
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <header className="px-8 pt-10 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              {post.category && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600"}`}
                >
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">{post.title}</h1>
            {post.publishedAt && (
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </div>
            )}
          </header>

          <div className="px-8 py-8">
            <BlogPost blocks={post.blocks} />
          </div>
        </article>
      </div>
    </div>
  );
}
