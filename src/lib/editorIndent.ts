/**
 * 에디터 textarea에서 코드 펜스 안 Tab 들여쓰기를 계산하는 순수 함수 모음.
 * DOM을 전혀 모르게 유지한다 — (content, selStart, selEnd)만 받아 편집 계획을
 * 돌려주고, 실제 적용(undo 보존 execCommand)은 PostEditor가 맡는다.
 */

/** 코드 펜스 안에서 Tab 들여쓰기에 쓰는 단위 (스페이스 2칸).
 * \t를 쓰지 않는 이유: 스크롤 동기화 미러(textareaLineMetrics.ts)와 미리보기가
 * 스페이스 기준으로 줄 폭을 계산하므로, 실제 탭 문자는 메트릭을 어긋나게 한다. */
export const INDENT = "  ";

/**
 * 펜스 줄 판정: 0~3칸 들여쓰기 + ``` 또는 ~~~ 3개 이상.
 * toc.ts의 펜스 제거 규칙(^ {0,3}(```|~~~))과 같은 세계관을 유지한다.
 * 4칸 이상 들여쓴 줄은 CommonMark상 들여쓰기 코드 블록이므로 펜스가 아니다.
 */
const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

export interface IndentEdit {
  /** 교체할 구간 [replaceStart, replaceEnd) — 여러 줄이면 줄 경계에 정렬됨 */
  replaceStart: number;
  replaceEnd: number;
  /** 구간을 대신할 텍스트 ("" 가능 — 아웃덴트로 전부 사라지는 경우) */
  replacement: string;
  /** 편집 후 복원할 선택 범위 */
  nextSelStart: number;
  nextSelEnd: number;
}

/** pos가 속한 줄의 시작 오프셋 */
function lineStartOf(content: string, pos: number): number {
  return content.lastIndexOf("\n", pos - 1) + 1;
}

/** pos가 속한 줄의 끝 오프셋 (개행 문자 앞, 마지막 줄이면 content.length) */
function lineEndOf(content: string, pos: number): number {
  const end = content.indexOf("\n", pos);
  return end === -1 ? content.length : end;
}

/**
 * 선택 범위 전체가 "열린 코드 펜스 안"에 있는지 판정한다.
 *
 * "안"의 정의: 그 줄이 시작되기 전에 펜스가 열려 있어야 한다. 따라서
 * - 여는 펜스 줄(```ts) 위 = 밖 — info string 위에서 들여쓰기는 무의미하고,
 *   평범한 텍스트 줄에서 Tab을 가로채면 키보드 내비게이션을 해친다.
 * - 닫는 펜스 줄(```) 위 = 안 — 시각적으로 아직 블록 안이라 포커스를 뺏는 쪽이
 *   더 놀랍다. 2칸 들여도 CommonMark상 닫는 펜스는 0~3칸까지 유효하다.
 * - 선택이 펜스 경계를 넘으면 false — 산문에 들여쓰기가 번지면 의도치 않은
 *   들여쓰기 코드 블록이 생길 수 있어, 기본 Tab(포커스 이동)이 안전하다.
 * - 닫히지 않은 펜스는 EOF까지 코드로 취급 (toc.ts와 동일).
 */
export function isSelectionInsideCodeFence(
  content: string,
  selStart: number,
  selEnd: number,
): boolean {
  const start = Math.max(0, Math.min(selStart, content.length));
  const end = Math.max(start, Math.min(selEnd, content.length));

  let open: { char: string; len: number } | null = null;
  let reachedStart = false;
  let lineStart = 0;

  while (lineStart <= end) {
    let lineEnd = content.indexOf("\n", lineStart);
    if (lineEnd === -1) lineEnd = content.length;

    // 선택 시작이 이 줄에 있다: "이 줄에 오기 전에" 펜스가 열려 있어야 안이다
    if (!reachedStart && start <= lineEnd) {
      if (open === null) return false;
      reachedStart = true;
    }
    // 선택 끝도 이 줄에 있으면 성공 — 시작~끝 사이에 펜스가 닫힌 적 없음
    if (reachedStart && end <= lineEnd) return true;

    const line = content.slice(lineStart, lineEnd);
    const m = FENCE_LINE.exec(line);
    if (m) {
      const char = m[1][0];
      if (open === null) {
        // 백틱 펜스의 info string에는 백틱이 올 수 없다 (CommonMark)
        if (!(char === "`" && m[2].includes("`"))) {
          open = { char, len: m[1].length };
        }
      } else if (
        char === open.char &&
        m[1].length >= open.len &&
        m[2].trim() === ""
      ) {
        if (reachedStart) return false; // 선택이 펜스 경계를 넘었다
        open = null;
      }
    }

    if (lineEnd === content.length) break;
    lineStart = lineEnd + 1;
  }

  // 닫히지 않은 펜스가 EOF까지 이어지는 경우 (선택 끝 == content.length)
  return reachedStart;
}

/**
 * Tab: 캐럿만 있으면 그 자리에 2칸, 선택이 있으면 걸친 모든 줄 머리에 2칸.
 * 줄 경계에 정렬된 블록 하나를 통으로 교체해 undo가 한 스텝이 되게 한다.
 */
export function computeIndentEdit(
  content: string,
  selStart: number,
  selEnd: number,
): IndentEdit {
  if (selStart === selEnd) {
    // 캐럿만 있음 — 캐럿 위치에 스페이스 2칸 (줄 시작의 빈 선택도 이 분기)
    return {
      replaceStart: selStart,
      replaceEnd: selStart,
      replacement: INDENT,
      nextSelStart: selStart + INDENT.length,
      nextSelEnd: selStart + INDENT.length,
    };
  }

  const blockStart = lineStartOf(content, selStart);
  let endLineStart = lineStartOf(content, selEnd);
  // 선택이 어느 줄의 0번째 칸에서 끝나면 그 줄은 제외 (VS Code/CodeMirror 관례)
  if (selEnd === endLineStart) {
    endLineStart = lineStartOf(content, selEnd - 1);
  }
  const blockEnd = lineEndOf(content, endLineStart);

  const lines = content.slice(blockStart, blockEnd).split("\n");
  // 빈 줄에는 공백을 남기지 않는다
  const indented = lines.map((l) => (l === "" ? l : INDENT + l));
  const count = lines.filter((l) => l !== "").length;

  return {
    replaceStart: blockStart,
    replaceEnd: blockEnd,
    replacement: indented.join("\n"),
    nextSelStart: selStart + (lines[0] === "" ? 0 : INDENT.length),
    // 모든 삽입 지점(포함된 줄의 시작)이 selEnd 이전이므로 전부 반영된다
    nextSelEnd: selEnd + INDENT.length * count,
  };
}

/**
 * Shift+Tab: 걸친 각 줄 머리에서 탭 1개 또는 스페이스 최대 2칸을 제거한다.
 * (탭 문자는 그 자체로 한 단계이므로, 탭+스페이스를 같이 지우면 과하게 지운다)
 * 지울 게 하나도 없으면 null — 호출부가 no-op으로 처리한다.
 */
export function computeOutdentEdit(
  content: string,
  selStart: number,
  selEnd: number,
): IndentEdit | null {
  const blockStart = lineStartOf(content, selStart);
  let endLineStart = lineStartOf(content, selEnd);
  if (selEnd > selStart && selEnd === endLineStart) {
    endLineStart = lineStartOf(content, selEnd - 1);
  }
  const blockEnd = lineEndOf(content, endLineStart);

  const lines = content.slice(blockStart, blockEnd).split("\n");
  const removedPerLine = lines.map((line) => {
    if (line.startsWith("\t")) return 1;
    if (line.startsWith(INDENT)) return INDENT.length;
    if (line.startsWith(" ")) return 1;
    return 0;
  });
  const totalRemoved = removedPerLine.reduce((a, b) => a + b, 0);
  if (totalRemoved === 0) return null;

  const replacement = lines
    .map((line, i) => line.slice(removedPerLine[i]))
    .join("\n");

  // 선택 복원: 지워진 글자는 전부 각 줄 머리에 있었다.
  // 캐럿이 지워진 공백 안에 있었다면 줄 머리로 붙인다.
  const nextSelStart = Math.max(blockStart, selStart - removedPerLine[0]);

  // 마지막 포함 줄에서 selEnd 앞에 있던 제거분만 반영한다
  const removedBeforeEnd =
    removedPerLine.slice(0, -1).reduce((a, b) => a + b, 0) +
    Math.min(
      removedPerLine[removedPerLine.length - 1],
      Math.max(0, selEnd - endLineStart),
    );
  const nextSelEnd = Math.max(nextSelStart, selEnd - removedBeforeEnd);

  return {
    replaceStart: blockStart,
    replaceEnd: blockEnd,
    replacement,
    nextSelStart,
    nextSelEnd,
  };
}
