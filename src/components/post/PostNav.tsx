import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Article } from "@/types/api";

interface PostNavProps {
  prev: Article | null;
  next: Article | null;
}

const cardClass =
  "group flex flex-col gap-1.5 rounded-lg border border-line p-4 transition-colors " +
  "hover:border-accent/40 hover:bg-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

/**
 * 글 하단의 이전/다음 글 내비게이션
 */
export default function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="이전/다음 글" className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={ROUTES.POST(prev.id)} className={cardClass}>
          <span className="flex items-center gap-1 text-xs text-faint">
            <IconChevronLeft size={14} />
            이전 글
          </span>
          <span className="text-sm font-medium text-ink line-clamp-1 group-hover:text-accent transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={ROUTES.POST(next.id)}
          className={cn(cardClass, "sm:items-end sm:text-right")}
        >
          <span className="flex items-center gap-1 text-xs text-faint">
            다음 글
            <IconChevronRight size={14} />
          </span>
          <span className="text-sm font-medium text-ink line-clamp-1 group-hover:text-accent transition-colors">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
