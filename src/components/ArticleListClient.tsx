"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { PAGINATION, INTERSECTION_OBSERVER_OPTIONS } from "@/lib/constants";
import { LoadingSpinner } from "@/components/ui";
import { ArticleCard } from "./ArticleList";
import type { Article } from "@/types/api";

interface ArticleListClientProps {
  initialLastId: number | null;
  initialHasMore: boolean;
}

/**
 * 무한 스크롤을 처리하는 클라이언트 컴포넌트
 * 초기 데이터는 서버에서 렌더링되고, 추가 데이터만 클라이언트에서 로드
 */
const ArticleListClient = ({
  initialLastId,
  initialHasMore,
}: ArticleListClientProps) => {
  const [additionalArticles, setAdditionalArticles] = useState<Article[]>([]);
  const [lastId, setLastId] = useState<number | null>(initialLastId);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!lastId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const data = await api.getArticles(lastId, PAGINATION.DEFAULT_LIMIT);
      setAdditionalArticles((prev) => [...prev, ...(data.articles || [])]);
      setHasMore(data.has_more || false);
      setLastId(data.last_id);
    } catch (err) {
      console.error("추가 글 로드 실패:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastId, isLoadingMore, hasMore]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    }, INTERSECTION_OBSERVER_OPTIONS);

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <>
      {/* 추가로 로드된 게시글들 */}
      {additionalArticles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {/* 무한 스크롤 트리거 */}
      <div ref={loadMoreRef} className="py-4">
        {isLoadingMore && (
          <LoadingSpinner size="md" text="글을 불러오는 중..." />
        )}
      </div>
    </>
  );
};

export default ArticleListClient;
