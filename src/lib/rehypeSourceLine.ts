import type { Element, Root } from "hast";

/** 렌더된 블록이 원문 몇 번째 줄에서 왔는지 표시하는 속성 */
export const SOURCE_LINE_ATTR = "data-source-line";

interface Options {
  /** 파서가 본 줄 번호를 사용자가 에디터에서 보는 줄 번호로 되돌린다 */
  toSourceLine: (line: number) => number;
}

function stamp(node: Element, line: number) {
  node.properties = { ...node.properties, [SOURCE_LINE_ATTR]: line };
}

/**
 * 최상위 블록에 원문 줄 번호를 심는 rehype 플러그인.
 * 에디터 미리보기의 스크롤 동기화가 이 속성을 앵커로 삼는다.
 *
 * 최상위만 훑는 이유: 앵커는 "이 근처가 원문 몇 줄쯤"을 알려주는 눈금이면 충분하고,
 * 문단 안쪽까지 파고들면 눈금만 많아지고 정확도는 나아지지 않는다.
 *
 * rehypeRaw보다 **앞에** 두어야 한다. raw 노드(KaTeX 블록, 인라인 HTML)는
 * position이 없어 눈금이 안 붙지만, 앞뒤 앵커 사이 보간으로 덮인다.
 */
export function rehypeSourceLine(options: Options) {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type !== "element") continue;
      const parsedLine = node.position?.start.line;
      if (parsedLine === undefined) continue;

      const line = options.toSourceLine(parsedLine);
      stamp(node, line);

      // markdownComponents의 pre는 <>{children}</>로 사라지므로 안쪽 code에도 찍는다
      if (node.tagName === "pre") {
        const code = node.children.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "code",
        );
        if (code) stamp(code, line);
      }
    }
  };
}
