"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** 다이얼로그 헤더 제목 — aria-labelledby로 연결된다 */
  title: string;
  children: React.ReactNode;
  /** 패널 폭 등 크기 제어 (예: "max-w-2xl") */
  panelClassName?: string;
}

/**
 * 공용 모달 프리미티브.
 *
 * document.body로 포털을 띄우는 이유: 트리거가 <form> 안에 있어도 모달 내부
 * 인풋의 Enter가 폼을 암묵 제출하지 않고, z-index/overflow 스태킹도 부모와
 * 무관해진다. open이 되기 전엔 null을 반환하므로 (열림은 항상 클릭 이후 =
 * 하이드레이션 이후) SSR mounted 가드는 필요 없다.
 *
 * 포커스 트랩은 두지 않는다 — 앱 어디에도 트랩이 없고(헤더 모바일 메뉴 참고),
 * Escape·백드롭 닫기·닫힐 때 트리거로 포커스 복원으로 충분한 단일 작성자
 * 관리 화면이다. Tab이 패널 밖으로 나갈 수 있음은 알려진 트레이드오프.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  panelClassName,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // onClose 정체성이 바뀌어도 열림 효과가 다시 돌지 않게 ref로 읽는다
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    // 열리기 직전 포커스(트리거 버튼)를 기억해 두었다가 닫힐 때 되돌린다
    const prevFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // 자식이 autoFocus로 이미 포커스를 가져갔으면 뺏지 않는다 (글 참조 검색창)
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    // 배경 스크롤 잠금. 스크롤바가 사라지면 본문이 옆으로 흔들리므로,
    // 잠금 전후의 폭 차이를 재서 CSS 변수로 보정한다 (globals.css의 data-scroll-locked)
    const root = document.documentElement;
    const widthBefore = root.clientWidth;
    root.setAttribute("data-scroll-locked", "");
    root.style.setProperty(
      "--scrollbar-comp",
      `${root.clientWidth - widthBefore}px`,
    );

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.removeAttribute("data-scroll-locked");
      root.style.removeProperty("--scrollbar-comp");
      prevFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    // 헤더가 z-50 fixed라 그 위(z-60)에 띄운다
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* 배경 클릭으로 닫기 — 헤더 모바일 메뉴와 같은 딤 농도 */}
      <div
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "modal-panel relative w-full max-h-[85dvh] flex flex-col bg-white rounded-lg border border-line shadow-xl focus:outline-none",
          panelClassName,
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 -mr-1.5 text-muted hover:text-ink hover:bg-wash rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <IconX size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
