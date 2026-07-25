import Image from "next/image";
import { Suspense } from "react";
import { Metadata } from "next";
import ArticleList from "@/components/ArticleList";
import TopContent from "@/components/TopContent";
import { ARTICLES_TAG } from "@/lib/cacheTags";
import { API_BASE_URL, CONTAINER, PAGINATION, SITE_DESCRIPTION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ArticleListResponse } from "@/types/api";

// 홈페이지 메타데이터
export const metadata: Metadata = {
  title: "Kwon5700's Blog - 개발 블로그",
  description:
    SITE_DESCRIPTION,
  openGraph: {
    title: "Kwon5700's Blog - 개발 블로그",
    description:
      SITE_DESCRIPTION,
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kwon5700's Blog",
      },
    ],
  },
};

// 로딩 스켈레톤 컴포넌트
const TopContentSkeleton = ({ mode }: { mode: "posts" | "categories" }) => (
  <div className="w-full md:w-56 lg:w-64 pb-8 lg:pb-10 border-b border-line animate-pulse">
    <div className="h-5 bg-wash rounded w-24 mb-5"></div>
    {mode === "posts" ? (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start py-2">
            <div className="w-4 h-4 bg-wash rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-wash rounded w-full mb-2"></div>
              <div className="h-3 bg-wash rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex gap-2 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-wash rounded-full w-20"></div>
        ))}
      </div>
    )}
  </div>
);

// 서버에서 초기 게시글 데이터 가져오기
async function getInitialArticles(): Promise<ArticleListResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/articles?limit=${PAGINATION.DEFAULT_LIMIT}`,
      { next: { revalidate: 60, tags: [ARTICLES_TAG] } }, // 60초마다 + 글 변경 시 재검증
    );
    if (!res.ok) {
      return { articles: [], has_more: false, next_cursor: null };
    }
    return res.json();
  } catch {
    return { articles: [], has_more: false, next_cursor: null };
  }
}

export default async function HomePage() {
  const initialData = await getInitialArticles();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";

  // JSON-LD 구조화 데이터 (WebSite)
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kwon5700's Blog",
    url: siteUrl,
    description:
      SITE_DESCRIPTION,
    author: {
      "@type": "Person",
      name: "권민재",
      url: siteUrl,
    },
    inLanguage: "ko-KR",
  };

  // JSON-LD 구조화 데이터 (Blog)
  const jsonLdBlog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Kwon5700's Blog",
    description:
      SITE_DESCRIPTION,
    url: siteUrl,
    author: {
      "@type": "Person",
      name: "권민재",
    },
    blogPost: initialData.articles.slice(0, 5).map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `${siteUrl}/post/${article.id}`,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        "@type": "Person",
        name: article.author_name,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }}
      />
      <main>
        {/* 히어로 — 직접 찍은 여행 사진이 이 블로그의 시그니처 */}
        <div className="relative h-[200px] sm:h-[280px] md:h-[340px] lg:h-[380px] bg-wash">
          <Image
            src="/bridge.jpg"
            alt="샌프란시스코 금문교 풍경"
            fill
            sizes="100vw"
            className="object-cover object-[50%_68%]"
            priority
          />
          <div className={cn(CONTAINER, "relative h-full")}>
            <span className="absolute bottom-4 left-5 sm:left-8 lg:left-10 rounded-full bg-black/40 px-3 py-1 text-[11px] tracking-wide text-white/90 backdrop-blur-sm">
              Golden Gate Bridge · San Francisco
            </span>
          </div>
        </div>

        {/* 마스트헤드 */}
        <section className={cn(CONTAINER, "pt-9 md:pt-12")}>
          <h1 className="text-2xl md:text-[28px] font-bold text-ink">
            권민재의 개발 기록
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            개발하며 배운 것들을 기록합니다.
          </p>
        </section>

        <section
          className={cn(
            CONTAINER,
            "py-9 md:py-12 flex flex-col md:flex-row md:justify-between gap-10 md:gap-8 lg:gap-16",
          )}
        >
          <article className="flex-1 min-w-0">
            <ArticleList initialData={initialData} />
          </article>
          <aside className="w-full md:w-56 lg:w-64 flex flex-col gap-8 md:sticky md:top-24 md:self-start shrink-0">
            <Suspense fallback={<TopContentSkeleton mode="posts" />}>
              <TopContent mode="posts" />
            </Suspense>
            <Suspense fallback={<TopContentSkeleton mode="categories" />}>
              <TopContent mode="categories" />
            </Suspense>
          </aside>
        </section>
      </main>
    </>
  );
}
