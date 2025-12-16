"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">
              {comment.author_name}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-400">(수정됨)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting || !editContent.trim()}
                  className="px-3 py-1 text-sm bg-mainBlue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "수정 중..." : "수정"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        {isOwner && !isEditing && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-500 hover:text-mainBlue"
              disabled={isSubmitting}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-gray-500 hover:text-red-500"
              disabled={isSubmitting}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
