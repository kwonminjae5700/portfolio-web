import { Metadata } from "next";
import PostHeader from "@/components/post/PostHeader";
import PostContent from "@/components/post/PostContent";
import PostFooter from "@/components/post/PostFooter";
import posts from "@/data/posts.json";

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
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800">
            포스트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mt-4">요청하신 포스트 ID: {id}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50">
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
