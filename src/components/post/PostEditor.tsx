"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Category, Article } from "@/types/api";
import PostContent from "@/components/post/PostContent";
import MarkdownHelpModal from "@/components/post/MarkdownHelpModal";
import { IconPhoto, IconMarkdown } from "@tabler/icons-react";
import { LoadingSpinner } from "@/components/ui";
import { inputBase, btnToolbar } from "@/components/ui/buttonStyles";
import { EDITOR_CONTAINER, EDITOR_PANE, READING_COLUMN } from "@/lib/constants";
import { revalidateArticleCache } from "@/lib/actions/articles";
import { useScrollSync } from "@/hooks";
import {
  isSelectionInsideCodeFence,
  computeIndentEdit,
  computeOutdentEdit,
  type IndentEdit,
} from "@/lib/editorIndent";

interface PostEditorProps {
  mode: "create" | "edit";
  articleId?: number;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * 외부 앱(노션 등)에서 붙여넣을 때 남는 이미지 찌꺼기 줄.
 * 원본에 이미지 블롭이 없고 text/plain 폴백만 있으면 브라우저 기본 붙여넣기가
 * "!파일명.png" 같은 줄을 그대로 꽂는데, 마크다운으로는 아무 의미가 없어 본문에
 * 글자로 남는다.
 *
 * 문자 클래스가 [ ] ( ) 를 금지하므로 ![캡션](a.png) 이나 [링크](a.png) 는
 * 구조적으로 매칭되지 않는다. 120자 상한으로 긴 산문도 걸러진다.
 * "!" 없는 image.png 줄은 정상 문장일 수 있어 건드리지 않는다.
 */
const IMAGE_RESIDUE_LINE =
  /^[ \t]*!(?!\[)[^\n[\]()]{0,120}\.(?:png|jpe?g|gif|webp|svg|avif|bmp|heic|heif)[ \t]*$/i;

function stripImageResidueLines(text: string): string {
  if (!text.includes("!")) return text;
  return text
    .split("\n")
    .filter((line) => !IMAGE_RESIDUE_LINE.test(line))
    .join("\n");
}

/** 파일명을 마크다운 alt(=캡션)로 안전하게 쓰도록 이스케이프 */
function escapeAltText(name: string): string {
  return name.replace(/[\r\n]+/g, " ").replace(/([\\[\]])/g, "\\$1");
}

/**
 * DataTransfer에서 이미지 파일만 모은다.
 * DataTransferItem은 이벤트 핸들러가 끝나면 무효화되므로 반드시 동기로 호출할 것.
 */
function collectImageFiles(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  const fromFiles = Array.from(dt.files ?? []).filter((f) =>
    f.type.startsWith("image/"),
  );
  // 합집합이 아니라 폴백이다 — 둘 다 채우면 같은 이미지를 두 번 올린다.
  if (fromFiles.length > 0) return fromFiles;

  const fromItems: File[] = [];
  for (const item of Array.from(dt.items ?? [])) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (
      file &&
      (file.type.startsWith("image/") || item.type.startsWith("image/"))
    ) {
      fromItems.push(file);
    }
  }
  return fromItems;
}

/**
 * index 자리에 스니펫을 빈 줄로 감싼 블록으로 끼워 넣는다.
 * 앵커가 조금 어긋나도 단어 중간을 가르지 않게 하려는 것.
 */
function insertAsBlock(prev: string, index: number, snippet: string) {
  const at = Math.max(0, Math.min(index, prev.length));
  const before = prev.slice(0, at);
  const after = prev.slice(at);
  const lead =
    before === "" || before.endsWith("\n\n")
      ? ""
      : before.endsWith("\n")
        ? "\n"
        : "\n\n";
  const tail =
    after === ""
      ? "\n"
      : after.startsWith("\n\n")
        ? ""
        : after.startsWith("\n")
          ? "\n"
          : "\n\n";
  const inserted = `${lead}${snippet}${tail}`;
  return { next: before + inserted + after, caret: at + inserted.length };
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
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /**
   * 마지막으로 알고 있는 캐럿 위치. null이면 문서 끝에 붙인다.
   * await 이후의 DOM에서 읽으면 이미 포커스가 옮겨간 뒤라 0이 나오므로,
   * 사용자 이벤트 시점에 동기로 기록해 둔다.
   */
  const caretRef = useRef<number | null>(null);

  const rememberCaret = () => {
    const textarea = textareaRef.current;
    if (textarea) caretRef.current = textarea.selectionStart;
  };

  // 작성창과 미리보기가 같은 지점을 보도록 스크롤을 묶는다 (2단 레이아웃에서만)
  const previewRef = useScrollSync({ textareaRef, content });

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
        // 이동 전에 캐시를 비운다. 먼저 이동하면 옛 캐시를 그대로 읽는다.
        await revalidateArticleCache(articleId);
        router.replace(`/post/${articleId}`);
      } else {
        const newArticle = await api.createArticle({
          title,
          content,
          category_ids:
            selectedCategories.length > 0 ? selectedCategories : undefined,
        });
        await revalidateArticleCache(newArticle.id);
        router.replace(`/post/${newArticle.id}`);
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
      await revalidateArticleCache(articleId);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "글 삭제에 실패했습니다.");
    }
  };

  /**
   * 캐럿 위치에 마크다운을 끼워 넣는다.
   * setContent를 함수형으로 쓰는 게 핵심 — 업로드가 여러 개 동시에 끝나거나
   * 업로드 중 사용자가 타이핑해도 스냅샷을 덮어쓰지 않는다.
   */
  const insertAtCaret = (snippet: string) => {
    // 앵커는 업데이터 밖에서 캡처한다 — StrictMode가 업데이터를 두 번 돌려도
    // (dev에서 실제로 돈다) 같은 위치에 꽂혀 결과가 밀리지 않는다.
    const anchor = caretRef.current;
    setContent((prev) => {
      const { next, caret } = insertAsBlock(prev, anchor ?? prev.length, snippet);
      // 캐럿을 전진시켜야 다음 삽입이 이 뒤로 이어진다.
      caretRef.current = caret;
      return next;
    });

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      const caret = caretRef.current;
      if (!textarea || caret === null) return;
      // 제목 같은 다른 입력창에 타이핑 중이면 포커스를 뺏지 않는다.
      const active = document.activeElement;
      if (
        active !== textarea &&
        (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA")
      ) {
        return;
      }
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
    });
  };

  /**
   * 한 번의 사용자 동작으로 들어온 이미지들을 함께 업로드한다.
   * 병렬로 올리되 삽입은 파일 순서대로 한 번에 하므로, 완료 순서에 따라
   * 결과가 달라지지 않고 한 장이 실패해도 나머지는 살아남는다.
   */
  const uploadImages = async (files: File[]) => {
    const valid: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        rejected.push(`${file.name}: 10MB 초과`);
      } else if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        rejected.push(`${file.name}: 지원하지 않는 형식`);
      } else {
        valid.push(file);
      }
    }

    setError(rejected.length > 0 ? rejected.join(" / ") : "");
    if (valid.length === 0) return;

    setUploadingCount((n) => n + valid.length);
    try {
      const results = await Promise.allSettled(
        valid.map((file) => api.uploadImage(file)),
      );

      const snippets: string[] = [];
      const failed: string[] = [];
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          snippets.push(
            `![${escapeAltText(valid[i].name)}](${result.value.url})`,
          );
        } else {
          failed.push(valid[i].name);
        }
      });

      if (snippets.length > 0) insertAtCaret(snippets.join("\n\n"));
      if (failed.length > 0) {
        setError(`이미지 업로드에 실패했습니다: ${failed.join(", ")}`);
      }
    } finally {
      setUploadingCount((n) => Math.max(0, n - valid.length));
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = "";
    if (files.length > 0) void uploadImages(files);
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = collectImageFiles(e.dataTransfer);
    // 이미지가 아니면 브라우저 기본 동작(텍스트 드롭)을 그대로 둔다.
    if (files.length === 0) return;
    // 드래그 중 브라우저가 옮겨 둔 캐럿이 곧 드롭 지점이다.
    caretRef.current = e.currentTarget.selectionStart;
    e.preventDefault();
    void uploadImages(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // 붙여넣기 핸들러
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    caretRef.current = textarea.selectionStart;

    const files = collectImageFiles(e.clipboardData);
    if (files.length > 0) {
      // 파일명 텍스트가 함께 꽂히는 경로를 원천 차단한다.
      e.preventDefault();
      void uploadImages(files);
      return;
    }

    // 이미지 블롭이 없는 붙여넣기 — 텍스트에 섞인 이미지 찌꺼기만 걷어낸다.
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    const cleaned = stripImageResidueLines(text);
    // 손댈 게 없으면 기본 동작을 그대로 둬서 네이티브 undo를 보존한다.
    if (cleaned === text) return;

    e.preventDefault();
    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    // execCommand는 deprecated지만 undo 스택을 유지하는 유일한 방법이고,
    // input 이벤트를 발생시켜 onChange가 content를 맞춰준다.
    if (document.execCommand("insertText", false, cleaned)) {
      caretRef.current = textarea.selectionStart;
      return;
    }
    setContent((prev) => prev.slice(0, start) + cleaned + prev.slice(end));
    caretRef.current = start + cleaned.length;
    requestAnimationFrame(() => {
      const caret = caretRef.current ?? 0;
      textarea.setSelectionRange(caret, caret);
    });
  };

  /**
   * 계산된 들여쓰기 편집을 undo 보존 방식으로 적용한다 (handlePaste와 동일한 전략).
   * 교체 구간을 선택으로 잡고 execCommand로 갈아끼우면 input 이벤트가 동기로 돌아
   * onChange가 content를 맞추고, 브라우저 undo 스택에는 한 스텝으로 남는다.
   */
  const applyIndentEdit = (textarea: HTMLTextAreaElement, edit: IndentEdit) => {
    textarea.setSelectionRange(edit.replaceStart, edit.replaceEnd);
    // insertText는 빈 문자열을 무시하는 브라우저가 있어, 그때만 delete를 쓴다
    const ok =
      edit.replacement === ""
        ? document.execCommand("delete", false)
        : document.execCommand("insertText", false, edit.replacement);
    if (ok) {
      // insertText는 캐럿을 삽입 텍스트 끝에 두므로 의도한 선택으로 되돌린다.
      // 선택 변경은 문서 변형이 아니라 undo 스택을 건드리지 않는다.
      textarea.setSelectionRange(edit.nextSelStart, edit.nextSelEnd);
      caretRef.current = edit.nextSelStart;
      return;
    }
    // execCommand 미지원 폴백 — 이 경로만 네이티브 undo를 잃는다 (handlePaste와 동일)
    setContent(
      (prev) =>
        prev.slice(0, edit.replaceStart) +
        edit.replacement +
        prev.slice(edit.replaceEnd),
    );
    caretRef.current = edit.nextSelStart;
    requestAnimationFrame(() => {
      textarea.setSelectionRange(edit.nextSelStart, edit.nextSelEnd);
    });
  };

  /**
   * 코드 펜스 안에서만 Tab을 2칸 들여쓰기(Shift+Tab은 내어쓰기)로 바꾼다.
   * 펜스 밖에서는 아무것도 가로채지 않아 기본 포커스 이동이 그대로 산다.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return; // Tab 외엔 절대 개입하지 않는다
    if (e.nativeEvent.isComposing) return; // 한글 IME 조합 중엔 기본 동작(조합 확정)
    if (e.altKey || e.ctrlKey || e.metaKey) return; // 수식키 조합은 브라우저 몫

    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;
    if (!isSelectionInsideCodeFence(value, selectionStart, selectionEnd)) {
      return;
    }

    // 펜스 안에서는 Tab/Shift+Tab 둘 다 포커스를 옮기지 않는다
    e.preventDefault();

    const edit = e.shiftKey
      ? computeOutdentEdit(value, selectionStart, selectionEnd)
      : computeIndentEdit(value, selectionStart, selectionEnd);
    if (!edit) return; // 아웃덴트할 공백이 없음 — 아무것도 하지 않는다

    applyIndentEdit(textarea, edit);
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
      <div className={EDITOR_CONTAINER}>
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

          <div className="max-w-[778px]">
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
                아직 카테고리가 없습니다. 위 버튼으로 추가할 수 있습니다.
              </p>
            )}
          </div>

          {/*
            에디터 & 미리보기 영역.
            두 판이 각각 778px(본문 736px)로 들어갈 폭이 확보되는 1672px부터만
            좌우 2단이 되고, 그 아래에서는 세로로 쌓아 본문 폭을 지킨다.
          */}
          <div className="grid grid-cols-1 gap-6 justify-center min-[1672px]:grid-cols-[778px_778px]">
            {/* 에디터 */}
            <div className={EDITOR_PANE}>
              <div className="flex flex-wrap justify-between items-center gap-y-2 mb-2">
                <label
                  htmlFor="content"
                  className="block text-xl font-medium text-body"
                >
                  내용 (Markdown 지원)
                </label>
                <div className="flex items-center gap-2">
                  {uploadingCount > 0 && (
                    <span className="text-sm text-accent">
                      업로드 중... ({uploadingCount})
                    </span>
                  )}
                  {/* mousedown이 blur보다 먼저 오므로, 포커스를 잃기 전에 캐럿을 기록한다 */}
                  <label
                    htmlFor="imageUpload"
                    onMouseDown={rememberCaret}
                    className={`${btnToolbar} cursor-pointer`}
                  >
                    <IconPhoto size={16} /> 이미지
                  </label>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className={btnToolbar}
                  >
                    <IconMarkdown size={16} /> 도움말
                  </button>
                </div>
              </div>
              <textarea
                id="content"
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  caretRef.current = e.target.selectionStart;
                }}
                onSelect={rememberCaret}
                onKeyDown={handleKeyDown}
                onKeyUp={rememberCaret}
                onClick={rememberCaret}
                onBlur={rememberCaret}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
                rows={25}
                className={`${inputBase} h-[400px] lg:h-[600px] font-mono text-sm resize-none [scrollbar-gutter:stable]`}
                placeholder="내용을 입력하세요. 이미지는 위 버튼, 드래그, 붙여넣기로 넣을 수 있습니다."
              />
            </div>

            {/* 미리보기 */}
            <div className={EDITOR_PANE}>
              <label className="block text-xl font-medium text-body mb-2">
                미리보기
              </label>
              {/*
                px-4는 유지해야 한다 — 코드 블록이 모바일에서 -mx-4로 삐져나오는데
                (markdownComponents.tsx의 CodeBlock) overflow-y-auto가 overflow-x도
                auto로 만들어서, 패딩이 없으면 미리보기 안에 가로 스크롤이 생긴다.
                안쪽 READING_COLUMN이 상세 페이지의 <article>과 같은 역할.
              */}
              <div
                ref={previewRef}
                className="w-full h-[400px] lg:h-[600px] px-4 py-3 border border-line rounded-md bg-white overflow-y-auto"
              >
                <div className={READING_COLUMN}>
                  {content ? (
                    <PostContent content={content} sourceLineAnchors />
                  ) : (
                    <p className="text-faint italic">
                      마크다운 내용이 여기에 미리보기로 표시됩니다...
                    </p>
                  )}
                </div>
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

        <MarkdownHelpModal
          open={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    </main>
  );
}
