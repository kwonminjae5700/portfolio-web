"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { PluggableList } from "unified";
import "katex/dist/katex.min.css";
import { preprocessMath } from "@/lib/markdownSource";
import { rehypeSourceLine } from "@/lib/rehypeSourceLine";
import { markdownComponents } from "./markdownComponents";

interface PostContentProps {
  content: string;
  /**
   * 최상위 블록에 data-source-line을 심는다. 에디터 미리보기 전용 —
   * 상세 페이지는 켜지 않아 마크업이 지금 그대로 유지된다.
   */
  sourceLineAnchors?: boolean;
}

export default function PostContent({
  content,
  sourceLineAnchors = false,
}: PostContentProps) {
  const { processedContent, rehypePlugins } = useMemo(() => {
    const { content: processed, toSourceLine } = preprocessMath(content);
    const plugins: PluggableList = sourceLineAnchors
      ? [[rehypeSourceLine, { toSourceLine }], rehypeRaw, rehypeSlug]
      : [rehypeRaw, rehypeSlug];
    return { processedContent: processed, rehypePlugins: plugins };
  }, [content, sourceLineAnchors]);

  return (
    <div className="max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
