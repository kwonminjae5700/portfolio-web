"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Category, Article } from "@/types/api";
import PostContent from "@/components/post/PostContent";
import { IconPhoto } from "@tabler/icons-react";
import { LoadingSpinner } from "@/components/ui";
import { inputBase } from "@/components/ui/buttonStyles";

interface PostEditorProps {
  mode: "create" | "edit";
  articleId?: number;
}

export default function PostEditor({ mode, articleId }: PostEditorProps) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, canWrite } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(mode === "edit");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (!canWrite) {
        alert("글 작성 권한이 없습니다.");
        router.push("/");
      }
    }
  }, [authLoading, isLoggedIn, canWrite, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("카테고리 로드 실패:", err);
      }
    };

    if (!isEditMode) {
      fetchCategories();
    }
  }, [isEditMode]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditMode || !articleId) return;

      try {
        const [articleData, categoriesData] = await Promise.all([
          api.getArticle(articleId),
          api.getCategories(),
        ]);

        setArticle(articleData);
        setTitle(articleData.title);
        setContent(articleData.content);
        setSelectedCategories(articleData.categories?.map((c) => c.id) || []);
        setCategories(categoriesData);

        // 권한 체크
        if (user && articleData.author_id !== user.id) {
          setError("이 글을 수정할 권한이 없습니다.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "글을 불러올 수 없습니다.",
        );
      } finally {
        setIsLoadingArticle(false);
      }
    };

    if (!authLoading && isLoggedIn && isEditMode) {
      fetchData();
    }
  }, [articleId, authLoading, isLoggedIn, user, isEditMode]);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const newCategory = await api.createCategory({
        name: newCategoryName.trim(),
      });
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategories((prev) => [...prev, newCategory.id]);
      setNewCategoryName("");
      setShowCategoryInput(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "카테고리 생성에 실패했습니다.",
      );
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
      if (isEditMode && articleId) {
        await api.updateArticle(articleId, {
          title,
          content,
          category_ids:
            selectedCategories.length > 0 ? selectedCategories : undefined,
        });
        router.push(`/post/${articleId}`);
      } else {
        const newArticle = await api.createArticle({
          title,
          content,
          category_ids:
            selectedCategories.length > 0 ? selectedCategories : undefined,
        });
        router.push(`/post/${newArticle.id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "글 수정에 실패했습니다."
            : "글 작성에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;

    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.deleteArticle(articleId);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "글 삭제에 실패했습니다.");
    }
  };

  // 이미지 업로드 핸들러
  const uploadImage = async (file: File) => {
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    // 파일 형식 체크
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "허용되지 않는 파일 형식입니다. (jpeg, jpg, png, gif, webp만 가능)",
      );
      return;
    }

    const uploadId = `${Date.now()}-${file.name}`;
    setUploadingImages((prev) => [...prev, uploadId]);
    setError("");

    try {
      const result = await api.uploadImage(file);

      // 커서 위치에 이미지 마크다운 삽입
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![${file.name}](${result.url})`;
        const newContent =
          content.substring(0, start) + imageMarkdown + content.substring(end);

        setContent(newContent);

        // 커서 위치를 이미지 마크다운 뒤로 이동
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + imageMarkdown.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.",
      );
    } finally {
      setUploadingImages((prev) => prev.filter((id) => id !== uploadId));
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => uploadImage(file));
    }
    // input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = "";
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          uploadImage(file);
        }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // 붙여넣기 핸들러
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          uploadImage(file);
        }
      }
    }
  };

  if (authLoading || isLoadingArticle) {
    return (
      <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center">
        <LoadingSpinner size="md" text="로딩 중..." />
      </main>
    );
  }

  if (isEditMode && !article) {
    return (
      <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink mb-4">
            글을 찾을 수 없습니다
          </h1>
          <Link href="/" className="text-accent hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const cancelHref = isEditMode && articleId ? `/post/${articleId}` : "/";

  return (
    <main className="bg-white pt-10 pb-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="bg-white border border-line rounded-xl p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-ink">
              {isEditMode ? "글 수정" : "새 글 작성"}
            </h1>
            {isEditMode && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-danger hover:bg-danger-soft rounded-md transition-colors"
              >
                삭제하기
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-soft border border-danger-line text-danger px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="block text-xl font-medium text-body mb-2"
              >
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputBase}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-xl font-medium text-body mb-2">
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
                        ? "bg-accent text-white"
                        : "bg-wash text-muted hover:bg-accent-soft hover:text-accent-deep"
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
                      className="px-3 py-1.5 text-sm border border-line rounded-full text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent"
                      autoFocus
                      disabled={isCreatingCategory}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      className="px-3 py-1.5 bg-accent text-white text-sm rounded-full hover:bg-accent-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingCategory ? "생성 중..." : "추가"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryInput(false);
                        setNewCategoryName("");
                      }}
                      className="px-3 py-1.5 text-muted text-sm hover:text-ink transition"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCategoryInput(true)}
                    className="px-4 py-2 rounded-full text-sm border-2 border-dashed border-line text-muted hover:border-accent hover:text-accent transition"
                  >
                    + 새 카테고리
                  </button>
                )}
              </div>
              {categories.length === 0 && !showCategoryInput && (
                <p className="text-sm text-muted mt-2">
                  아직 카테고리가 없습니다. 새 카테고리를 만들어보세요!
                </p>
              )}
            </div>

            {/* 에디터 & 미리보기 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* 에디터 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="content"
                    className="block text-xl font-medium text-body"
                  >
                    내용 (Markdown 지원)
                  </label>
                  <div className="flex items-center gap-2">
                    {uploadingImages.length > 0 && (
                      <span className="text-sm text-accent">
                        업로드 중... ({uploadingImages.length})
                      </span>
                    )}
                    <label
                      htmlFor="imageUpload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wash hover:bg-accent-soft text-body hover:text-accent-deep text-sm rounded-md cursor-pointer transition"
                    >
                      <IconPhoto size={16} /> 이미지 추가
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
                <textarea
                  id="content"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onPaste={handlePaste}
                  rows={25}
                  className={`${inputBase} h-[400px] lg:h-[600px] font-mono text-sm resize-none`}
                  placeholder="내용을 입력하세요... (Markdown 문법을 사용할 수 있습니다)&#10;&#10;💡 이미지 추가 방법:&#10;1. 이미지 추가 버튼 클릭&#10;2. 이미지를 드래그 앤 드롭&#10;3. Ctrl+V (또는 Cmd+V)로 붙여넣기"
                />
              </div>

              {/* 미리보기 */}
              <div>
                <label className="block text-xl font-medium text-body mb-2">
                  미리보기
                </label>
                <div className="w-full h-[400px] lg:h-[600px] px-4 py-3 border border-line rounded-md bg-white overflow-y-auto">
                  {content ? (
                    <PostContent content={content} />
                  ) : (
                    <p className="text-faint italic">
                      마크다운 내용이 여기에 미리보기로 표시됩니다...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href={cancelHref}
                className="px-6 py-3 text-muted hover:text-ink transition"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "저장 중..."
                  : isEditMode
                    ? "수정하기"
                    : "작성하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
