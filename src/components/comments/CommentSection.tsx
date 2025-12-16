"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Comment } from "@/types/api";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { LoadingSpinner } from "@/components/ui";

interface CommentSectionProps {
  articleId: number;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchComments = useCallback(
    async (lastId?: number) => {
      try {
        const response = await api.getComments(articleId, lastId);
        if (lastId) {
          setComments((prev) => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }
        setHasMore(response.has_more);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "댓글을 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [articleId]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleLoadMore = () => {
    const lastComment = comments[comments.length - 1];
    if (lastComment && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchComments(lastComment.id);
    }
  };

  const handleCreateComment = async (content: string) => {
    const newComment = await api.createComment(articleId, { content });
    setComments((prev) => [newComment, ...prev]);
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    const updatedComment = await api.updateComment(articleId, commentId, {
      content,
    });
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? updatedComment : c))
    );
  };

  const handleDeleteComment = async (commentId: number) => {
    await api.deleteComment(articleId, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            fetchComments();
          }}
          className="mt-2 text-mainBlue hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      <CommentForm onSubmit={handleCreateComment} />

      <div className="divide-y divide-gray-200">
        {comments.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </p>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))}

            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-4 py-2 text-mainBlue hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
