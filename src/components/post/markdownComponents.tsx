"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCopy, IconCheck } from "@tabler/icons-react";

// 언어별 표시 이름과 색상
const languageConfig: Record<
  string,
  { name: string; color: string; bgColor: string }
> = {
  javascript: {
    name: "JavaScript",
    color: "#f7df1e",
    bgColor: "rgba(247, 223, 30, 0.2)",
  },
  js: {
    name: "JavaScript",
    color: "#f7df1e",
    bgColor: "rgba(247, 223, 30, 0.2)",
  },
  typescript: {
    name: "TypeScript",
    color: "#3178c6",
    bgColor: "rgba(49, 120, 198, 0.2)",
  },
  ts: {
    name: "TypeScript",
    color: "#3178c6",
    bgColor: "rgba(49, 120, 198, 0.2)",
  },
  tsx: { name: "TSX", color: "#3178c6", bgColor: "rgba(49, 120, 198, 0.2)" },
  jsx: { name: "JSX", color: "#61dafb", bgColor: "rgba(97, 218, 251, 0.2)" },
  python: {
    name: "Python",
    color: "#3776ab",
    bgColor: "rgba(55, 118, 171, 0.2)",
  },
  py: { name: "Python", color: "#3776ab", bgColor: "rgba(55, 118, 171, 0.2)" },
  java: { name: "Java", color: "#ed8b00", bgColor: "rgba(237, 139, 0, 0.2)" },
  cpp: { name: "C++", color: "#00599c", bgColor: "rgba(0, 89, 156, 0.2)" },
  c: { name: "C", color: "#a8b9cc", bgColor: "rgba(168, 185, 204, 0.2)" },
  csharp: { name: "C#", color: "#239120", bgColor: "rgba(35, 145, 32, 0.2)" },
  cs: { name: "C#", color: "#239120", bgColor: "rgba(35, 145, 32, 0.2)" },
  go: { name: "Go", color: "#00add8", bgColor: "rgba(0, 173, 216, 0.2)" },
  rust: { name: "Rust", color: "#dea584", bgColor: "rgba(222, 165, 132, 0.2)" },
  ruby: { name: "Ruby", color: "#cc342d", bgColor: "rgba(204, 52, 45, 0.2)" },
  php: { name: "PHP", color: "#777bb4", bgColor: "rgba(119, 123, 180, 0.2)" },
  swift: {
    name: "Swift",
    color: "#fa7343",
    bgColor: "rgba(250, 115, 67, 0.2)",
  },
  kotlin: {
    name: "Kotlin",
    color: "#7f52ff",
    bgColor: "rgba(127, 82, 255, 0.2)",
  },
  html: { name: "HTML", color: "#e34f26", bgColor: "rgba(227, 79, 38, 0.2)" },
  css: { name: "CSS", color: "#1572b6", bgColor: "rgba(21, 114, 182, 0.2)" },
  scss: { name: "SCSS", color: "#c6538c", bgColor: "rgba(198, 83, 140, 0.2)" },
  sass: { name: "Sass", color: "#c6538c", bgColor: "rgba(198, 83, 140, 0.2)" },
  json: { name: "JSON", color: "#292929", bgColor: "rgba(200, 200, 200, 0.2)" },
  yaml: { name: "YAML", color: "#cb171e", bgColor: "rgba(203, 23, 30, 0.2)" },
  yml: { name: "YAML", color: "#cb171e", bgColor: "rgba(203, 23, 30, 0.2)" },
  markdown: {
    name: "Markdown",
    color: "#083fa1",
    bgColor: "rgba(8, 63, 161, 0.2)",
  },
  md: { name: "Markdown", color: "#083fa1", bgColor: "rgba(8, 63, 161, 0.2)" },
  sql: { name: "SQL", color: "#e38c00", bgColor: "rgba(227, 140, 0, 0.2)" },
  bash: { name: "Bash", color: "#4eaa25", bgColor: "rgba(78, 170, 37, 0.2)" },
  shell: { name: "Shell", color: "#4eaa25", bgColor: "rgba(78, 170, 37, 0.2)" },
  sh: { name: "Shell", color: "#4eaa25", bgColor: "rgba(78, 170, 37, 0.2)" },
  docker: {
    name: "Docker",
    color: "#2496ed",
    bgColor: "rgba(36, 150, 237, 0.2)",
  },
  dockerfile: {
    name: "Dockerfile",
    color: "#2496ed",
    bgColor: "rgba(36, 150, 237, 0.2)",
  },
  graphql: {
    name: "GraphQL",
    color: "#e10098",
    bgColor: "rgba(225, 0, 152, 0.2)",
  },
  text: { name: "Text", color: "#888888", bgColor: "rgba(136, 136, 136, 0.2)" },
};

// 코드 블록 컴포넌트
function CodeBlock({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const config = languageConfig[language.toLowerCase()] || {
    name: language.toUpperCase(),
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.2)",
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden shadow-lg -mx-4 md:mx-0 border border-gray-700/50">
      {/* 헤더 바 */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: "#2d2d2d" }}
      >
        {/* 언어 배지 */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-md"
            style={{
              color: config.color,
              backgroundColor: config.bgColor,
              border: `1px solid ${config.color}40`,
            }}
          >
            {config.name}
          </span>
        </div>

        {/* 복사 버튼 */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          {copied ? (
            <>
              <IconCheck size={14} className="text-green-400" />
              <span className="text-green-400">복사됨!</span>
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
      <div style={{ backgroundColor: "#1e1e1e" }}>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "#6b7280",
            borderRight: "1px solid #374151",
            marginRight: "1em",
          }}
          customStyle={{
            padding: "16px 0",
            margin: "0",
            backgroundColor: "#1e1e1e",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
          wrapLongLines
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-bold text-gray-900 mt-12 mb-6 pt-8 border-t border-gray-200 first:border-0 first:pt-0 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="text-gray-700 leading-8 mb-6">{children}</p>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 px-6 py-4 my-6 rounded-r-lg">
      <div className="text-gray-700 italic">{children}</div>
    </blockquote>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-6 space-y-3">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-6 space-y-3">{children}</ol>
  ),
  li: ({ children }: any) => <li className="text-gray-700 ml-2">{children}</li>,
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
      <code className="bg-linear-to-r from-blue-50 to-indigo-50 text-blue-600 px-2 py-0.5 rounded-md font-mono text-sm border border-blue-100">
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => <>{children}</>,
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-gray-100 border-b-2 border-gray-300">{children}</thead>
  ),
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left font-semibold text-gray-900">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-gray-700">{children}</td>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-700 underline font-semibold transition"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: any) => (
    <div className="my-8 rounded-lg overflow-hidden shadow-md">
      <img src={src} alt={alt} className="w-full h-auto" />
    </div>
  ),
};
