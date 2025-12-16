import Link from "next/link";

export default function PostFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">공유하기:</span>
          <button className="text-gray-400 hover:text-blue-600 transition">
            트위터
          </button>
          <button className="text-gray-400 hover:text-blue-600 transition">
            링크드인
          </button>
        </div>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-600 font-semibold transition"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    </footer>
  );
}
