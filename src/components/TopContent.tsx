import Link from "next/link";
import { API_BASE_URL, ROUTES } from "@/lib/constants";
import type { Article, Category } from "@/types/api";

type ContentMode = "posts" | "categories";

interface TopContentProps {
  mode: ContentMode;
}

interface TopPostItemProps {
  article: Article;
  index: number;
}

interface CategoryItemProps {
  category: Category;
}

// 서버에서 인기 게시글 가져오기
async function getTopArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/top/views`, {
      cache: "no-store", // 항상 최신 조회수 반영
    });
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

// 서버에서 카테고리 가져오기
async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/categories`,
      { next: { revalidate: 300 } } // 5분마다 재검증
    );
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

const TopPostItem = ({ article, index }: TopPostItemProps) => (
  <Link
    href={ROUTES.POST(article.id)}
    className="group flex gap-3 items-baseline py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
  >
    <span className="text-accent font-bold text-sm tabular-nums w-4 shrink-0">
      {index + 1}
    </span>
    <span className="flex-1 min-w-0">
      <span className="block text-sm text-body truncate group-hover:text-ink transition-colors">
        {article.title}
      </span>
      <span className="block text-xs text-faint mt-0.5">
        조회수 {article.view_count.toLocaleString()}
      </span>
    </span>
  </Link>
);

const CategoryItem = ({ category }: CategoryItemProps) => (
  <Link
    href={ROUTES.CATEGORY(category.id)}
    className="inline-block rounded-full bg-wash px-3.5 py-1.5 text-[13px] text-muted hover:bg-accent-soft hover:text-accent-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
  >
    {category.name}
  </Link>
);

const TopContent = async ({ mode }: TopContentProps) => {
  const articles = mode === "posts" ? await getTopArticles() : [];
  const categories = mode === "categories" ? await getCategories() : [];

  const title = mode === "posts" ? "인기 글" : "카테고리";
  const isEmpty =
    mode === "posts" ? articles.length === 0 : categories.length === 0;
  const emptyMessage =
    mode === "posts" ? "글이 없습니다." : "카테고리가 없습니다.";

  return (
    <section className="w-full md:w-56 lg:w-64 pb-8 border-b border-line md:last:border-b-0">
      <h2 className="text-[13px] font-semibold text-faint mb-4">{title}</h2>

      {isEmpty ? (
        <p className="text-sm text-faint">{emptyMessage}</p>
      ) : mode === "posts" ? (
        <ul className="flex flex-col gap-1.5">
          {articles.map((article, index) => (
            <li key={article.id}>
              <TopPostItem article={article} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryItem category={category} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TopContent;
