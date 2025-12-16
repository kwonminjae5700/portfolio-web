"use client";

import { CommentSection } from "@/components/comments";

interface PostCommentsProps {
  articleId: number;
}

export default function PostComments({ articleId }: PostCommentsProps) {
  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <CommentSection articleId={articleId} />
    </section>
  );
}
