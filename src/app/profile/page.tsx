"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Article } from "@/types/api";
import { btnPrimary, btnOutline } from "@/components/ui/buttonStyles";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        const data = await api.getArticles();
        // 본인이 작성한 글만 필터링
        const filtered =
          data.articles?.filter((article) => article.author_id === user?.id) ||
          [];
        setMyArticles(filtered);
      } catch (err) {
        console.error("글 목록 로드 실패:", err);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    if (user) {
      fetchMyArticles();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="bg-white pt-10 pb-12">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* 프로필 정보 */}
        <div className="bg-white border border-line rounded-xl p-5 sm:p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-ink">
              내 프로필
            </h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-danger hover:bg-danger-soft rounded-md transition-colors"
            >
              로그아웃
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent-soft rounded-full flex items-center justify-center text-accent-deep text-xl sm:text-2xl font-semibold shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4 sm:ml-6 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-ink truncate">
                  {user.username}
                </h2>
                <p className="text-muted text-sm sm:text-base break-all">
                  {user.email}
                </p>
                <p className="text-xs sm:text-sm text-faint mt-1">
                  가입일: {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 내가 작성한 글 */}
        <div className="bg-white border border-line rounded-xl p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              내가 작성한 글 ({myArticles.length})
            </h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/categories" className={btnOutline}>
                카테고리 관리
              </Link>
              <Link href="/write" className={btnPrimary}>
                새 글 작성
              </Link>
            </div>
          </div>

          {isLoadingArticles ? (
            <div className="text-center py-8 text-muted">로딩 중...</div>
          ) : myArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted mb-4">아직 작성한 글이 없습니다.</p>
              <Link href="/write" className="text-accent hover:underline">
                첫 글을 작성해보세요!
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myArticles.map((article) => (
                <div
                  key={article.id}
                  className="border-b border-line pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
                >
                  <div className="min-w-0">
                    <Link href={`/post/${article.id}`}>
                      <h3 className="text-base sm:text-lg font-medium text-ink hover:text-accent transition">
                        {article.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-muted flex-wrap">
                      <span>{formatDate(article.created_at)}</span>
                      <span>조회수 {article.view_count}</span>
                      {article.categories && article.categories.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.categories.map((cat) => (
                            <span key={cat.id} className="text-accent">
                              #{cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/edit/${article.id}`}
                    className="text-sm text-faint hover:text-muted transition self-end sm:self-auto shrink-0"
                  >
                    수정
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8 flex justify-end">
          <Link href="/" className="text-muted hover:text-ink transition">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
