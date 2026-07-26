/**
 * textarea 안 특정 줄의 y좌표를 재는 유틸.
 *
 * textarea는 줄마다 DOM 노드가 없어서 "12번째 줄이 위에서 몇 px인가"를 직접 물어볼 수 없다.
 * 그래서 글꼴·폭·패딩이 똑같은 미러 div를 화면 밖에 두고 같은 텍스트를 흘려 넣는다.
 * 줄바꿈 규칙이 동일하므로 미러의 좌표가 곧 textarea의 좌표다.
 */

/** 미러가 textarea와 똑같이 줄을 나누게 하는 데 필요한 속성들 */
const COPIED_STYLES = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "font-stretch",
  "letter-spacing",
  "line-height",
  "text-indent",
  "text-transform",
  "word-spacing",
  "tab-size",
  "overflow-wrap",
  "word-break",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
] as const;

let mirror: HTMLDivElement | null = null;

function ensureMirror(): HTMLDivElement {
  if (mirror?.isConnected) return mirror;

  const node = document.createElement("div");
  node.setAttribute("aria-hidden", "true");
  // 화면 밖 고정 배치 — 레이아웃에도, 스크롤 영역에도 영향을 주지 않는다
  node.style.cssText =
    "position:fixed;top:0;left:-99999px;visibility:hidden;pointer-events:none;" +
    "white-space:pre-wrap;box-sizing:content-box;border:0;margin:0;";
  document.body.appendChild(node);
  mirror = node;
  return node;
}

/** 각 줄이 시작하는 문자 offset (0-based). 인덱스 i가 i+1번째 줄. */
function lineStartOffsets(value: string): number[] {
  const starts = [0];
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

/**
 * 주어진 줄들의 top을 스크롤 컨텐츠 기준 y(px)로 돌려준다.
 * textarea의 위쪽 패딩도 스크롤 컨텐츠에 포함되므로 첫 줄의 y는 padding-top이 되고,
 * 그대로 scrollTop과 같은 좌표계가 된다.
 *
 * @param lines 1-based 줄 번호. **오름차순**이어야 한다.
 */
export function measureLineTops(
  textarea: HTMLTextAreaElement,
  lines: number[],
): number[] {
  if (lines.length === 0) return [];
  if (textarea.clientWidth === 0) return lines.map(() => 0);

  const value = textarea.value;
  const style = window.getComputedStyle(textarea);
  const node = ensureMirror();

  for (const prop of COPIED_STYLES) {
    node.style.setProperty(prop, style.getPropertyValue(prop));
  }
  // 보더는 0으로 두고 컨텐츠 폭만 맞춘다 — clientWidth는 패딩을 포함하고 보더·스크롤바는 뺀 값
  const contentWidth =
    textarea.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  node.style.width = `${Math.max(0, contentWidth)}px`;

  const starts = lineStartOffsets(value);
  const markers: HTMLSpanElement[] = [];
  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const line of lines) {
    const offset = starts[Math.min(Math.max(line, 1), starts.length) - 1];
    if (offset > cursor) {
      fragment.appendChild(
        document.createTextNode(value.slice(cursor, offset)),
      );
      cursor = offset;
    }
    // 빈 span은 폭이 0이고, 줄 시작(이미 강제 개행 지점)에만 놓이므로 줄바꿈을 바꾸지 않는다
    const marker = document.createElement("span");
    fragment.appendChild(marker);
    markers.push(marker);
  }
  fragment.appendChild(document.createTextNode(value.slice(cursor)));

  node.replaceChildren(fragment);

  // 쓰기가 끝난 뒤 한 번에 읽는다 (레이아웃 스래싱 방지)
  const originTop = node.getBoundingClientRect().top;
  const tops = markers.map(
    (marker) => marker.getBoundingClientRect().top - originTop,
  );

  node.replaceChildren(); // 본문을 붙들고 있지 않도록 비운다
  return tops;
}
