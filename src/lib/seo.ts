/**
 * 검색엔진에 내보내는 구조화 데이터(JSON-LD)와 메타 설명 생성.
 *
 * 여기 있는 건 전부 화면에 아무것도 그리지 않는다 — <head>와
 * <script type="application/ld+json"> 안에서만 쓰인다.
 * 크롤러가 "이 페이지가 무엇에 관한 것인지" 판단하는 근거를 모아둔 곳.
 */

import { ROUTES, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";
import { estimateReadingTime, stripMarkdown, truncateText } from "./utils";
import type { Article, Category } from "@/types/api";

/** Google이 Article 리치 결과에서 headline을 자르는 지점 */
const HEADLINE_MAX = 110;

/** 검색 결과 스니펫이 잘리는 대략적인 지점 */
const DESCRIPTION_MAX = 155;

/** 사이트 루트 기준 절대 URL. canonical과 JSON-LD는 상대 경로를 쓰면 안 된다. */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * 본문 마크다운에서 검색 결과 스니펫용 설명을 뽑는다.
 *
 * 예전엔 특수문자만 지우는 정규식이라 링크 URL과 코드 블록 내용이 그대로
 * 섞여 나왔다. 목록 카드 발췌와 같은 stripMarkdown을 써서 결과를 일치시킨다.
 * 코드만 있는 글이면 빈 문자열이 나오므로 사이트 설명으로 대체한다.
 */
export function articleDescription(content: string): string {
  const text = truncateText(content, DESCRIPTION_MAX);
  return text.length > 0 ? text : SITE_DESCRIPTION;
}

/**
 * 본문에 있는 첫 이미지. Article 리치 결과는 image를 권장한다.
 * 절대 URL만 인정한다 — 상대 경로는 백엔드 기준인지 사이트 기준인지 알 수 없어
 * 잘못된 주소를 구조화 데이터에 넣느니 대표 이미지로 넘기는 게 낫다.
 */
export function firstImageUrl(content: string): string | null {
  return content.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/)?.[1] ?? null;
}

/** 한국어는 어절 수를 단어 수로 본다 */
function countWords(content: string): number {
  const text = stripMarkdown(content);
  return text.length === 0 ? 0 : text.split(/\s+/).length;
}

export interface Crumb {
  name: string;
  path: string;
}

/**
 * 검색 결과에서 생 URL 대신 보이는 경로 표시.
 * 글 주소가 /post/3처럼 숫자라 주소만 봐서는 주제를 알 수 없으니,
 * "홈 > 카테고리 > 제목"을 따로 알려준다.
 */
export function breadcrumbJsonLd(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * 글 상세의 BlogPosting.
 * 예전엔 제목·날짜·작성자만 있었다. 이 블로그는 개발 기록과 공부 노트라
 * "무슨 주제인가"가 검색에서 제일 중요한데 그 신호가 통째로 빠져 있었다.
 * 카테고리를 articleSection/keywords로 넘겨서 그 자리를 채운다.
 */
export function blogPostingJsonLd(article: Article) {
  const url = absoluteUrl(ROUTES.POST(article.id));
  const categories = article.categories?.map((c) => c.name) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title.slice(0, HEADLINE_MAX),
    description: articleDescription(article.content),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      "@type": "Person",
      name: article.author_name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/og-image.jpg") },
    },
    image: [firstImageUrl(article.content) ?? absoluteUrl("/og-image.jpg")],
    inLanguage: "ko-KR",
    isAccessibleForFree: true,
    timeRequired: `PT${estimateReadingTime(article.content)}M`,
    wordCount: countWords(article.content),
    ...(categories.length > 0 && {
      articleSection: categories,
      keywords: categories.join(", "),
    }),
  };
}

/** 사이트 전체를 설명하는 노드. 홈에만 붙인다. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko-KR",
    author: { "@type": "Person", name: "권민재", url: SITE_URL },
  };
}

/** 홈의 글 목록. 크롤러에게 최신 글 묶음을 한 번에 알려준다. */
export function blogJsonLd(articles: Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: "ko-KR",
    author: { "@type": "Person", name: "권민재" },
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title.slice(0, HEADLINE_MAX),
      url: absoluteUrl(ROUTES.POST(article.id)),
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: { "@type": "Person", name: article.author_name },
    })),
  };
}

/** 카테고리 페이지 — 글 묶음이라는 걸 명시해 홈·글 상세와 구분되게 한다. */
export function categoryJsonLd(category: Category, articles: Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} 카테고리`,
    url: absoluteUrl(ROUTES.CATEGORY(category.id)),
    inLanguage: "ko-KR",
    isPartOf: { "@type": "Blog", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: absoluteUrl(ROUTES.POST(article.id)),
      })),
    },
  };
}
