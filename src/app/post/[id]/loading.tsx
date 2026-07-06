import { CONTAINER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PostLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className={cn(CONTAINER, "py-10 md:py-14")}>
        <div className="max-w-[46rem] mx-auto animate-pulse">
          {/* 카테고리 칩 */}
          <div className="flex gap-2">
            <div className="h-4 bg-wash rounded w-16" />
            <div className="h-4 bg-wash rounded w-20" />
          </div>
          {/* 제목 */}
          <div className="mt-4 h-9 bg-wash rounded w-full" />
          <div className="mt-2 h-9 bg-wash rounded w-3/5" />
          {/* 메타 */}
          <div className="mt-6 h-4 bg-wash rounded w-72" />
          <div className="mt-8 border-b border-line" />
          {/* 본문 */}
          <div className="mt-10 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-wash rounded"
                style={{ width: `${[100, 95, 88, 100, 72, 96, 90, 60][i]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
