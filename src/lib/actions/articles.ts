"use server";

import { revalidatePath, updateTag } from "next/cache";
import { ARTICLES_TAG, CATEGORIES_TAG, articleTag } from "@/lib/cacheTags";

/**
 * 글 생성·수정·삭제 직후 캐시를 즉시 만료시킨다.
 *
 * 이 액션은 글을 바꾸지 않는다. mutation은 localStorage의 JWT가 필요해
 * 클라이언트(`src/lib/api.ts`)에 남아야 하므로, 여기서는 캐시 무효화만 한다.
 *
 * `revalidateTag(tag, "max")`가 아니라 `updateTag`를 쓰는 이유:
 * revalidateTag는 stale-while-revalidate라 액션 응답에 새 RSC 페이로드가 실리지
 * 않아 클라이언트 세그먼트 캐시가 그대로 남는다. updateTag는 read-your-own-writes
 * 용이라 서버 태그를 즉시 만료시키고 클라이언트 캐시도 함께 무효화한다.
 * (그래서 별도의 router.refresh()가 필요 없다)
 *
 * 주의: Server Action은 공개 POST 엔드포인트다. 지금은 캐시 만료만 하므로
 * 인증되지 않은 호출이 할 수 있는 최악은 캐시 미스를 유발하는 것뿐이다.
 * 이 파일에 권한이 필요한 로직을 추가하려면 반드시 인증 검사를 함께 넣을 것.
 */
export async function revalidateArticleCache(articleId?: number): Promise<void> {
  updateTag(ARTICLES_TAG);
  // 글의 카테고리 소속이 바뀌면 카테고리 페이지도 영향을 받는다.
  updateTag(CATEGORIES_TAG);

  if (
    typeof articleId === "number" &&
    Number.isInteger(articleId) &&
    articleId > 0
  ) {
    updateTag(articleTag(articleId));
  }

  // /sitemap.xml만 유일하게 프리렌더된 라우트라 경로 무효화도 함께 건다.
  revalidatePath("/sitemap.xml");
}
