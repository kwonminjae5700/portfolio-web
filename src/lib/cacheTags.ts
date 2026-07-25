/**
 * Next.js Data Cache 태그 정의.
 *
 * fetch 쪽(`next.tags`)과 무효화 쪽(`updateTag`)이 같은 문자열을 써야 하므로
 * 반드시 이 파일의 상수·헬퍼만 사용한다. 문자열을 직접 적으면 오타가 나도
 * 조용히 무효화가 안 될 뿐이라 알아채기 어렵다.
 *
 * `"use server"` 파일은 async 함수만 export할 수 있어 상수를 함께 둘 수 없다.
 * 그래서 액션(`lib/actions/articles.ts`)과 별도 모듈로 분리한다.
 */

/** 글 목록이 담긴 모든 응답 (홈, 카테고리, 인접 글 탐색, 사이트맵) */
export const ARTICLES_TAG = "articles";

/** 카테고리 목록·단건 */
export const CATEGORIES_TAG = "categories";

/** 글 상세 단건 */
export const articleTag = (id: number | string) => `article-${id}`;
