import { Metadata } from "next";
import PostHeader from "@/components/post/PostHeader";
import PostContent from "@/components/post/PostContent";
import PostFooter from "@/components/post/PostFooter";
import posts from "@/data/posts.json";

import Link from "next/link";
interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export async function generateStaticParams() {
  return (posts as Post[]).map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = (posts as Post[]).find((p) => p.id === id);

  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다",
      description: "요청하신 포스트를 찾을 수 없습니다.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: ["Portfolio"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = (posts as Post[]).find((p) => p.id === id);

  if (!post) {
    return (
      <main className="min-h-screen px-4 py-12 pt-30">
        <div className="max-w-3xl mx-auto flex-col gap-10">
          <h1 className="text-4xl font-bold text-gray-800">
            원하시는 글을 찾을 수 없습니다.
          </h1>
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 font-semibold transition"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50 pt-30">
      <article className="max-w-4xl mx-auto">
        <PostHeader
          title={post.title}
          excerpt={post.excerpt}
          date={post.date}
        />
        <PostContent content={post.content} />
        <PostFooter />
      </article>
    </main>
  );
}
