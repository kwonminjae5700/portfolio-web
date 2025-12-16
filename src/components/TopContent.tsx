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
  <Link href={ROUTES.POST(article.id)}>
    <div className="flex gap-3 items-start py-2">
      <span className="text-mainBlue font-bold">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate hover:text-black">
          {article.title}
        </p>
        <p className="text-xs text-gray-400">
          조회수 {article.view_count.toLocaleString()}
        </p>
      </div>
    </div>
  </Link>
);

const CategoryItem = ({ category }: CategoryItemProps) => (
  <Link href={`/categories?id=${category.id}`}>
    <div className="w-fit bg-gray-100 rounded-3xl px-5 py-1 text-gray-500 cursor-pointer hover:text-black transition">
      {category.name}
    </div>
  </Link>
);

const TopContent = async ({ mode }: TopContentProps) => {
  const articles = mode === "posts" ? await getTopArticles() : [];
  const categories = mode === "categories" ? await getCategories() : [];

  const title = `TOP ${mode === "posts" ? "5" : "CATEGORIES"}`;
  const isEmpty =
    mode === "posts" ? articles.length === 0 : categories.length === 0;
  const emptyMessage =
    mode === "posts" ? "글이 없습니다." : "카테고리가 없습니다.";

  return (
    <section className="w-64 pb-10 border-b border-gray-300">
      <h2 className="font-bold text-xl mb-4">{title}</h2>

      {isEmpty ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : mode === "posts" ? (
        <ul className="flex flex-col gap-3">
          {articles.map((article, index) => (
            <li key={article.id}>
              <TopPostItem article={article} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex gap-3 flex-wrap">
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
