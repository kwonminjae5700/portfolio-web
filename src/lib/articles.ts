import { cache } from "react";
import { API_BASE_URL } from "./constants";
import { ARTICLES_TAG, articleTag } from "./cacheTags";
import type { Article, ArticleListResponse } from "@/types/api";

/**
 * 글 상세 1건.
 * generateMetadata와 페이지 본문이 같은 렌더에서 두 번 호출하므로,
 * React cache()로 요청 단위 메모이제이션을 보장한다. 호출부마다 fetch를
 * 따로 쓰면 옵션이 조금만 달라져도 dedupe가 조용히 깨진다.
 */
export const getArticle = cache(async (id: string): Promise<Article | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      // 조회수가 서버 렌더에 포함되므로 시간 기반 재검증도 함께 유지한다.
      next: { revalidate: 60, tags: [articleTag(id)] },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

/**
 * 최신 글 목록 (최대 100편)
 * 홈 마스트헤드, 이전/다음 글 탐색, 카테고리 페이지가 공유한다.
 * 백엔드가 limit을 최대 50으로 클램프하므로(초과 시 20으로 축소),
 * 50편씩 커서를 따라가며 최대 두 페이지를 모은다.
 * 같은 렌더 트리 안에서는 Next.js가 fetch를 dedupe한다.
 */
export async function getRecentArticles(): Promise<ArticleListResponse> {
  const all: Article[] = [];
  let cursor: number | null = null;
  let hasMore = false;

  try {
    for (let page = 0; page < 2; page++) {
      const cursorParam = cursor !== null ? `&last_id=${cursor}` : "";
      const res = await fetch(
        `${API_BASE_URL}/articles?limit=50${cursorParam}`,
        { next: { revalidate: 60, tags: [ARTICLES_TAG] } },
      );
      if (!res.ok) break;
      const data: ArticleListResponse = await res.json();
      const articles = data.articles ?? [];
      all.push(...articles);
      hasMore = data.has_more ?? false;
      if (!hasMore || articles.length === 0) break;
      cursor = articles[articles.length - 1].id;
    }
  } catch {
    // 네트워크 오류 시 지금까지 모은 결과만 반환
  }

  return {
    articles: all,
    has_more: hasMore,
    next_cursor: all.length > 0 ? all[all.length - 1].id : null,
  };
}

/**
 * 이전 글(더 오래된 글)과 다음 글(더 새 글)을 찾는다.
 * 목록은 최신순이므로 이전 글 = idx + 1, 다음 글 = idx - 1.
 * 최신 100편 밖의 글이면 둘 다 null (그레이스풀 생략).
 */
export async function getAdjacentArticles(
  id: number,
): Promise<{ prev: Article | null; next: Article | null }> {
  const { articles } = await getRecentArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: articles[idx + 1] ?? null,
    next: articles[idx - 1] ?? null,
  };
}
