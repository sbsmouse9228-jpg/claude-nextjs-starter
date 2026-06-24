import type { NotionBlock, RichText } from "@/types/blog";

function renderRichText(richTexts: RichText[]): React.ReactNode {
  if (!richTexts?.length) return null;
  return richTexts.map((t, i) => {
    let node: React.ReactNode = t.href ? (
      <a key={i} href={t.href} className="underline text-blue-600 hover:text-blue-800" target="_blank" rel="noreferrer">
        {t.plain_text}
      </a>
    ) : (
      <span key={i}>{t.plain_text}</span>
    );

    if (t.annotations.bold) node = <strong key={i}>{node}</strong>;
    if (t.annotations.italic) node = <em key={i}>{node}</em>;
    if (t.annotations.code) node = <code key={i} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-[0.85em] font-mono">{node}</code>;
    if (t.annotations.strikethrough) node = <s key={i}>{node}</s>;

    return node;
  });
}

function Block({ block }: { block: NotionBlock }) {
  const type = block.type;
  const data = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p className="text-gray-700 leading-relaxed my-3">
          {data.rich_text?.length ? renderRichText(data.rich_text) : <br />}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {renderRichText(data.rich_text)}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100">
          {renderRichText(data.rich_text)}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          {renderRichText(data.rich_text)}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="text-gray-700 leading-relaxed ml-4 list-disc">
          {renderRichText(data.rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-gray-700 leading-relaxed ml-4 list-decimal">
          {renderRichText(data.rich_text)}
        </li>
      );

    case "code":
      return (
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 my-5 overflow-x-auto text-sm font-mono leading-relaxed">
          <code>{data.rich_text?.map((t: RichText) => t.plain_text).join("")}</code>
        </pre>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
          {renderRichText(data.rich_text)}
        </blockquote>
      );

    case "callout":
      return (
        <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 my-4">
          {data.icon?.emoji && <span className="text-xl shrink-0">{data.icon.emoji}</span>}
          <p className="text-gray-700 leading-relaxed">{renderRichText(data.rich_text)}</p>
        </div>
      );

    case "divider":
      return <hr className="border-gray-200 my-8" />;

    case "image": {
      const src = data.type === "external" ? data.external.url : data.file?.url;
      return src ? (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={data.caption?.map((t: RichText) => t.plain_text).join("") || ""} className="rounded-xl w-full" />
          {data.caption?.length > 0 && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              {data.caption.map((t: RichText) => t.plain_text).join("")}
            </figcaption>
          )}
        </figure>
      ) : null;
    }

    case "toggle":
      return (
        <details className="my-3 rounded-xl border border-gray-200 overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors">
            {renderRichText(data.rich_text)}
          </summary>
          <div className="px-4 py-3">
            {data.children?.map((child: NotionBlock) => (
              <Block key={child.id} block={child} />
            ))}
          </div>
        </details>
      );

    default:
      return null;
  }
}

function groupListItems(blocks: NotionBlock[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "bulleted_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i++]);
      }
      result.push(
        <ul key={block.id} className="my-3 space-y-1">
          {items.map((b) => <Block key={b.id} block={b} />)}
        </ul>
      );
    } else if (block.type === "numbered_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i++]);
      }
      result.push(
        <ol key={block.id} className="my-3 space-y-1">
          {items.map((b) => <Block key={b.id} block={b} />)}
        </ol>
      );
    } else {
      result.push(<Block key={block.id} block={block} />);
      i++;
    }
  }

  return result;
}

export default function BlogPost({ blocks }: { blocks: NotionBlock[] }) {
  return (
    <article className="prose-sm max-w-none">
      {groupListItems(blocks)}
    </article>
  );
}
