"use client";

import Link from "next/link";
import { btnPrimary, btnGhost } from "@/components/ui/buttonStyles";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center bg-white px-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">
          페이지를 불러오지 못했습니다
        </h1>
        <p className="mt-3 text-sm text-muted">
          잠시 후 다시 시도해 주세요. 계속되면 홈에서 다른 글을 볼 수 있습니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <button type="button" onClick={reset} className={btnPrimary}>
            다시 시도
          </button>
          <Link href="/" className={btnGhost}>
            홈으로
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-faint">오류 코드: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
