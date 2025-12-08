import Hero from "@/components/Hero";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const posts = [
    {
      id: 1,
      title: "LLM이지만 PDF는 읽고 싶어: 복잡한 PDF를 LLM이 이해하는 방법",
      description:
        "네이버 사내 기술 교류 행사인 NAVER ENGINEERING DAY 2025(10월)에서 발표되었던 세션을 공개합니다. 발표 내용 LLM-Friendly PDF parser PaLADIN을 소개합니다. 발표 내용 AI/LLM을 적극적으로 할용하...",
      date: "2025.12.05",
      viewCount: 7438,
      thumbnail: "yes",
      thumbnailColor: "#00C7FF",
      thumbnailText: "LLM이지만\nPDF는 읽고 싶어",
    },
    {
      id: 2,
      title: "VLOps:Event-driven MLOps & Omni-Evaluator",
      description:
        "네이버 사내 기술 교류 행사인 NAVER ENGINEERING DAY 2025(10월)에서 발표되었던 세션을 공개합니다. 발표 내용 Event-driven MLOps은 학습 경가지를 Typed Message 단위로 정의하고, Event-...",
      date: "2025.12.04",
      viewCount: 734,
      thumbnail: "yes",
      thumbnailColor: "#7B5BFF",
      thumbnailText: "Event-driven\nMLOps\n& Omni-Evaluator",
    },
    {
      id: 3,
      title: "FE News 25년 12월 소식을 전해드립니다!",
      description:
        "안녕하세요, FE News 입니다. 이번 달에도 프론트엔드 관련 최신 정보와 소식을 정리하여 전해드립니다.",
      date: "2025.12.01",
      viewCount: 2156,
      thumbnail: "no",
    },
  ];

  return (
    <main className="min-h-screen bg-white pt-[56px]">
      <Hero />

      <div className="max-w-[1280px] mx-auto px-5 pt-[60px] pb-20 flex gap-10">
        {/* Main Content List */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                description={post.description}
                date={post.date}
                viewCount={post.viewCount}
                thumbnail={post.thumbnail}
                thumbnailColor={post.thumbnailColor}
                thumbnailText={post.thumbnailText}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </main>
  );
}
