"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { PAGINATION } from "@/lib/constants";
import { LoadingSpinner } from "@/components/ui";
import { ArticleCard } from "./ArticleList";
import type { Article } from "@/types/api";

interface ArticleListClientProps {
  initialLastId: number | null;
  initialHasMore: boolean;
  initialArticleIds: number[];
}

/**
 * 무한 스크롤을 처리하는 클라이언트 컴포넌트
 * 초기 데이터는 서버에서 렌더링되고, 추가 데이터만 클라이언트에서 로드
 */
const ArticleListClient = ({
  initialLastId,
  initialHasMore,
  initialArticleIds,
}: ArticleListClientProps) => {
  const [additionalArticles, setAdditionalArticles] = useState<Article[]>([]);
  const [lastId, setLastId] = useState<number | null>(initialLastId);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  // 초기 글 ID 목록을 Set으로 변환 (중복 체크용)
  const initialIdsRef = useRef(new Set(initialArticleIds));

  // 디버깅용 로그
  useEffect(() => {
    console.log("ArticleListClient 초기화:", {
      initialLastId,
      initialHasMore,
      hasMore,
    });
  }, [initialLastId, initialHasMore, hasMore]);

  const loadMore = useCallback(async () => {
    // ref로 중복 호출 방지
    if (isLoadingRef.current || !hasMore) return;

    console.log("loadMore 호출됨, lastId:", lastId);

    setIsLoadingMore(true);
    isLoadingRef.current = true;

    try {
      const data = await api.getArticles(
        lastId ?? undefined,
        PAGINATION.DEFAULT_LIMIT
      );
      console.log("API 응답:", data);

      if (data.articles && data.articles.length > 0) {
        setAdditionalArticles((prev) => {
          // 기존 ID 목록 생성 (초기 데이터 + 추가 데이터)
          const existingIds = new Set([
            ...initialIdsRef.current,
            ...prev.map((a) => a.id),
          ]);
          // 중복 제거하여 새 글만 추가
          const newArticles = data.articles.filter(
            (a) => !existingIds.has(a.id)
          );
          return [...prev, ...newArticles];
        });

        // 응답의 last_id 대신, 받은 글 목록의 마지막 글 ID 사용
        const lastArticle = data.articles[data.articles.length - 1];
        setLastId(lastArticle.id);
        console.log("새로운 lastId 설정:", lastArticle.id);
      }
      setHasMore(data.has_more ?? false);
    } catch (err) {
      console.error("추가 글 로드 실패:", err);
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [lastId, hasMore]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingRef.current) {
          loadMore();
        }
      },
      {
        threshold: 0,
        rootMargin: "200px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  return (
    <>
      {/* 추가로 로드된 게시글들 */}
      {additionalArticles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {/* 무한 스크롤 트리거 - 항상 렌더링하되 hasMore에 따라 내용 변경 */}
      <div
        ref={loadMoreRef}
        className="py-8 min-h-[50px] flex items-center justify-center"
      >
        {isLoadingMore ? (
          <LoadingSpinner size="md" text="글을 불러오는 중..." />
        ) : hasMore ? (
          <div className="text-gray-400 text-sm">스크롤하여 더 보기</div>
        ) : additionalArticles.length > 0 ? (
          <div className="text-gray-400 text-sm">모든 글을 불러왔습니다.</div>
        ) : null}
      </div>
    </>
  );
};

export default ArticleListClient;
