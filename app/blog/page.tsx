import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/notion";
import BlogList from "@/components/blog/BlogList";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "개발 블로그",
  description: "Notion CMS 기반 개발 블로그 포스트",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto" style={{ paddingLeft: "1cm", paddingRight: "1cm" }}>
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">개발 블로그</h1>
          </div>
          <p className="text-gray-500 ml-10">총 {posts.length}개의 포스트</p>
        </div>
        <BlogList posts={posts} />
      </div>
    </div>
  );
}
