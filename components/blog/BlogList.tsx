import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import type { BlogPost } from "@/types/blog";

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

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-lg">발행된 포스트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1cm", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
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
          <h2 className="text-base font-semibold text-gray-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          {post.publishedAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
