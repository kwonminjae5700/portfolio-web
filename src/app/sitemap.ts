import { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/constants";

interface Article {
  id: number;
  title: string;
  updated_at?: string;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/articles`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kwon5700.kr";

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // 동적 게시글 페이지들
  const articles = await getArticles();
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/post/${article.id}`,
    lastModified: new Date(article.updated_at || article.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}
