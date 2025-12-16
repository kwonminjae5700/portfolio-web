import Image from "next/image";
import Link from "next/link";

const Post = () => {
  return (
    <Link href="/1">
      <div className="w-full flex gap-8 pb-8 border-b border-gray-300">
        <div className="flex-col gap-3 h-fit">
          <h2 className="text-2xl font-normal mb-2 text-title hover:text-black">
            [인턴십] 2026 NAVER AI CHALLENGE를 소개합니다.
          </h2>
          <p className="line-clamp-2 text-content hover:text-black">
            네이버의 개발 문화와 함께 프로젝트 협업 방식을 체험할 수 있는 2026
            NAVER AI CHALLENGE 인턴십 모집을 시작했습니다. 실무에서 다루는 AI
            문제를 네이버의 현업 엔지니어와 함께 아이디어 설계 단계부터 기이버의
            개발 문화와 함께 프로젝트 협업 방식을 체험할 수 있는 2026 NAVER AI
            CHALLENGE 인턴십 모집을 시작했습니다. 실무에서 다루는 AI 문제를
            네이버의 현업 엔지니어와 함께 아이디어 설계 단계부터 기
          </p>
          <div className="space-x-2 text-[#3F35FF]">
            <span># Tensorflow</span>
            <span># Kubeflow</span>
          </div>
        </div>
        <Image src="/ex.png" alt="Example Image" width={180} height={110} />
      </div>
    </Link>
  );
};

export default Post;
