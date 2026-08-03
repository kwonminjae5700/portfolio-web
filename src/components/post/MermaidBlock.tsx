"use client";

import { useEffect, useState } from "react";
import { IconCopy, IconCheck, IconAlertTriangle } from "@tabler/icons-react";

/**
 * ```mermaid 코드 펜스를 다이어그램(SVG)으로 렌더링하는 블록.
 *
 * mermaid 번들이 커서(수백 KB) 클라이언트에서 처음 필요할 때만 동적 import로
 * 가져온다 — PostContent가 상세 페이지에서 SSR되므로 모듈 최상단 import는 금물.
 * 에디터 미리보기는 키 입력마다 재렌더되므로, 타이핑 중간의 깨진 소스로 에러
 * 박스가 깜빡이지 않게 디바운스하고, 파싱에 실패해도 직전 성공 SVG를 유지한다.
 */

type MermaidApi = typeof import("mermaid").default;

/** 소스 변경 후 다시 그리기까지의 대기 시간 (타이핑 중간 상태 무시용) */
const RENDER_DEBOUNCE_MS = 300;

/**
 * mermaid 로딩 + initialize를 1회로 보장하는 싱글턴.
 * 여러 블록이 동시에 마운트돼도 같은 Promise를 공유한다.
 * 로딩 실패 시엔 캐시를 비워 다음 렌더에서 재시도할 수 있게 한다.
 */
let mermaidPromise: Promise<MermaidApi> | null = null;

function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid")
      .then((mod) => {
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          // 파싱 실패 시 mermaid가 body에 에러 SVG를 붙이는 동작 차단 — 에러 UI는 우리가 그린다
          suppressErrorRendering: true,
          theme: "base",
          // 사이트는 라이트 고정이므로 globals.css @theme 팔레트를 한 번만 매핑한다
          themeVariables: {
            background: "#ffffff",
            primaryColor: "#e8f0ec", // accent-soft — 노드 채움
            primaryBorderColor: "#2f6b4f", // accent — 노드 테두리
            primaryTextColor: "#1b1e24", // ink
            secondaryColor: "#f6f7f9", // wash
            secondaryBorderColor: "#e7e9ed", // line
            tertiaryColor: "#ffffff",
            lineColor: "#5c6470", // muted — 엣지는 중립 회색이 노드의 그린을 살린다
            textColor: "#3a414b", // body
            edgeLabelBackground: "#ffffff",
            clusterBkg: "#f6f7f9",
            clusterBorder: "#e7e9ed",
            noteBkgColor: "#e8f0ec",
            noteBorderColor: "#2f6b4f",
            // pie는 base 파생이 3번째 조각부터 흰색이라 구분이 안 된다 — 브랜드 계열로 명시
            pie1: "#2f6b4f", // accent
            pie2: "#6db08d", // accent-on-dark
            pie3: "#cbb08a", // 코드 테마의 웜 샌드
            pie4: "#e8f0ec", // accent-soft
            pie5: "#5c6470", // muted
            pie6: "#e7e9ed", // line
            pieStrokeColor: "#ffffff",
            pieOuterStrokeColor: "#5c6470",
            fontFamily:
              'var(--font-avenir), "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", system-ui, sans-serif',
            fontSize: "14px",
          },
        });
        return mermaid;
      })
      .catch((err) => {
        mermaidPromise = null;
        throw err;
      });
  }
  return mermaidPromise;
}

/**
 * mermaid.render의 대상 id는 호출마다 유니크해야 한다.
 * useId()는 React 19에서 특수문자(«…»)가 들어가 mermaid 내부 셀렉터를 깨뜨리므로
 * 모듈 레벨 카운터를 쓴다.
 */
let renderSeq = 0;

interface MermaidBlockProps {
  source: string;
  /** 에디터 미리보기 스크롤 동기화용 data-source-line (markdownComponents의 anchorProps) */
  anchor?: Record<string, unknown>;
}

export default function MermaidBlock({ source, anchor }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // anchor(data-source-line)는 에디터 미리보기에서만 내려온다 — 미리보기는
  // 타이핑 중간 상태가 계속 흘러들어오므로 디바운스하고, 상세 페이지(불변
  // 소스)는 즉시 그린다. "첫 렌더는 즉시"로 구분하면 안 된다: 펜스를 막
  // 입력한 순간이 곧 첫 마운트라 불완전한 소스가 디바운스 없이 렌더된다.
  const inEditor = anchor !== undefined;
  // 펜스만 있고 내용이 비어 있는 상태 (```mermaid 입력 직후)
  const isEmpty = source.trim() === "";

  useEffect(() => {
    if (source.trim() === "") return; // 빈 소스는 그릴 것이 없다

    let cancelled = false;
    const delay = inEditor ? RENDER_DEBOUNCE_MS : 0;

    const timer = setTimeout(async () => {
      const id = `mermaid-block-${++renderSeq}`;
      try {
        const mermaid = await loadMermaid();
        if (cancelled) return;
        const { svg: rendered } = await mermaid.render(id, source);
        if (cancelled) return;
        setSvg(rendered);
        setError(null);
      } catch (err) {
        // 파싱 실패 시 mermaid가 남길 수 있는 임시 노드 방어적 제거
        document.getElementById(id)?.remove();
        document.getElementById(`d${id}`)?.remove();
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    }, delay);

    // StrictMode 이중 실행·언마운트에서 늦게 도착한 결과를 버린다
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source, inEditor]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      {...anchor}
      className="my-6 rounded-lg border border-line bg-white overflow-hidden"
    >
      {/* 헤더 바 — CodeBlock과 같은 구조의 라이트 크롬 */}
      <div className="flex items-center justify-between px-4 py-2 bg-wash border-b border-line">
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
          mermaid
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-faint hover:text-body transition-colors px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {copied ? (
            <>
              <IconCheck size={14} className="text-accent" />
              <span className="text-accent">복사됨</span>
            </>
          ) : (
            <>
              <IconCopy size={14} />
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center min-h-[120px] text-sm text-faint">
          다이어그램 내용을 입력하면 여기에 그려집니다
        </div>
      ) : svg ? (
        <>
          <div
            className="px-4 py-4 overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 px-4 py-2 bg-danger-soft border-t border-danger-line text-danger text-xs"
            >
              <IconAlertTriangle size={14} className="shrink-0" />
              문법 오류 — 마지막으로 성공한 다이어그램을 표시하고 있습니다
            </div>
          )}
        </>
      ) : error ? (
        <div role="alert" className="px-4 py-4">
          <p className="flex items-center gap-2 text-sm text-danger mb-2">
            <IconAlertTriangle size={16} className="shrink-0" />
            다이어그램을 그릴 수 없습니다 — Mermaid 문법을 확인해 주세요.
          </p>
          <pre className="font-mono text-xs text-muted whitespace-pre-wrap">
            {error}
          </pre>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[120px] text-sm text-faint animate-pulse">
          다이어그램 준비 중…
        </div>
      )}
    </div>
  );
}
