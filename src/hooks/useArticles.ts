"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Article, ArticleListResponse } from "@/types/api";
import { PAGINATION } from "@/lib/constants";

interface UseArticlesOptions {
  initialLimit?: number;
}

interface UseArticlesReturn {
  articles: Article[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * 아티클 목록을 관리하는 커스텀 훅
 */
export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { initialLimit = PAGINATION.DEFAULT_LIMIT } = options;

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateFromResponse = useCallback((data: ArticleListResponse, append = false) => {
    setArticles((prev) => (append ? [...prev, ...(data.articles || [])] : data.articles || []));
    setHasMore(data.has_more || false);
    setLastId(data.last_id);
  }, []);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getArticles(undefined, initialLimit);
      updateFromResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "글 목록을 불러오는데 실패했습니다.");
      console.error("글 목록 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, updateFromResponse]);

  const loadMore = useCallback(async () => {
    if (!lastId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const data = await api.getArticles(lastId, initialLimit);
      updateFromResponse(data, true);
    } catch (err) {
      console.error("추가 글 로드 실패:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastId, isLoadingMore, hasMore, initialLimit, updateFromResponse]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh: fetchArticles,
  };
}
