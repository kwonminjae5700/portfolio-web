import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_BASE_URL, ROUTES } from "@/lib/constants";
import PostContent from "@/components/post/PostContent";
import PostActions from "@/components/post/PostActions";
import PostComments from "@/components/post/PostComments";
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kwon5700.kr";

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
    .trim();

  const categories = article.categories?.map((c) => c.name) || [];

  return {
    title: article.title,
    description,
    keywords: [...categories, "블로그", "개발"],
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
          url: "/bridge.png",
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
      images: ["/bridge.png"],
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

  // JSON-LD 구조화 데이터
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
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://kwon5700.kr"
        }/bridge.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://kwon5700.kr"
      }/post/${article.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen px-4 py-12 bg-gray-50 pt-30">
        <article className="max-w-4xl mx-auto">
          <PostContent content={article.content} />

          <footer className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link
                href={ROUTES.HOME}
                className="text-mainBlue hover:underline font-medium"
              >
                ← 목록으로 돌아가기
              </Link>
              <PostActions
                articleId={article.id}
                authorId={article.author_id}
              />
            </div>
          </footer>

          <PostComments articleId={article.id} />
        </article>
      </main>
    </>
  );
}
