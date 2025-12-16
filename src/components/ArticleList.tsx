"use client";

import Image from "next/image";
import Link from "next/link";
import { useArticles, useInfiniteScroll } from "@/hooks";
import { LoadingSpinner, EmptyState } from "@/components/ui";
import { formatDate, truncateText } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Article } from "@/types/api";

const CONTENT_PREVIEW_LENGTH = 200;

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => (
  <Link href={ROUTES.POST(article.id)}>
    <div className="w-full flex gap-8 pb-8 border-b border-gray-300 hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2">
      <div className="flex-col gap-3 h-fit flex-1">
        <h2 className="text-2xl font-normal mb-2 text-title hover:text-black">
          {article.title}
        </h2>
        <p className="line-clamp-2 text-content hover:text-black">
          {truncateText(article.content, CONTENT_PREVIEW_LENGTH)}
        </p>
        <div className="flex items-center gap-4 mt-3">
          {article.categories && article.categories.length > 0 && (
            <div className="space-x-2 text-mainBlue">
              {article.categories.map((cat) => (
                <span key={cat.id}># {cat.name}</span>
              ))}
            </div>
          )}
          <span className="text-sm text-gray-400">
            {article.author_name} • {formatDate(article.created_at)}
          </span>
        </div>
      </div>
      <div className="w-[180px] h-[110px] bg-gray-200 rounded-lg shrink-0 overflow-hidden">
        <Image
          src="/ex.png"
          alt={article.title}
          width={180}
          height={110}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  </Link>
);

const ArticleList = () => {
  const { articles, isLoading, isLoadingMore, hasMore, loadMore } =
    useArticles();
  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  if (isLoading) {
    return (
      <LoadingSpinner size="md" text="글을 불러오는 중..." className="py-8" />
    );
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        title="아직 작성된 글이 없습니다."
        actionLabel="첫 글을 작성해보세요!"
        actionHref={ROUTES.WRITE}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      <div ref={loadMoreRef} className="py-4">
        {isLoadingMore && (
          <LoadingSpinner size="md" text="글을 불러오는 중..." />
        )}
      </div>
    </div>
  );
};

export default ArticleList;
