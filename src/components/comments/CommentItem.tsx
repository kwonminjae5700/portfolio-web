"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import type { Comment } from "@/types/api";

interface CommentItemProps {
  comment: Comment;
  onUpdate: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export default function CommentItem({
  comment,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.id === comment.author_id;

  const handleUpdate = async () => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

    setIsSubmitting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className="py-5">
      <div className="flex items-start gap-3">
        {/* 이니셜 아바타 */}
        <div
          aria-hidden="true"
          className="w-9 h-9 shrink-0 rounded-full bg-accent-soft text-accent-deep flex items-center justify-center text-sm font-semibold select-none"
        >
          {comment.author_name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold text-ink">
                {comment.author_name}
              </span>
              <span className="text-xs text-faint">
                {formatRelativeTime(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-faint">(수정됨)</span>
              )}
            </div>

            {isOwner && !isEditing && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-faint hover:text-muted transition-colors"
                  disabled={isSubmitting}
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-faint hover:text-danger transition-colors"
                  disabled={isSubmitting}
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting || !editContent.trim()}
                  className="px-3 py-1.5 text-xs bg-accent text-white rounded-md hover:bg-accent-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "수정 중..." : "수정"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs text-muted hover:bg-wash rounded-md disabled:opacity-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-body whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
