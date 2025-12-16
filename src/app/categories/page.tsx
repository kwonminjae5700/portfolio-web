"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/types/api";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";

export default function CategoriesPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 새 카테고리 추가
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 수정 중인 카테고리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("카테고리 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    setError("");

    try {
      const newCategory = await api.createCategory({
        name: newCategoryName.trim(),
      });
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "카테고리 생성에 실패했습니다."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingName.trim()) return;

    setError("");

    try {
      const updated = await api.updateCategory(id, {
        name: editingName.trim(),
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "카테고리 수정에 실패했습니다."
      );
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("정말로 이 카테고리를 삭제하시겠습니까?")) return;

    setError("");

    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "카테고리 삭제에 실패했습니다."
      );
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
            <Link
              href="/profile"
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← 프로필로 돌아가기
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* 새 카테고리 추가 폼 */}
          <form onSubmit={handleAddCategory} className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 카테고리 추가
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="카테고리 이름"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={isAdding || !newCategoryName.trim()}
                className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <IconPlus size={18} />
                {isAdding ? "추가 중..." : "추가"}
              </button>
            </div>
          </form>

          {/* 카테고리 목록 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              카테고리 목록 ({categories.length})
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 카테고리가 없습니다. 위에서 새 카테고리를 추가해보세요!
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    {editingId === category.id ? (
                      /* 수정 모드 */
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          className="px-3 py-2 bg-mainBlue text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition text-sm"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      /* 표시 모드 */
                      <>
                        <div>
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">
                            ID: {category.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(category)}
                            className="p-2 text-gray-400 hover:text-mainBlue transition"
                            title="수정"
                          >
                            <IconPencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                            title="삭제"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
