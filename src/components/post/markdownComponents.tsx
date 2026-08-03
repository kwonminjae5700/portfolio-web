"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darkroom } from "./codeTheme";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { SOURCE_LINE_ATTR } from "@/lib/rehypeSourceLine";
import { SITE_URL } from "@/lib/constants";
import MermaidBlock from "./MermaidBlock";

// 코드 블록 컴포넌트
function CodeBlock({
  children,
  language,
  anchor,
}: {
  children: string;
  language: string;
  anchor?: AnchorProps;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div {...anchor} className="my-6 rounded-lg overflow-hidden -mx-4 md:mx-0">
      {/* 헤더 바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-code-chrome">
        <span className="font-mono text-[11px] uppercase tracking-wider text-code-muted">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-code-muted hover:text-code-fg transition-colors px-2 py-1 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {copied ? (
            <>
              <IconCheck size={14} className="text-accent-on-dark" />
              <span className="text-accent-on-dark">복사됨</span>
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
          style={darkroom}
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
  delete rest[SOURCE_LINE_ATTR];
  delete rest.dataSourceLine;
  return rest;
}

type AnchorProps = Record<string, unknown> | undefined;

/**
 * 에디터 미리보기의 스크롤 동기화 앵커(data-source-line)를 DOM까지 흘려보낸다.
 * react-markdown 버전에 따라 하이픈/카멜 어느 쪽으로 넘어올지 확실치 않아 둘 다 읽고,
 * 내보낼 때는 항상 하이픈 형태로 고정한다.
 * rehypeSourceLine을 켜지 않은 상세 페이지에서는 undefined라 속성 자체가 붙지 않는다.
 */
function anchorProps(props: Record<string, unknown>): AnchorProps {
  const line = props[SOURCE_LINE_ATTR] ?? props.dataSourceLine;
  return line === undefined ? undefined : { [SOURCE_LINE_ATTR]: line };
}

export const markdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1
      {...domProps(props)}
      {...anchorProps(props)}
      className="scroll-mt-24 text-2xl sm:text-3xl font-bold text-ink mt-12 mb-5 pt-8 border-t border-line first:border-0 first:pt-0 first:mt-0"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2
      {...domProps(props)}
      {...anchorProps(props)}
      className="scroll-mt-24 text-xl sm:text-2xl font-bold text-ink mt-10 mb-4"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3
      {...domProps(props)}
      {...anchorProps(props)}
      className="scroll-mt-24 text-lg sm:text-xl font-bold text-ink mt-8 mb-3"
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4
      {...domProps(props)}
      {...anchorProps(props)}
      className="scroll-mt-24 text-base sm:text-lg font-bold text-ink mt-6 mb-2"
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p
      {...anchorProps(props)}
      className="text-body leading-8 mb-5 text-[15px] sm:text-base"
    >
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-ink">{children}</strong>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...anchorProps(props)}
      className="border-l-[3px] border-accent bg-accent-soft/60 px-5 py-3 my-6 rounded-r-md text-body [&>p]:mb-0 [&>p+p]:mt-3"
    >
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }: any) => (
    <ul
      {...anchorProps(props)}
      className="list-disc pl-6 mb-5 space-y-2 marker:text-faint"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol
      {...anchorProps(props)}
      className="list-decimal pl-6 mb-5 space-y-2 marker:text-faint"
    >
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-body leading-relaxed text-[15px] sm:text-base">
      {children}
    </li>
  ),
  hr: ({ ...props }: any) => (
    <hr {...anchorProps(props)} className="my-10 border-line" />
  ),
  code: ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";
    const isCodeBlock = className?.includes("language-");

    // mermaid 펜스는 코드가 아니라 다이어그램으로 렌더링한다
    // (빈 펜스는 children이 undefined라 ?? ""로 방어 — "undefined"가 소스가 되면 안 된다)
    if (isCodeBlock && language === "mermaid") {
      return (
        <MermaidBlock
          source={String(children ?? "").replace(/\n$/, "")}
          anchor={anchorProps(props)}
        />
      );
    }

    if (isCodeBlock) {
      return (
        <CodeBlock language={language} anchor={anchorProps(props)}>
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
  table: ({ children, ...props }: any) => (
    <div
      {...anchorProps(props)}
      className="overflow-x-auto mb-6 rounded-lg border border-line"
    >
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
