"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import katex from "katex";
import "katex/dist/katex.min.css";
import { markdownComponents } from "./markdownComponents";

interface PostContentProps {
  content: string;
}

// 마크다운 내 수식을 KaTeX HTML로 전처리
function preprocessMath(markdown: string): string {
  // Display math: $$...$$ (멀티라인 지원)
  let result = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-block">${html}</div>`;
    } catch {
      return `$$${math}$$`;
    }
  });

  // Inline math: $...$ (한 줄 내에서만)
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      return `<span class="katex-inline">${html}</span>`;
    } catch {
      return `$${math}$`;
    }
  });

  return result;
}

export default function PostContent({ content }: PostContentProps) {
  const processedContent = preprocessMath(content);

  return (
    <div className="max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
