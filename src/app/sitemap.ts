import { MetadataRoute } from "next";
import { getRecentArticles } from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { ROUTES } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";
import type { Article } from "@/types/api";

/**
 * /sitemap.xml
 *
 * 요청 시점에 만든다. 예전엔 이게 유일한 프리렌더 라우트였고, 백엔드가 안 뜬
 * 상태로 빌드하면 실패를 조용히 삼켜 홈 URL 하나만 든 sitemap을 구워버렸다.
 * 그건 Google에게 "이 사이트는 페이지가 하나뿐"이라고 말하는 것과 같고,
 * 한 번 구워지면 재검증 전까지 그대로 남는다.
 *
 * 빌드에서 떼어내면 두 가지가 같이 해결된다.
 *   - 빌드가 더 이상 백엔드 가동 여부에 묶이지 않는다
 *     (Dockerfile은 빌더 컨테이너 안에서 localhost:8080을 가리킨다 — 거긴 아무것도 없다)
 *   - 조회에 실패하면 잘못된 sitemap 대신 5xx가 나가고, Google은 나중에 다시 온다
 *
 * 안쪽 fetch는 여전히 60초 캐시를 타므로 요청마다 백엔드를 때리지 않는다.
 *
 * 글 목록은 getRecentArticles를 쓴다. 예전의 `?limit=100`은 백엔드가 50으로
 * 클램프(초과 시 20으로 축소)해서 실제로는 20편만 담겼고, 그 뒤 글은
 * sitemap에도 홈 SSR에도 없어 크롤러가 찾을 길이 없었다.
 */
export const dynamic = "force-dynamic";

/** 글의 마지막 갱신 시각. updated_at이 비면 작성 시각으로 떨어진다. */
function lastTouched(article: Article): Date {
  return new Date(article.updated_at || article.created_at);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ articles }, categories] = await Promise.all([
    getRecentArticles(),
    getCategories(),
  ]);

  // 목록은 최신순이라 첫 글이 사이트 전체의 마지막 갱신 시각이 된다.
  // new Date()를 쓰면 sitemap을 만들 때마다 "방금 바뀌었다"고 말하게 되고,
  // Google은 그런 lastmod를 곧 신뢰하지 않는다.
  const newest = articles[0];

  const homePage: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(ROUTES.HOME),
      ...(newest && { lastModified: lastTouched(newest) }),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(ROUTES.POST(article.id)),
    lastModified: lastTouched(article),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 카테고리의 갱신 시각 = 그 카테고리에 속한 가장 최근 글의 갱신 시각.
  // 글이 하나도 없으면 아는 게 없으니 lastmod를 아예 빼는 편이 정확하다.
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => {
    const newestInCategory = articles.find((article) =>
      article.categories?.some((c) => c.id === category.id),
    );
    return {
      url: absoluteUrl(ROUTES.CATEGORY(category.id)),
      ...(newestInCategory && { lastModified: lastTouched(newestInCategory) }),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    };
  });

  return [...homePage, ...articlePages, ...categoryPages];
}
