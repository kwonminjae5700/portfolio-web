import { notFound } from "next/navigation";
import { getArticle } from "@/lib/articles";

/**
 * 화면에는 아무것도 그리지 않는다. 오직 HTTP 상태 코드를 제대로 내보내려고 있다.
 *
 * loading.tsx가 page를 Suspense로 감싸는 순간, Next는 200 헤더와 스켈레톤부터
 * 흘려보낸다. 그 뒤에 page 안에서 notFound()를 부르든 예외가 나든 상태 코드는
 * 이미 200으로 확정돼 있다. 그래서 예전엔 없는 글이 200(소프트 404)으로,
 * 백엔드 장애도 200으로 크롤러에게 나갔다. 실제로 /post/999999가 200이었다.
 *
 * layout은 그 Suspense 경계 바깥이라 여기서 먼저 판정하면 상태 코드가 제대로 붙는다.
 *   없는 글  → notFound() → 404
 *   조회 실패 → getArticle이 던짐 → 500 → Google이 나중에 재시도
 *
 * getArticle은 React cache()로 묶여 있어 page와 generateMetadata가 다시
 * 요청하지 않는다. 클라이언트 라우팅 중에는 loading.tsx 스켈레톤이 그대로 뜬다.
 */
export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return <>{children}</>;
}
