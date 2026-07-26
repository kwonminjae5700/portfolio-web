import { notFound } from "next/navigation";
import { getRecentArticles } from "@/lib/articles";
import { getCategory } from "@/lib/categories";

/**
 * post/[id]/layout.tsx와 같은 이유로 있는, 아무것도 그리지 않는 레이아웃.
 * loading.tsx의 Suspense 경계 안에서 실패하면 상태 코드가 이미 200으로
 * 확정된 뒤라, 이 페이지를 렌더할 수 있는지를 경계 바깥에서 먼저 판정한다.
 *
 * 글 목록까지 여기서 당겨오는 이유: 카테고리 이름만 멀쩡하고 목록 조회가
 * 실패하면 "글 0편인 카테고리"가 200으로 나간다. 둘 다 성공해야 이 페이지가
 * 성립하므로 판정도 함께 한다. 둘 다 cache()로 묶여 있어 page가 다시 부르지 않는다.
 */
export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category] = await Promise.all([getCategory(id), getRecentArticles()]);

  if (!category) {
    notFound();
  }

  return <>{children}</>;
}
