"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCopy, IconCheck } from "@tabler/icons-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";

// 코드 블록 컴포넌트
function CodeBlock({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden -mx-4 md:mx-0">
      {/* 헤더 바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-code-chrome">
        <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {copied ? (
            <>
              <IconCheck size={14} className="text-green-400" />
              <span className="text-green-400">복사됨</span>
            </>
          ) : (
            <>
              <IconCopy size={14} />
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {/* 코드 영역 */}
      <div className="bg-code-bg">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#565e6b",
            borderRight: "1px solid #262a33",
            marginRight: "1em",
          }}
          customStyle={{
            padding: "16px 0",
            margin: "0",
            backgroundColor: "#16181d",
            fontSize: "13px",
            lineHeight: "1.7",
          }}
          wrapLongLines
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// react-markdown이 넘기는 hast node는 DOM으로 스프레드하면 안 된다 (id 등만 통과)
function domProps(props: Record<string, unknown>) {
  const rest = { ...props };
  delete rest.node;
  delete rest.children;
  return rest;
}

export const markdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1
      {...domProps(props)}
      className="scroll-mt-24 text-2xl sm:text-3xl font-bold text-ink mt-12 mb-5 pt-8 border-t border-line first:border-0 first:pt-0 first:mt-0"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2
      {...domProps(props)}
      className="scroll-mt-24 text-xl sm:text-2xl font-bold text-ink mt-10 mb-4"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3
      {...domProps(props)}
      className="scroll-mt-24 text-lg sm:text-xl font-bold text-ink mt-8 mb-3"
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4
      {...domProps(props)}
      className="scroll-mt-24 text-base sm:text-lg font-bold text-ink mt-6 mb-2"
    >
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="text-body leading-8 mb-5 text-[15px] sm:text-base">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-ink">{children}</strong>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-[3px] border-accent bg-accent-soft/60 px-5 py-3 my-6 rounded-r-md text-body [&>p]:mb-0 [&>p+p]:mt-3">
      {children}
    </blockquote>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 mb-5 space-y-2 marker:text-faint">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-6 mb-5 space-y-2 marker:text-faint">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-body leading-relaxed text-[15px] sm:text-base">
      {children}
    </li>
  ),
  hr: () => <hr className="my-10 border-line" />,
  code: ({ children, className }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";
    const isCodeBlock = className?.includes("language-");

    if (isCodeBlock) {
      return (
        <CodeBlock language={language}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      );
    }
    return (
      <code className="bg-accent-soft text-accent-deep px-1.5 py-0.5 rounded font-mono text-[0.875em]">
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => <>{children}</>,
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-6 rounded-lg border border-line">
      <table className="w-full border-collapse text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-wash border-b border-line">{children}</thead>
  ),
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className="border-b border-line last:border-b-0">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left font-semibold text-ink">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-body">{children}</td>
  ),
  a: ({ href, children }: any) => {
    const isExternal =
      /^https?:\/\//.test(href || "") && !(href || "").startsWith(SITE_URL);
    return (
      <a
        href={href}
        className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition"
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  // 이미지가 <p> 안에 렌더링될 수 있어 유효한 중첩을 위해 span 기반으로 감싼다
  img: ({ src, alt }: any) => (
    <span className="block my-8">
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="rounded-xl w-full h-auto"
      />
      {alt && (
        <span className="block text-center text-sm text-faint mt-2.5">
          {alt}
        </span>
      )}
    </span>
  ),
};
