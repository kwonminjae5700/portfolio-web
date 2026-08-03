"use client";

import { Modal } from "@/components/ui";

interface MarkdownHelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface HelpRow {
  /** 그대로 복사해 쓸 수 있는 문법 예시 (모노스페이스로 표시) */
  syntax: string;
  /** 설명 또는 간단한 렌더링 예 */
  description: React.ReactNode;
}

interface HelpSection {
  heading: string;
  rows: HelpRow[];
  /** 섹션 하단 주의사항 */
  note?: string;
}

/**
 * 실제 렌더러가 지원하는 것만 싣는다 — 정본은 PostContent 파이프라인:
 * remark-gfm(표·취소선·체크리스트·오토링크·각주) + rehype-raw(HTML) +
 * rehype-slug(제목 앵커) + markdownSource.ts의 커스텀 KaTeX 전처리 +
 * markdownComponents.tsx의 코드 블록(언어 라벨·줄 번호·복사 버튼) +
 * MermaidBlock(```mermaid 펜스의 다이어그램 렌더링).
 * 렌더러 플러그인을 바꾸면 여기도 같이 고칠 것.
 */
const HELP_SECTIONS: HelpSection[] = [
  {
    heading: "제목",
    rows: [
      { syntax: "# 제목 1", description: "가장 큰 제목" },
      { syntax: "## 제목 2", description: "본문의 큰 단락 구분" },
      { syntax: "### 제목 3", description: "작은 단락 구분" },
      { syntax: "#### 제목 4", description: "세부 항목" },
    ],
    note: "제목에는 자동으로 앵커가 생겨 목차와 링크에 사용됩니다.",
  },
  {
    heading: "텍스트 강조",
    rows: [
      {
        syntax: "**굵게**",
        description: <strong className="font-bold">굵게</strong>,
      },
      { syntax: "*기울임*", description: <em>기울임</em> },
      { syntax: "~~취소선~~", description: <del>취소선</del> },
      {
        syntax: "`인라인 코드`",
        description: (
          <code className="px-1.5 py-0.5 rounded bg-accent-soft text-accent-deep font-mono text-[0.85em]">
            인라인 코드
          </code>
        ),
      },
    ],
  },
  {
    heading: "목록",
    rows: [
      { syntax: "- 항목", description: "순서 없는 목록" },
      { syntax: "1. 항목", description: "순서 있는 목록" },
      { syntax: "  - 들여쓴 항목", description: "공백 2칸으로 중첩" },
      {
        syntax: "- [ ] 할 일\n- [x] 완료한 일",
        description: "체크리스트",
      },
    ],
  },
  {
    heading: "링크",
    rows: [
      {
        syntax: "[표시할 텍스트](https://example.com)",
        description: "외부 링크는 새 탭에서 열립니다",
      },
      {
        syntax: "https://example.com",
        description: "URL만 써도 자동으로 링크가 됩니다",
      },
      {
        syntax: "[글 제목](/post/12)",
        description: "내 글 링크 — 툴바의 '글 참조' 버튼으로 넣을 수 있습니다",
      },
    ],
  },
  {
    heading: "이미지",
    rows: [
      {
        syntax: "![설명](이미지 URL)",
        description: "설명(alt)은 이미지 아래 캡션으로 표시됩니다",
      },
    ],
    note: "'이미지' 버튼, 드래그, 붙여넣기로도 넣을 수 있습니다 (자동 업로드).",
  },
  {
    heading: "코드 블록",
    rows: [
      {
        syntax: "```js\nconst x = 1;\n```",
        description:
          "언어 이름을 쓰면 문법 강조, 언어 라벨, 줄 번호, 복사 버튼이 붙습니다",
      },
    ],
    note: "``` 뒤에 언어 이름을 입력하면 지원 언어 자동완성 목록이 떠서 골라 넣을 수 있습니다 (↑↓로 이동, Tab/Enter로 선택). 코드 블록 안에서는 Tab 키로 2칸 들여쓰기, Shift+Tab으로 내어쓰기가 되고, 언어를 생략하면 강조 없이 표시됩니다.",
  },
  {
    heading: "인용",
    rows: [{ syntax: "> 인용문", description: "왼쪽에 선이 있는 인용 블록" }],
  },
  {
    heading: "표",
    rows: [
      {
        syntax: "| 항목 | 값 |\n| --- | --- |\n| A | 1 |",
        description: "파이프(|)로 구분한 표",
      },
    ],
  },
  {
    heading: "구분선",
    rows: [{ syntax: "---", description: "가로 구분선" }],
  },
  {
    heading: "각주",
    rows: [
      {
        syntax: "본문[^1]\n\n[^1]: 각주 내용",
        description: "본문 끝에 각주 목록이 만들어집니다",
      },
    ],
  },
  {
    heading: "수식 (KaTeX)",
    rows: [
      {
        syntax: "$E = mc^2$",
        description: "인라인 수식 — 반드시 한 줄 안에 있어야 합니다",
      },
      {
        syntax: "$$\nE = mc^2\n$$",
        description: "블록 수식 — 여러 줄 가능, 가운데 정렬로 표시됩니다",
      },
    ],
    note: "문장에 $ 기호가 두 번 나오면 수식으로 해석되니 주의하세요.",
  },
  {
    heading: "다이어그램 (Mermaid)",
    rows: [
      {
        syntax: "```mermaid\nflowchart LR\n  A[시작] --> B{판단}\n  B -->|예| C[완료]\n```",
        description: "코드 펜스 언어를 mermaid로 쓰면 다이어그램으로 렌더링됩니다",
      },
    ],
    note: "flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, pie 등 Mermaid 문법을 지원합니다. 문법 오류가 있으면 미리보기에 오류 안내가 표시됩니다.",
  },
  {
    heading: "HTML",
    rows: [
      {
        syntax: "<br />, <details>...</details>",
        description: "인라인 HTML도 그대로 렌더링됩니다",
      },
    ],
  },
];

/** 에디터에서 지원하는 마크다운 문법을 한눈에 보여주는 도움말 모달 */
export default function MarkdownHelpModal({
  open,
  onClose,
}: MarkdownHelpModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="마크다운 작성 도움말"
      panelClassName="max-w-2xl"
    >
      <div className="px-5 py-4 space-y-6">
        {HELP_SECTIONS.map((section) => (
          <section key={section.heading}>
            <h3 className="text-sm font-semibold text-ink mb-2">
              {section.heading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-1.5 items-baseline">
              {section.rows.map((row) => (
                <div key={row.syntax} className="contents">
                  <code className="font-mono text-[13px] text-body bg-wash rounded px-2 py-1 whitespace-pre-wrap break-all">
                    {row.syntax}
                  </code>
                  <div className="text-sm text-muted mb-2 sm:mb-0">
                    {row.description}
                  </div>
                </div>
              ))}
            </div>
            {section.note && (
              <p className="text-xs text-faint mt-1.5">{section.note}</p>
            )}
          </section>
        ))}
      </div>
    </Modal>
  );
}
