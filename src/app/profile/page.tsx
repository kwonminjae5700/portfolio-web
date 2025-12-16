"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Article } from "@/types/api";

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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 프로필 정보 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 text-sm transition"
            >
              로그아웃
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-mainBlue rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.username}
                </h2>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  가입일: {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* 관리 메뉴 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              <Link
                href="/write"
                className="px-4 py-2 bg-mainBlue text-white rounded-lg text-sm hover:bg-blue-600 transition"
              >
                새 글 작성
              </Link>
              <Link
                href="/categories"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                카테고리 관리
              </Link>
            </div>
          </div>
        </div>

        {/* 내가 작성한 글 */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              내가 작성한 글 ({myArticles.length})
            </h2>
            <Link
              href="/write"
              className="px-4 py-2 bg-mainBlue text-white rounded-lg text-sm hover:bg-blue-600 transition"
            >
              새 글 작성
            </Link>
          </div>

          {isLoadingArticles ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : myArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">아직 작성한 글이 없습니다.</p>
              <Link href="/write" className="text-mainBlue hover:underline">
                첫 글을 작성해보세요!
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myArticles.map((article) => (
                <div
                  key={article.id}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <Link href={`/post/${article.id}`}>
                    <h3 className="text-lg font-medium text-gray-900 hover:text-mainBlue transition">
                      {article.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{formatDate(article.created_at)}</span>
                    <span>조회수 {article.view_count}</span>
                    {article.categories && article.categories.length > 0 && (
                      <div className="flex gap-1">
                        {article.categories.map((cat) => (
                          <span key={cat.id} className="text-mainBlue">
                            #{cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/edit/${article.id}`}
                      className="text-sm text-gray-400 hover:text-gray-600 transition"
                    >
                      수정
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
