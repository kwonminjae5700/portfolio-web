import type { CSSProperties } from "react";

/**
 * 코드 하이라이트 테마 — '암실(darkroom)' 팔레트.
 * 기성 oneDark(보라 키워드·청록 함수)를 걷어내고, 사이트 브랜드인 파인 그린에
 * 웜 샌드 한 톤을 더한 절제된 2색 강조로 재구성했다. 배경은 --color-code-bg(#16181d),
 * 본문은 오프화이트로 다크 위 대비를 확보한다.
 *
 * react-syntax-highlighter(Prism)의 `style` prop 형식(토큰 타입 → CSS) 객체.
 */
export const darkroom: { [key: string]: CSSProperties } = {
  'code[class*="language-"]': {
    color: "#d6dae0",
    background: "none",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.7",
    tabSize: 4,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#d6dae0",
    background: "#16181d",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.7",
    tabSize: 4,
    hyphens: "none",
    margin: 0,
    overflow: "auto",
  },
  comment: { color: "#6b7280", fontStyle: "italic" },
  prolog: { color: "#6b7280" },
  cdata: { color: "#6b7280" },
  doctype: { color: "#9aa0aa" },
  punctuation: { color: "#9aa0aa" },
  namespace: { opacity: "0.7" },
  property: { color: "#c8cdd4" },
  variable: { color: "#c8cdd4" },
  keyword: { color: "#6fb391" },
  "keyword-control": { color: "#6fb391" },
  tag: { color: "#6fb391" },
  operator: { color: "#8a93a0" },
  entity: { color: "#6fb391", cursor: "help" },
  url: { color: "#6fb391" },
  atrule: { color: "#86cfae" },
  function: { color: "#86cfae" },
  "function-variable": { color: "#86cfae" },
  builtin: { color: "#86cfae" },
  selector: { color: "#86cfae" },
  "class-name": { color: "#e6c493" },
  boolean: { color: "#d8a978" },
  constant: { color: "#d8a978" },
  symbol: { color: "#d8a978" },
  number: { color: "#d8a978" },
  important: { color: "#d8a978", fontWeight: "bold" },
  string: { color: "#cbb08a" },
  char: { color: "#cbb08a" },
  "attr-name": { color: "#cbb08a" },
  "attr-value": { color: "#cbb08a" },
  regex: { color: "#cbb08a" },
  deleted: { color: "#e0796f" },
  inserted: { color: "#8fc9a4" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};
