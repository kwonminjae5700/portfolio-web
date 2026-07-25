import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_BASE_URL, CONTAINER, ROUTES } from "@/lib/constants";
import { cn, estimateReadingTime, formatDate } from "@/lib/utils";
import { extractToc } from "@/lib/toc";
import { getAdjacentArticles } from "@/lib/articles";
import PostContent from "@/components/post/PostContent";
import PostActions from "@/components/post/PostActions";
import PostComments from "@/components/post/PostComments";
import PostNav from "@/components/post/PostNav";
import ShareButton from "@/components/post/ShareButton";
import TableOfContents from "@/components/post/TableOfContents";
import ViewCounter from "@/components/post/ViewCounter";
import type { Article } from "@/types/api";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

// 서버에서 게시글 데이터 가져오기
async function getArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      next: { revalidate: 60 }, // 60초마다 재검증
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// SEO를 위한 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";

  if (!article) {
    return {
      title: "글을 찾을 수 없습니다",
      description: "요청하신 글을 찾을 수 없습니다.",
    };
  }

  // 본문에서 description 추출
  const description = article.content
    .replace(/[#*`\[\]()>\-_~!]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 160);

  const categories = article.categories?.map((c) => c.name) || [];

  return {
    title: article.title,
    description,
    authors: [{ name: article.author_name }],
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: `${siteUrl}/post/${article.id}`,
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      authors: [article.author_name],
      tags: categories,
      siteName: "Kwon5700's Blog",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `${siteUrl}/post/${article.id}`,
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const [toc, { prev, next }] = await Promise.all([
    Promise.resolve(extractToc(article.content)),
    getAdjacentArticles(article.id),
  ]);

  const readingTime = estimateReadingTime(article.content);

  // JSON-LD 구조화 데이터
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      "@type": "Person",
      name: article.author_name,
    },
    publisher: {
      "@type": "Organization",
      name: "Kwon5700's Blog",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og-image.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/post/${article.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCounter articleId={article.id} />
      <main className="min-h-screen bg-white">
        <div className={cn(CONTAINER, "py-10 md:py-14")}>
          <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-14">
            <article className="max-w-[46rem] mx-auto min-w-0 w-full">
              <header className="mb-10">
                {article.categories && article.categories.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
                    {article.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={ROUTES.CATEGORY(category.id)}
                        className="text-[13px] font-medium text-accent hover:text-accent-deep transition-colors"
                      >
                        # {category.name}
                      </Link>
                    ))}
                  </div>
                )}
                <h1 className="text-[28px] sm:text-4xl font-bold text-ink leading-[1.3] tracking-tight">
                  {article.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted">
                  <span>{article.author_name}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.created_at}>
                    {formatDate(article.created_at)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{readingTime}분 분량</span>
                  <span aria-hidden="true">·</span>
                  <span>조회수 {article.view_count.toLocaleString()}</span>
                </div>
                <div className="mt-8 border-b border-line" />
              </header>

              <PostContent content={article.content} />

              <footer className="mt-12 pt-6 border-t border-line">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={ROUTES.HOME}
                    className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
                  >
                    ← 목록으로 돌아가기
                  </Link>
                  <div className="flex items-center gap-2">
                    <PostActions
                      articleId={article.id}
                      authorId={article.author_id}
                    />
                    <ShareButton />
                  </div>
                </div>

                <PostNav prev={prev} next={next} />
              </footer>

              <PostComments articleId={article.id} />
            </article>

            <aside className="hidden xl:block">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                <TableOfContents items={toc} />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
