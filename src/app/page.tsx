import Post from "@/components/Post";
import TopContent from "@/components/TopContent";
import TopPost from "@/components/TopPost";
import Image from "next/image";

export default function Page() {
  return (
    <main>
      <Image
        src="/background.png"
        alt="Kwon5700 Profile Picture"
        width={1920}
        height={150}
        className="w-full h-auto"
      />
      <section className="px-98 py-14 flex justify-between gap-16">
        <article className="w-7xl flex-col gap-12">
          <Post />
        </article>
        <aside>
          <TopContent content={<TopPost />} />
        </aside>
      </section>
    </main>
  );
}
