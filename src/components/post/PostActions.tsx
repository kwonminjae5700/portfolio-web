"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";

interface PostActionsProps {
  articleId: number;
  authorId: number;
}

export default function PostActions({ articleId, authorId }: PostActionsProps) {
  const { user, isLoggedIn } = useAuth();
  const isAuthor = isLoggedIn && user?.id === authorId;

  if (!isAuthor) return null;

  return (
    <Link
      href={ROUTES.EDIT(articleId)}
      className="text-sm text-gray-400 hover:text-gray-600 transition"
    >
      수정하기
    </Link>
  );
}
