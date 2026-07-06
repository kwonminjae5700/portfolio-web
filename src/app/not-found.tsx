import { Metadata } from "next";
import Link from "next/link";
import { btnPrimary } from "@/components/ui/buttonStyles";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  description: "요청하신 페이지를 찾을 수 없습니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center bg-white px-5">
      <div className="text-center">
        <p className="text-7xl font-black tracking-tight text-accent-soft select-none">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm text-muted">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link href="/" className={`${btnPrimary} mt-8`}>
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
