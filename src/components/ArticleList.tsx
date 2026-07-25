import Image from "next/image";
import Link from "next/link";
import { estimateReadingTime, formatDate, truncateText } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Article, ArticleListResponse } from "@/types/api";
import ArticleListClient from "./ArticleListClient";

const CONTENT_PREVIEW_LENGTH = 200;

interface ArticleCardProps {
  article: Article;
}

// 서버 컴포넌트 - SEO를 위해 서버에서 렌더링
export const ArticleCard = ({ article }: ArticleCardProps) => {
  // 글 ID 기반 고정 썸네일 (1~16 여행 사진)
  const imageSrc = `/img/${(article.id % 16) + 1}.png`;

  return (
    <article className="article-card group relative flex gap-5 sm:gap-7 py-7 first:pt-0 border-b border-line">
      <div className="flex-1 min-w-0 flex flex-col">
        {article.categories && article.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
            {article.categories.map((cat) => (
              <Link
                key={cat.id}
                href={ROUTES.CATEGORY(cat.id)}
                className="relative z-10 text-[13px] font-medium text-accent hover:text-accent-deep transition-colors"
              >
                # {cat.name}
              </Link>
            ))}
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-semibold text-ink leading-snug group-hover:text-accent transition-colors">
          {/* 오버레이 링크 — 카드 전체(썸네일 포함)를 클릭 영역으로.
              썸네일 래퍼(position:relative)보다 위에 오도록 z-[1], 칩 링크는 z-10으로 그 위에 */}
          <Link
            href={ROUTES.POST(article.id)}
            className="before:absolute before:inset-0 before:z-[1] focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm sm:text-[15px] leading-relaxed text-muted">
          {truncateText(article.content, CONTENT_PREVIEW_LENGTH)}
        </p>
        <div className="mt-3 flex items-center gap-2 text-[13px] text-faint">
          <time dateTime={article.created_at}>
            {formatDate(article.created_at)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{estimateReadingTime(article.content)}분 분량</span>
        </div>
      </div>
      <div className="relative w-[100px] sm:w-[150px] md:w-[180px] aspect-[4/3] self-center shrink-0 overflow-hidden rounded-xl bg-wash">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100px, (max-width: 768px) 150px, 180px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
    </article>
  );
};

interface ArticleListProps {
  initialData: ArticleListResponse;
}

// 서버 컴포넌트 - 초기 데이터를 서버에서 렌더링
const ArticleList = ({ initialData }: ArticleListProps) => {
  const { articles, has_more } = initialData;

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted">아직 작성된 글이 없습니다.</p>
      </div>
    );
  }

  const lastId = articles[articles.length - 1]?.id ?? null;

  return (
    <div className="flex flex-col">
      {/* 초기 데이터는 서버에서 렌더링 (SEO) */}
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {/* 무한 스크롤은 클라이언트에서 처리 */}
      <ArticleListClient
        initialLastId={lastId}
        initialHasMore={has_more}
        initialArticleIds={articles.map((a) => a.id)}
      />
    </div>
  );
};

export default ArticleList;
