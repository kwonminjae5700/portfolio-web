/**
 * 코드 펜스 언어 자동완성용 로직.
 *
 * 언어 목록은 미리보기가 실제로 쓰는 Prism 번들(supportedLanguages)에서 그대로
 * 가져온다 — 하드코딩 목록과 렌더러가 어긋날 일이 없다. 여기에 사람들이 실제로
 * 치는 짧은 별칭(js, py, sh …)을 얹는데, 전부 refractor에 등록돼 있어 그대로
 * 코드 펜스에 넣어도 하이라이팅이 동작하는 값들만 담았다.
 */
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { isSelectionInsideCodeFence } from "./editorIndent";

const CANONICAL: string[] =
  (SyntaxHighlighter as unknown as { supportedLanguages?: string[] })
    .supportedLanguages ?? [];

/** refractor 등록 확인을 마친 별칭들 (rs·zsh·golang 등은 미등록이라 제외) */
const EXTRA_ALIASES = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "py",
  "rb",
  "kt",
  "cs",
  "sh",
  "shell",
  "yml",
  "md",
  "html",
  "xml",
  "svg",
  "dockerfile",
  "tex",
];

const ALL = Array.from(new Set([...CANONICAL, ...EXTRA_ALIASES]));
const ALL_SET = new Set(ALL);

/** 접두사가 비었을 때(``` 직후)와 정렬에서 앞세울 흔한 언어들 */
const POPULAR = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "javascript",
  "typescript",
  "python",
  "java",
  "html",
  "css",
  "scss",
  "bash",
  "sh",
  "json",
  "yaml",
  "sql",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "kotlin",
  "swift",
  "dart",
  "docker",
  "markdown",
  "diff",
  "http",
];
const POPULAR_RANK = new Map(POPULAR.map((lang, i) => [lang, i]));

export interface FenceLanguageContext {
  /** 언어 토큰이 시작하는 오프셋 (펜스 문자 바로 뒤) */
  tokenStart: number;
  /** 캐럿까지 입력된 언어 토큰 (빈 문자열 = ``` 직후) */
  token: string;
}

/**
 * 캐럿이 "여는 펜스의 언어 자리 끝"에 있을 때만 컨텍스트를 돌려준다.
 * 닫는 펜스(이미 열린 블록 안의 ```)에서는 언어가 올 수 없으므로 제안하지 않고,
 * 토큰 뒤에 다른 내용이 있는 줄도 건드리지 않는다.
 */
export function getFenceLanguageContext(
  value: string,
  selStart: number,
  selEnd: number,
): FenceLanguageContext | null {
  if (selStart !== selEnd) return null;
  const lineStart = value.lastIndexOf("\n", selStart - 1) + 1;
  let lineEnd = value.indexOf("\n", selStart);
  if (lineEnd === -1) lineEnd = value.length;
  if (selStart !== lineEnd) return null; // 토큰 끝(줄 끝)에서만 제안한다

  const line = value.slice(lineStart, lineEnd);
  const m = /^ {0,3}(?:`{3,}|~{3,})([A-Za-z0-9+#._-]*)$/.exec(line);
  if (!m) return null;
  if (isSelectionInsideCodeFence(value, lineStart, lineStart)) return null;

  return { tokenStart: lineEnd - m[1].length, token: m[1] };
}

/** 접두사로 언어를 거른다. 정확 일치 → 흔한 언어 → 알파벳 순. */
export function filterLanguages(prefix: string): string[] {
  const q = prefix.toLowerCase();
  return ALL.filter((lang) => lang.startsWith(q)).sort((a, b) => {
    if ((a === q) !== (b === q)) return a === q ? -1 : 1;
    const ra = POPULAR_RANK.get(a) ?? Infinity;
    const rb = POPULAR_RANK.get(b) ?? Infinity;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

/** 목록에 있는 유효한 언어인가 — Enter를 줄바꿈으로 통과시킬지 판단에 쓴다 */
export function isKnownLanguage(token: string): boolean {
  return ALL_SET.has(token.toLowerCase());
}
