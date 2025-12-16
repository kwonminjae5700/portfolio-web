import Image from "next/image";
import ArticleList from "@/components/ArticleList";
import TopContentApi from "@/components/TopContentApi";

export default function HomePage() {
  return (
    <main>
      <Image
        src="/bridge.png"
        alt="Kwon5700 Profile Picture"
        width={1728}
        height={500}
        className="w-full h-[550px] object-cover"
      />
      <section className="px-78 py-14 flex justify-between gap-16">
        <article className="w-7xl flex-col gap-14">
          <ArticleList />
        </article>
        <aside className="flex-col gap-8 sticky top-24 self-start">
          <TopContentApi mode="posts" />
          <TopContentApi mode="categories" />
        </aside>
      </section>
    </main>
  );
}
