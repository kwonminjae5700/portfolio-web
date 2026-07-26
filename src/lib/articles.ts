import { cache } from "react";
import { API_BASE_URL } from "./constants";
import { ARTICLES_TAG, articleTag } from "./cacheTags";
import type { Article, ArticleListResponse } from "@/types/api";

/**
 * 이 파일 전체가 지키는 규칙 — "없음"과 "못 가져옴"을 절대 섞지 않는다.
 *
 * 크롤러에게 404는 "지웠으니 색인에서 빼라", 5xx는 "지금 문제가 있으니
 * 나중에 다시 와라"다. 결과가 정반대다. 예전엔 두 경우를 모두 null로 삼켜서,
 * 백엔드가 잠깐 흔들리는 사이 Googlebot이 들어오면 멀쩡히 존재하는 글이
 * 404 + noindex로 응답하고 검색 색인에서 사라졌다.
 *
 *   4xx        → 콘텐츠 문제. 정말 없는 글 → null → 호출부에서 notFound()
 *   5xx        → 인프라 문제 → throw → 페이지가 5xx 응답 → Google이 재시도
 *   네트워크 오류 → fetch가 던지는 예외를 잡지 않고 그대로 흘려보낸다
 *
 * 그래서 이 파일에는 의도적으로 try/catch가 거의 없다. 예외를 삼키는 곳은
 * getAdjacentArticles 하나뿐이고, 거기엔 이유를 따로 적어뒀다.
 */

/**
 * 글 상세 1건. 없으면 null, 못 가져오면 throw.
 *
 * generateMetadata와 페이지 본문이 같은 렌더에서 두 번 호출하므로,
 * React cache()로 요청 단위 메모이제이션을 보장한다. 호출부마다 fetch를
 * 따로 쓰면 옵션이 조금만 달라져도 dedupe가 조용히 깨진다.
 * (실패한 프로미스도 함께 메모이즈되므로 메타와 본문이 같은 결과를 본다)
 */
export const getArticle = cache(async (id: string): Promise<Article | null> => {
  const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
    // 조회수가 서버 렌더에 포함되므로 시간 기반 재검증도 함께 유지한다.
    next: { revalidate: 60, tags: [articleTag(id)] },
  });
  if (res.ok) return res.json();
  if (res.status < 500) return null;
  throw new Error(`글 조회 실패: ${res.status} ${res.statusText}`);
});

/**
 * 글 목록 한 페이지. 홈이 첫 화면에 서버 렌더하는 묶음이다.
 * 목록 엔드포인트에서 4xx가 나오는 건 "글이 없다"가 아니라 호출이 틀린 것이므로
 * 상태 코드와 무관하게 전부 실패로 본다.
 */
export async function getArticlePage(
  limit: number,
): Promise<ArticleListResponse> {
  const res = await fetch(`${API_BASE_URL}/articles?limit=${limit}`, {
    next: { revalidate: 60, tags: [ARTICLES_TAG] }, // 60초마다 + 글 변경 시 재검증
  });
  if (!res.ok) {
    throw new Error(`글 목록 조회 실패: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 최신 글 목록 (최대 100편)
 * 이전/다음 글 탐색, 카테고리 페이지, sitemap이 공유한다.
 * 백엔드가 limit을 최대 50으로 클램프하므로(초과 시 20으로 축소),
 * 50편씩 커서를 따라가며 최대 두 페이지를 모은다.
 *
 * cache()로 묶는 이유: 카테고리 라우트에서 layout이 먼저 호출해 실패를
 * 걸러내고 page가 같은 목록을 다시 쓴다. 안쪽 fetch는 Next가 dedupe하지만
 * 커서를 따라가는 루프와 배열 병합까지 두 번 도는 건 낭비다.
 */
export const getRecentArticles = cache(async (): Promise<ArticleListResponse> => {
  const all: Article[] = [];
  let cursor: number | null = null;
  let hasMore = false;

  for (let page = 0; page < 2; page++) {
    const cursorParam = cursor !== null ? `&last_id=${cursor}` : "";
    const res = await fetch(`${API_BASE_URL}/articles?limit=50${cursorParam}`, {
      next: { revalidate: 60, tags: [ARTICLES_TAG] },
    });
    if (!res.ok) {
      throw new Error(`글 목록 조회 실패: ${res.status} ${res.statusText}`);
    }
    const data: ArticleListResponse = await res.json();
    const articles = data.articles ?? [];
    all.push(...articles);
    hasMore = data.has_more ?? false;
    if (!hasMore || articles.length === 0) break;
    cursor = articles[articles.length - 1].id;
  }

  return {
    articles: all,
    has_more: hasMore,
    next_cursor: all.length > 0 ? all[all.length - 1].id : null,
  };
});

/**
 * 이전 글(더 오래된 글)과 다음 글(더 새 글)을 찾는다.
 * 목록은 최신순이므로 이전 글 = idx + 1, 다음 글 = idx - 1.
 * 최신 100편 밖의 글이면 둘 다 null (그레이스풀 생략).
 */
export async function getAdjacentArticles(
  id: number,
): Promise<{ prev: Article | null; next: Article | null }> {
  try {
    const { articles } = await getRecentArticles();
    const idx = articles.findIndex((a) => a.id === id);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: articles[idx + 1] ?? null,
      next: articles[idx - 1] ?? null,
    };
  } catch {
    // 이 파일에서 유일하게 예외를 삼키는 곳.
    // 이전/다음 링크는 보조 정보라서, 목록 조회가 실패했다고 이미 멀쩡히
    // 받아온 본문까지 5xx로 날려버리면 손해가 더 크다.
    return { prev: null, next: null };
  }
}
