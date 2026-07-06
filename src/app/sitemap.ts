import { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/constants";

interface Article {
  id: number;
  title: string;
  updated_at?: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles?limit=100`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    });
    if (!res.ok) {
      console.error("Failed to fetch articles for sitemap:", res.status);
      return [];
    }
    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";

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
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories(),
  ]);

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/post/${article.id}`,
    lastModified: new Date(article.updated_at || article.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...articlePages, ...categoryPages];
}
