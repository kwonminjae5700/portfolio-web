import Image from "next/image";
import { Suspense } from "react";
import { Metadata } from "next";
import ArticleList from "@/components/ArticleList";
import TopContent from "@/components/TopContent";
import { API_BASE_URL, PAGINATION } from "@/lib/constants";
import type { ArticleListResponse } from "@/types/api";

// 홈페이지 메타데이터
export const metadata: Metadata = {
  title: "Kwon5700's Blog - 개발 블로그",
  description:
    "권민재의 개발 블로그입니다. 웹 개발, Next.js, React, TypeScript 등 프로그래밍 관련 글을 공유합니다.",
  openGraph: {
    title: "Kwon5700's Blog - 개발 블로그",
    description:
      "권민재의 개발 블로그입니다. 웹 개발, Next.js, React, TypeScript 등 프로그래밍 관련 글을 공유합니다.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://kwon5700.kr",
    images: [
      {
        url: "/bridge.png",
        width: 1200,
        height: 630,
        alt: "Kwon5700's Blog",
      },
    ],
  },
};

// 로딩 스켈레톤 컴포넌트
const TopContentSkeleton = ({ mode }: { mode: "posts" | "categories" }) => (
  <div className="w-64 pb-10 border-b border-gray-300 animate-pulse">
    <div className="h-7 bg-gray-200 rounded w-32 mb-4"></div>
    {mode === "posts" ? (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start py-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex gap-3 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-3xl w-20"></div>
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
      { next: { revalidate: 60 } }, // 60초마다 재검증
    );
    if (!res.ok) {
      return { articles: [], has_more: false, last_id: null };
    }
    return res.json();
  } catch {
    return { articles: [], has_more: false, last_id: null };
  }
}

export default async function HomePage() {
  const initialData = await getInitialArticles();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kwon5700.kr";

  // JSON-LD 구조화 데이터 (WebSite)
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kwon5700's Blog",
    url: siteUrl,
    description:
      "권민재의 개발 블로그입니다. 웹 개발, Next.js, React, TypeScript 등 프로그래밍 관련 글을 공유합니다.",
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
      "권민재의 개발 블로그입니다. 웹 개발, Next.js, React, TypeScript 등 프로그래밍 관련 글을 공유합니다.",
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
        <Image
          src="/bridge.png"
          alt="Kwon5700 Profile Picture"
          width={1728}
          height={500}
          className="w-full h-[550px] object-cover"
          priority
        />
        <section className="px-78 py-14 flex justify-between gap-16">
          <article className="w-7xl flex-col gap-14">
            <ArticleList initialData={initialData} />
          </article>
          <aside className="flex-col gap-8 sticky top-24 self-start">
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
