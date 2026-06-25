"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  quoteId: string;
};

export function QuoteCopyLinkButton({ quoteId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/quote/${quoteId}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    toast.success("링크가 복사되었습니다");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} title="링크 복사">
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
    </Button>
  );
}
