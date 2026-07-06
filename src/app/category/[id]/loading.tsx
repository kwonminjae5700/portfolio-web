import { CONTAINER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className={cn(CONTAINER, "py-10 md:py-14")}>
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-4 bg-wash rounded w-16" />
          <div className="mt-3 h-8 bg-wash rounded w-48" />
          <div className="mt-3 h-4 bg-wash rounded w-20" />
          <div className="mt-6 border-b border-line" />
          <div className="mt-8 flex flex-col gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-wash rounded w-24" />
                  <div className="h-6 bg-wash rounded w-4/5" />
                  <div className="h-4 bg-wash rounded w-full" />
                  <div className="h-4 bg-wash rounded w-2/3" />
                </div>
                <div className="w-[150px] aspect-[4/3] bg-wash rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
