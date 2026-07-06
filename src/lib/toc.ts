import GithubSlugger from "github-slugger";

export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

/**
 * 헤딩 텍스트에서 인라인 마크다운 문법을 제거해 순수 텍스트로 만든다.
 * rehype-slug가 렌더링된 헤딩의 텍스트를 슬러그화하므로, 같은 결과가 나오도록 맞춘다.
 * 주의: snake_case처럼 단어 안의 밑줄은 CommonMark에서 강조가 아니므로 보존한다.
 */
function headingToPlainText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // 이미지 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 링크 → 라벨
    .replace(/`([^`]+)`/g, "$1") // 인라인 코드
    .replace(/\*\*(.*?)\*\*/g, "$1") // 볼드(별표)
    .replace(/\*(.*?)\*/g, "$1") // 이탤릭(별표)
    .replace(/(?<=^|\s)__(.+?)__(?=$|\s|[.,!?);:])/g, "$1") // 볼드(밑줄, 단어 경계만)
    .replace(/(?<=^|\s)_(.+?)_(?=$|\s|[.,!?);:])/g, "$1") // 이탤릭(밑줄, 단어 경계만)
    .replace(/~~(.*?)~~/g, "$1") // 취소선
    .replace(/<[^>]+>/g, "") // HTML 태그
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 마크다운 본문에서 h1~h3 목차를 추출한다.
 * 슬러그는 rehype-slug와 동일하게 github-slugger로 생성한다.
 *
 * rehype-slug는 렌더링된 모든 헤딩(h1~h6)에 id를 붙이므로, 중복 슬러그 카운터가
 * 어긋나지 않도록 여기서도 같은 것들을 같은 순서로 슬러그 계산에 포함한다:
 * - ATX 헤딩(들여쓰기 0~3칸), 인용문 안의 ATX 헤딩, raw HTML <h1>~<h6>
 * - h4~h6은 카운터 정렬을 위해 계산만 하고 반환 목록에서는 제외
 * 알려진 한계(발생 시 해당 항목만 동작하지 않고 스크롤스파이는 무시):
 * - setext 헤딩(밑줄 스타일), 수식 $...$이 포함된 헤딩
 */
export function extractToc(markdown: string): TocItem[] {
  // 코드 펜스 제거: ``` 와 ~~~ 짝 펜스 + 닫히지 않은 마지막 펜스(문서 끝까지 코드로 취급)
  const withoutCode = markdown
    .replace(/^ {0,3}(```|~~~)[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm, "")
    .replace(/^ {0,3}(?:```|~~~)[\s\S]*$/m, "");

  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  // ATX(인용문 포함) | raw HTML 헤딩 — 문서 순서대로 처리해야 중복 카운터가 맞는다
  const headingRegex =
    /^ {0,3}(?:> ?)*(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$|<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\3\s*>/gim;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(withoutCode)) !== null) {
    const level = match[1] ? match[1].length : Number(match[3]);
    const text = headingToPlainText(match[1] ? match[2] : match[4]);
    if (!text) continue;
    const id = slugger.slug(text);
    if (level <= 3) {
      items.push({ id, text, level: level as 1 | 2 | 3 });
    }
  }

  return items;
}
