import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

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
    const language = match ? match[1] : "javascript";
    const isCodeBlock = className?.includes("language-");

    if (isCodeBlock) {
      return (
        <div
          className="my-6 rounded-lg overflow-hidden shadow-md -mx-4 md:mx-0"
          style={{ backgroundColor: "#1e1e1e" }}
        >
          <SyntaxHighlighter
            language={language}
            style={atomOneDark}
            customStyle={{
              padding: "24px",
              margin: "0",
              backgroundColor: "#1e1e1e",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
            wrapLongLines
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    }
    return (
      <code className="bg-gray-100 text-blue-600 px-2 py-1 rounded font-mono text-sm">
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
