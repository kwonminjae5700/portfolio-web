import katex from "katex";

/**
 * 마크다운 원문 전처리.
 *
 * 수식을 KaTeX HTML로 바꾸는 과정에서 멀티라인 $$...$$가 한 줄로 접히기 때문에,
 * 파서가 보는 줄 번호와 사용자가 에디터에서 보는 줄 번호가 어긋난다.
 * (3줄짜리 수식 하나만 있어도 그 아래 전부 2줄씩 밀린다)
 * 에디터 스크롤 동기화가 이 줄 번호에 의존하므로, 전처리와 함께 되돌리는
 * 변환표도 만들어 둔다.
 */
export interface ProcessedMarkdown {
  /** 전처리된 마크다운 — 기존 렌더 경로가 쓰던 문자열과 동일하다 */
  content: string;
  /** 전처리 결과의 줄 번호(1-based) → 원본 줄 번호(1-based) */
  toSourceLine: (processedLine: number) => number;
}

/** "이 출력 줄부터는 원본 줄 = 출력 줄 + delta" 구간 */
interface LineShift {
  outLine: number;
  delta: number;
}

function countNewlines(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) count++;
  }
  return count;
}

/**
 * String.replace와 같은 결과를 내면서 줄 번호 변환표를 함께 만든다.
 *
 * 치환 구간 안쪽은 매치 시작 줄로 뭉뚱그린다 — 수식 한 덩어리는 어차피
 * 하나의 앵커로 취급되므로 그 안에서 줄을 더 쪼갤 이유가 없다.
 */
function replaceWithLineMap(
  source: string,
  pattern: RegExp,
  replace: (match: RegExpExecArray) => string,
): { text: string; mapLine: (outLine: number) => number } {
  const shifts: LineShift[] = [];
  const pushShift = (outLine: number, delta: number) => {
    // 같은 줄(또는 뒤로 간 줄)에 이미 찍힌 구간은 나중 것이 이긴다
    while (shifts.length > 0 && shifts[shifts.length - 1].outLine >= outLine) {
      shifts.pop();
    }
    const last = shifts[shifts.length - 1];
    if (last && last.delta === delta) return; // 달라진 게 없으면 구간을 늘리지 않는다
    shifts.push({ outLine, delta });
  };

  pushShift(1, 0);

  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  const regex = new RegExp(pattern.source, flags);
  let out = "";
  let lastIndex = 0;
  let srcLine = 1;
  let outLine = 1;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    if (match[0].length === 0) {
      regex.lastIndex++; // 빈 매치 방어 (무한 루프)
      continue;
    }

    const gap = source.slice(lastIndex, match.index);
    const gapLines = countNewlines(gap);
    out += gap;
    srcLine += gapLines;
    outLine += gapLines;

    // 치환 결과가 걸치는 줄들은 통째로 매치 시작 줄로 본다
    pushShift(outLine, srcLine - outLine);

    const replacement = replace(match);
    out += replacement;
    srcLine += countNewlines(match[0]);
    outLine += countNewlines(replacement);
    lastIndex = match.index + match[0].length;

    // 새 기준은 치환이 끝난 **다음 줄**부터다. 치환이 끝난 그 줄은 위에서 이미
    // 매치 시작 줄로 잡았고, 그래야 한 줄로 접힌 수식이 제 줄 번호를 지킨다.
    pushShift(outLine + 1, srcLine - outLine);
  }

  out += source.slice(lastIndex);

  const mapLine = (line: number): number => {
    let delta = 0;
    for (const shift of shifts) {
      if (shift.outLine > line) break;
      delta = shift.delta;
    }
    return Math.max(1, line + delta);
  };

  return { text: out, mapLine };
}

/**
 * 마크다운 내 수식을 KaTeX HTML로 전처리한다.
 * 상세 페이지와 에디터 미리보기가 같은 결과를 봐야 하므로 여기 한 곳만 쓴다.
 */
export function preprocessMath(markdown: string): ProcessedMarkdown {
  // Display math: $$...$$ (멀티라인 지원)
  const display = replaceWithLineMap(markdown, /\$\$([\s\S]+?)\$\$/g, (m) => {
    try {
      const html = katex.renderToString(m[1].trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-block">${html}</div>`;
    } catch {
      return `$$${m[1]}$$`;
    }
  });

  // Inline math: $...$ (한 줄 내에서만)
  const inline = replaceWithLineMap(display.text, /\$([^$\n]+?)\$/g, (m) => {
    try {
      const html = katex.renderToString(m[1].trim(), {
        displayMode: false,
        throwOnError: false,
      });
      return `<span class="katex-inline">${html}</span>`;
    } catch {
      return `$${m[1]}$`;
    }
  });

  return {
    content: inline.text,
    // 최종 → 인라인 패스 입력 → 원본 순으로 되짚는다
    toSourceLine: (line) => display.mapLine(inline.mapLine(line)),
  };
}
