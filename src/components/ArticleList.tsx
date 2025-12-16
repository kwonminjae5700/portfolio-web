import Image from "next/image";
import Link from "next/link";
import { truncateText } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Article, ArticleListResponse } from "@/types/api";
import ArticleListClient from "./ArticleListClient";

const CONTENT_PREVIEW_LENGTH = 200;

interface ArticleCardProps {
  article: Article;
}

// 서버 컴포넌트 - SEO를 위해 서버에서 렌더링
export const ArticleCard = ({ article }: ArticleCardProps) => {
  // 서버에서 무작위 이미지 선택 (1~16)
  const randomImageNumber = Math.floor(Math.random() * 16) + 1;
  const imageSrc = `/img/${randomImageNumber}.png`;

  return (
    <Link href={ROUTES.POST(article.id)}>
      <div className="w-full flex gap-4 pb-8 border-b border-gray-300 -m-2">
        <div className="flex-col gap-1 h-fit flex-1">
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
          </div>
        </div>
        <div className="w-[180px] h-auto bg-gray-200 shrink-0">
          <Image
            src={imageSrc}
            alt={article.title}
            width={180}
            height={120}
            className="object-cover w-[180px] h-[120px]"
          />
        </div>
      </div>
    </Link>
  );
};

interface ArticleListProps {
  initialData: ArticleListResponse;
}

// 서버 컴포넌트 - 초기 데이터를 서버에서 렌더링
const ArticleList = ({ initialData }: ArticleListProps) => {
  const { articles, has_more, last_id } = initialData;

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">아직 작성된 글이 없습니다.</p>
        <Link
          href={ROUTES.WRITE}
          className="inline-block mt-4 text-mainBlue hover:underline"
        >
          첫 글을 작성해보세요!
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 초기 데이터는 서버에서 렌더링 (SEO) */}
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {/* 무한 스크롤은 클라이언트에서 처리 */}
      <ArticleListClient
        initialLastId={last_id}
        initialHasMore={has_more}
        initialArticleIds={articles.map((a) => a.id)}
      />
    </div>
  );
};

export default ArticleList;
