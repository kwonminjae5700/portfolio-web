"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { PAGINATION } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Modal, LoadingSpinner } from "@/components/ui";
import { btnOutline } from "@/components/ui/buttonStyles";
import type { Article } from "@/types/api";

interface PostReferencePickerProps {
  open: boolean;
  onClose: () => void;
  /** 글을 고르면 호출 — 삽입과 닫기는 부모(PostEditor)가 처리한다 */
  onSelect: (article: Article) => void;
  /** 수정 모드에서 자기 자신을 목록에서 제외 */
  excludeId?: number;
}

/**
 * 이전에 작성한 글을 골라 본문에 링크로 끼워 넣는 피커.
 *
 * 서버에 검색 API가 없어서(articles는 커서 페이지네이션뿐) 페이지를
 * 클라이언트에 쌓아 두고 제목으로 필터링한다. 컴포넌트는 항상 마운트해 두고
 * Modal이 열림/닫힘만 바꾸므로, 편집 세션 동안 받아 둔 목록이 캐시로 남는다.
 */
export default function PostReferencePicker({
  open,
  onClose,
  onSelect,
  excludeId,
}: PostReferencePickerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const isLoadingRef = useRef(false); // 중복 호출 방지 (ArticleListClient와 동일)
  const hasFetchedRef = useRef(false); // 첫 열림에만 최초 로드
  const listRef = useRef<HTMLDivElement>(null); // 피커 자체 스크롤 컨테이너
  const loadMoreRef = useRef<HTMLDivElement>(null); // 무한 스크롤 센티널

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    setIsLoadingMore(true);
    isLoadingRef.current = true;
    setError("");

    try {
      const data = await api.getArticles(
        lastId ?? undefined,
        PAGINATION.DEFAULT_LIMIT,
      );

      if (data.articles && data.articles.length > 0) {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const fresh = data.articles.filter(
            (a) => !existingIds.has(a.id) && a.id !== excludeId,
          );
          return [...prev, ...fresh];
        });
        // 커서는 excludeId 필터 전의 원본 응답 기준이어야 페이지가 안 밀린다
        setLastId(data.articles[data.articles.length - 1].id);
      }
      setHasMore(data.has_more ?? false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "글 목록을 불러올 수 없습니다.",
      );
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [lastId, hasMore, excludeId]);

  useEffect(() => {
    if (!open || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void loadMore();
  }, [open, loadMore]);

  // 모달 내부 스크롤 컨테이너를 root로 써야 센티널 교차가 감지된다
  // (기본 뷰포트 root는 내부 스크롤과 교차하지 않는다).
  // ref들이 열려 있을 때만 존재하므로 open을 의존성에 넣는다.
  useEffect(() => {
    if (!open || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingRef.current) {
          void loadMore();
        }
      },
      { root: listRef.current, threshold: 0, rootMargin: "100px" },
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasMore, loadMore]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? articles.filter((a) => a.title.toLowerCase().includes(q))
    : articles;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="이전 글 참조"
      panelClassName="max-w-md"
    >
      <div className="p-3 border-b border-line">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter로 첫 결과를 바로 선택 — 폼 제출은 포털이라 원래 안 되지만 확실하게 막는다
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (filtered.length > 0) onSelect(filtered[0]);
            }
          }}
          placeholder="제목으로 검색..."
          autoFocus
          className="w-full px-3 py-2 text-sm border border-line rounded-md text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition"
        />
      </div>

      <div ref={listRef} className="overflow-y-auto max-h-[50dvh]">
        {isLoadingMore && articles.length === 0 ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner size="md" text="글을 불러오는 중..." />
          </div>
        ) : error && articles.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <p className="text-sm text-danger">{error}</p>
            <button
              type="button"
              onClick={() => void loadMore()}
              className={btnOutline}
            >
              다시 시도
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-sm text-faint text-center">
            {q ? "검색 결과가 없습니다." : "아직 작성한 글이 없습니다."}
          </p>
        ) : (
          <>
            {filtered.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onSelect(article)}
                className="w-full text-left px-4 py-3 hover:bg-wash transition-colors border-b border-line last:border-b-0 focus-visible:outline-none focus-visible:bg-wash"
              >
                <span className="block text-sm font-medium text-ink truncate">
                  {article.title}
                </span>
                <span className="mt-1 flex items-center gap-2 text-xs text-faint">
                  {formatDate(article.created_at)}
                  {article.categories?.map((c) => (
                    <span
                      key={c.id}
                      className="px-1.5 py-0.5 rounded-full bg-wash text-muted"
                    >
                      {c.name}
                    </span>
                  ))}
                </span>
              </button>
            ))}
            {/* 목록을 다 그린 뒤에도 에러가 나면 목록을 지우지 않고 아래에 재시도만 둔다 */}
            {error && (
              <div className="py-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  className="text-xs text-danger hover:underline"
                >
                  더 불러오지 못했습니다 — 다시 시도
                </button>
              </div>
            )}
            {isLoadingMore ? (
              <div className="py-4 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : hasMore ? (
              <div ref={loadMoreRef} className="h-px" />
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}
