"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

const INDENT: Record<TocItem["level"], string> = {
  1: "pl-4",
  2: "pl-7",
  3: "pl-10",
};

/**
 * 데스크톱(xl+) 전용 목차 레일.
 * 목차 항목은 서버에서 추출해 내려주고, 여기서는 스크롤스파이만 담당한다.
 */
export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // 뷰포트 상단(헤더 아래 기준선)을 지나간 마지막 헤딩을 활성으로 잡는다.
    const updateActive = () => {
      const OFFSET = 96;
      let current: string | null = null;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= OFFSET) {
          current = el.id;
        } else {
          break;
        }
      }
      setActiveId(current ?? headings[0]?.id ?? null);
    };

    // IntersectionObserver를 트리거로만 사용해 스크롤마다가 아닌
    // 헤딩이 기준선을 넘나들 때만 재계산한다.
    const observer = new IntersectionObserver(updateActive, {
      rootMargin: "-96px 0px -70% 0px",
      threshold: 0,
    });

    headings.forEach((el) => observer.observe(el));
    updateActive();
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="목차">
      <p className="text-[13px] font-semibold text-faint mb-3">목차</p>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-1.5 -ml-px border-l-2 text-[13px] leading-snug transition-colors",
                INDENT[item.level],
                activeId === item.id
                  ? "border-accent text-accent font-medium"
                  : "border-line text-faint hover:text-muted",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
