"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PAGINATION, ROUTES } from "@/lib/constants";
import type { Article, Category } from "@/types/api";

type ContentMode = "posts" | "categories";

interface TopContentApiProps {
  mode: ContentMode;
}

interface TopPostItemProps {
  article: Article;
  index: number;
}

interface CategoryItemProps {
  category: Category;
}

const TopPostItem = ({ article, index }: TopPostItemProps) => (
  <Link href={ROUTES.POST(article.id)}>
    <div className="flex gap-3 items-start py-2 hover:bg-gray-50 transition rounded">
      <span className="text-mainBlue font-bold">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate hover:text-black">
          {article.title}
        </p>
        <p className="text-xs text-gray-400">조회수 {article.view_count}</p>
      </div>
    </div>
  </Link>
);

const CategoryItem = ({ category }: CategoryItemProps) => (
  <div className="w-fit bg-gray-100 rounded-3xl px-5 py-1 text-gray-500 cursor-pointer hover:text-black transition">
    {category.name}
  </div>
);

const LoadingState = ({ mode }: { mode: ContentMode }) => (
  <div className="w-64 pb-10 border-b border-gray-300">
    <h3 className="font-bold text-xl mb-4">
      TOP {mode === "posts" ? "5" : "CATEGORIES"}
    </h3>
    <div className="text-sm text-gray-400">로딩 중...</div>
  </div>
);

const TopContentApi = ({ mode }: TopContentApiProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      if (mode === "posts") {
        const data = await api.getArticles(
          undefined,
          PAGINATION.TOP_POSTS_LIMIT
        );
        const sorted = (data.articles || [])
          .sort((a, b) => b.view_count - a.view_count)
          .slice(0, PAGINATION.TOP_POSTS_LIMIT);
        setArticles(sorted);
      } else {
        const data = await api.getCategories();
        setCategories(data);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <LoadingState mode={mode} />;
  }

  const title = `TOP ${mode === "posts" ? "5" : "CATEGORIES"}`;
  const isEmpty =
    mode === "posts" ? articles.length === 0 : categories.length === 0;
  const emptyMessage =
    mode === "posts" ? "글이 없습니다." : "카테고리가 없습니다.";

  return (
    <div className="w-64 pb-10 border-b border-gray-300">
      <h3 className="font-bold text-xl mb-4">{title}</h3>

      {isEmpty ? (
        <div className="text-sm text-gray-400">{emptyMessage}</div>
      ) : mode === "posts" ? (
        <div className="flex-col gap-3">
          {articles.map((article, index) => (
            <TopPostItem key={article.id} article={article} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap">
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopContentApi;
