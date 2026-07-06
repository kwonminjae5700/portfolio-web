"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const { isLoggedIn, user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "댓글 작성에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-wash rounded-lg p-5 text-center">
        <p className="text-sm text-muted">
          댓글을 작성하려면{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-accent font-medium hover:text-accent-deep transition-colors"
          >
            로그인
          </Link>
          이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${user?.username}님, 댓글을 남겨보세요`}
        className="w-full px-4 py-3 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent resize-none placeholder:text-faint"
        rows={3}
        disabled={isSubmitting}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        >
          {isSubmitting ? "작성 중..." : "댓글 작성"}
        </button>
      </div>
    </form>
  );
}
