import Image from "next/image";
import { Suspense } from "react";
import { Metadata } from "next";
import ArticleList from "@/components/ArticleList";
import TopContent from "@/components/TopContent";
import { getArticlePage } from "@/lib/articles";
import {
  CONTAINER,
  PAGINATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * 홈은 어차피 요청마다 서버 렌더된다(TopContent가 조회수를 no-store로 읽는다).
 * 그런데도 Next는 빌드 때 한 번 프리렌더를 시도하고, 거기서 예외가 나면 빌드가 죽는다.
 * 글 목록 조회 실패를 이제 그대로 던지므로, 명시하지 않으면 "백엔드가 떠 있어야만
 * 빌드되는" 상태가 된다. 실패는 빌드가 아니라 요청 시점에 5xx로 드러나야 한다.
 */
export const dynamic = "force-dynamic";

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
    url: SITE_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  // 루트 레이아웃에서 canonical을 걷어냈으므로 각 라우트가 자기 것을 명시한다
  alternates: { canonical: SITE_URL },
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

export default async function HomePage() {
  // 실패하면 던진다. 예전엔 빈 목록으로 삼켜서, 백엔드가 죽은 동안 크롤러가 오면
  // "글이 하나도 없는 사이트"를 200으로 응답했다 — Google이 이걸 반복해서 보면
  // 홈을 얄팍한 페이지로 판단한다. 5xx는 "나중에 다시 와라"라서 회복이 된다.
  const initialData = await getArticlePage(PAGINATION.DEFAULT_LIMIT);

  // JSON-LD 구조화 데이터 (WebSite)
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kwon5700's Blog",
    url: SITE_URL,
    description:
      SITE_DESCRIPTION,
    author: {
      "@type": "Person",
      name: "권민재",
      url: SITE_URL,
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
    url: SITE_URL,
    author: {
      "@type": "Person",
      name: "권민재",
    },
    blogPost: initialData.articles.slice(0, 5).map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `${SITE_URL}/post/${article.id}`,
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

        {/* 마스트헤드 (화면에는 숨기고 문서 구조상 제목만 유지) */}
        <h1 className="sr-only">권민재의 개발 기록</h1>

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
