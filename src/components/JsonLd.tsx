/**
 * 구조화 데이터를 <script type="application/ld+json">으로 심는다.
 *
 * 여는 꺾쇠를 유니코드 이스케이프로 바꾸는 게 핵심이다. 글 제목이나 본문에
 * 스크립트 닫는 태그 문자열이 들어 있으면 거기서 script가 닫히면서 뒤따라오는
 * 글 내용이 실행 가능한 마크업이 된다. JSON 파서는 이스케이프를 다시 꺾쇠로
 * 되돌리므로 크롤러가 읽는 구조화 데이터의 의미는 그대로다.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
