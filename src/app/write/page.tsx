"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/types/api";
import PostContent from "@/components/post/PostContent";

export default function WritePostPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("카테고리 로드 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const newCategory = await api.createCategory({ name: newCategoryName.trim() });
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategories((prev) => [...prev, newCategory.id]);
      setNewCategoryName("");
      setShowCategoryInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "카테고리 생성에 실패했습니다.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const article = await api.createArticle({
        title,
        content,
        category_ids:
          selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      router.push(`/post/${article.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "글 작성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">새 글 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      selectedCategories.includes(category.id)
                        ? "bg-mainBlue text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                
                {showCategoryInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        } else if (e.key === "Escape") {
                          setShowCategoryInput(false);
                          setNewCategoryName("");
                        }
                      }}
                      placeholder="카테고리 이름"
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent"
                      autoFocus
                      disabled={isCreatingCategory}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      className="px-3 py-1.5 bg-mainBlue text-white text-sm rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingCategory ? "생성 중..." : "추가"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryInput(false);
                        setNewCategoryName("");
                      }}
                      className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700 transition"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCategoryInput(true)}
                    className="px-4 py-2 rounded-full text-sm border-2 border-dashed border-gray-300 text-gray-500 hover:border-mainBlue hover:text-mainBlue transition"
                  >
                    + 새 카테고리
                  </button>
                )}
              </div>
              {categories.length === 0 && !showCategoryInput && (
                <p className="text-sm text-gray-500 mt-2">아직 카테고리가 없습니다. 새 카테고리를 만들어보세요!</p>
              )}
            </div>

            {/* 에디터 & 미리보기 영역 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 에디터 */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  내용 (Markdown 지원)
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={25}
                  className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition font-mono text-sm resize-none"
                  placeholder="내용을 입력하세요... (Markdown 문법을 사용할 수 있습니다)"
                />
              </div>

              {/* 미리보기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미리보기
                </label>
                <div className="w-full h-[600px] px-4 py-3 border border-gray-200 rounded-lg bg-white overflow-y-auto prose prose-sm max-w-none">
                  {content ? (
                    <PostContent content={content} />
                  ) : (
                    <p className="text-gray-400 italic">
                      마크다운 내용이 여기에 미리보기로 표시됩니다...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/"
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-mainBlue text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "저장 중..." : "작성하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
