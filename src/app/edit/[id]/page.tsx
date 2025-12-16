"use client";

import { use } from "react";
import PostEditor from "@/components/post/PostEditor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <PostEditor mode="edit" articleId={Number(id)} />;
}
