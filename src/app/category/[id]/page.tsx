import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleList";
import { getRecentArticles } from "@/lib/articles";
import { getCategory } from "@/lib/categories";
import { CONTAINER, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    return { title: "카테고리를 찾을 수 없습니다" };
  }

  return {
    title: `${category.name} 카테고리`,
    description: `${category.name} 카테고리의 글 목록입니다.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  // 백엔드에 카테고리 필터 API가 없어 최신 100편에서 서버측 필터링한다.
  const { articles } = await getRecentArticles();
  const categoryId = Number(id);
  const filtered = articles.filter((article) =>
    article.categories?.some((c) => c.id === categoryId),
  );

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] bg-white">
      <div className={cn(CONTAINER, "py-10 md:py-14")}>
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">
              <span className="text-accent">#</span> {category.name}
            </h1>
            <p className="mt-2 text-sm text-muted">글 {filtered.length}편</p>
            <div className="mt-6 border-b border-line" />
          </header>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted">이 카테고리에는 아직 글이 없습니다.</p>
              <Link
                href={ROUTES.HOME}
                className="mt-3 inline-block text-sm text-accent hover:text-accent-deep transition-colors"
              >
                전체 글 보기
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
