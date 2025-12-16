import Image from "next/image";
import ArticleList from "@/components/ArticleList";
import TopContentApi from "@/components/TopContentApi";
import { API_BASE_URL, PAGINATION } from "@/lib/constants";
import type { ArticleListResponse } from "@/types/api";

// 서버에서 초기 게시글 데이터 가져오기
async function getInitialArticles(): Promise<ArticleListResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/articles?limit=${PAGINATION.DEFAULT_LIMIT}`,
      { next: { revalidate: 60 } } // 60초마다 재검증
    );
    if (!res.ok) {
      return { articles: [], has_more: false, last_id: null };
    }
    return res.json();
  } catch {
    return { articles: [], has_more: false, last_id: null };
  }
}

export default async function HomePage() {
  const initialData = await getInitialArticles();

  return (
    <main>
      <Image
        src="/bridge.png"
        alt="Kwon5700 Profile Picture"
        width={1728}
        height={500}
        className="w-full h-[550px] object-cover"
        priority
      />
      <section className="px-78 py-14 flex justify-between gap-16">
        <article className="w-7xl flex-col gap-14">
          <ArticleList initialData={initialData} />
        </article>
        <aside className="flex-col gap-8 sticky top-24 self-start">
          <TopContentApi mode="posts" />
          <TopContentApi mode="categories" />
        </aside>
      </section>
    </main>
  );
}
