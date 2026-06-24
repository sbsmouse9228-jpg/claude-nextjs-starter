export type BlogCategory = "CSS" | "Next.js" | "TypeScript" | "기타";
export type BlogStatus = "발행됨" | "초안";

export type BlogPost = {
  id: string;
  title: string;
  category: BlogCategory | null;
  publishedAt: string | null;
  status: BlogStatus | null;
  slug: string;
};

export type RichText = {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
};

export type NotionBlock = {
  id: string;
  type: string;
  [key: string]: any;
};

export type BlogPostDetail = BlogPost & {
  blocks: NotionBlock[];
};
