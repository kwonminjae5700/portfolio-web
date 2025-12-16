import Link from "next/link";

const TopPost = () => {
  return (
    <Link href="/1">
      <div className="w-full flex gap-6 items-center">
        <div className="font-bold text-[18px]">1</div>
        <div className="line-clamp-1 text-[#666]">
          LLM이지만 PDF는 읽고 싶어: 복잡한 상황 속에서 당황하지 않고
        </div>
      </div>
    </Link>
  );
};

export default TopPost;
