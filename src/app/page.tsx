import Post from "@/components/Post";
import TopContent from "@/components/TopContent";
import Image from "next/image";

export default function HomePage() {
  return (
    <main>
      <Image
        src="/background.png"
        alt="Kwon5700 Profile Picture"
        width={1920}
        height={150}
        className="w-full h-auto"
      />
      <section className="px-78 py-14 flex justify-between gap-16">
        <article className="w-7xl flex-col gap-14">
          <Post />
        </article>
        <aside className="flex-col gap-8 sticky top-24 self-start">
          <TopContent mode="posts" />
          <TopContent mode="categories" />
        </aside>
      </section>
    </main>
  );
}
