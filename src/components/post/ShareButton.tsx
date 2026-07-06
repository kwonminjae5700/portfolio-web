"use client";

import { useState } from "react";
import { IconLink, IconCheck } from "@tabler/icons-react";

/**
 * 현재 글의 URL을 클립보드에 복사하는 공유 버튼
 */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근이 막힌 환경에서는 조용히 무시
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted hover:text-ink hover:bg-wash transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {copied ? (
        <>
          <IconCheck size={16} className="text-accent" />
          <span className="text-accent">복사됨</span>
        </>
      ) : (
        <>
          <IconLink size={16} />
          링크 복사
        </>
      )}
    </button>
  );
}
