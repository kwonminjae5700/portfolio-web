"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { EDITOR_SPLIT_MIN_WIDTH } from "@/lib/constants";
import { SOURCE_LINE_ATTR } from "@/lib/rehypeSourceLine";
import { measureLineTops } from "@/lib/textareaLineMetrics";

/** 미리보기가 다시 그려지고 나서 눈금을 다시 재기까지 기다리는 시간 */
const REBUILD_DELAY_MS = 100;

/**
 * 같은 원문 줄에 대응하는 양쪽 y좌표 눈금.
 * 두 배열은 길이가 같고 각각 단조 증가한다.
 */
interface Anchors {
  editor: number[];
  preview: number[];
}

interface Params {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  content: string;
}

function buildAnchors(
  textarea: HTMLTextAreaElement,
  preview: HTMLElement,
): Anchors {
  const nodes = preview.querySelectorAll<HTMLElement>(`[${SOURCE_LINE_ATTR}]`);
  const containerTop = preview.getBoundingClientRect().top;
  const containerScroll = preview.scrollTop;

  const found: { line: number; y: number }[] = [];
  let previousLine = -1;
  for (const node of nodes) {
    const line = Number(node.getAttribute(SOURCE_LINE_ATTR));
    // 문서 순서가 곧 줄 순서다 — 거꾸로 가는 건 버리고 오름차순만 남긴다
    if (!Number.isFinite(line) || line <= previousLine) continue;
    previousLine = line;
    found.push({
      line,
      y: node.getBoundingClientRect().top - containerTop + containerScroll,
    });
  }

  const editorTops = measureLineTops(
    textarea,
    found.map((item) => item.line),
  );

  // 문서 처음과 끝을 센티넬로 묶어 두면 양 끝이 자동으로 맞고 보간 로직이 균일해진다
  const editor = [0];
  const previewY = [0];
  const push = (e: number, p: number) => {
    if (e > editor[editor.length - 1] && p > previewY[previewY.length - 1]) {
      editor.push(e);
      previewY.push(p);
    }
  };

  found.forEach((item, index) => push(editorTops[index], item.y));
  push(textarea.scrollHeight, preview.scrollHeight);

  return { editor, preview: previewY };
}

/** from 눈금 위의 값을 같은 구간의 to 눈금으로 선형 보간한다 */
function project(value: number, from: number[], to: number[]): number {
  const last = from.length - 1;
  if (last < 1) return value;
  if (value <= from[0]) return to[0];
  if (value >= from[last]) return to[last];

  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (from[mid] <= value) lo = mid;
    else hi = mid;
  }

  const span = from[lo + 1] - from[lo];
  const ratio = span > 0 ? (value - from[lo]) / span : 0;
  return to[lo] + ratio * (to[lo + 1] - to[lo]);
}

/**
 * 에디터(textarea)와 미리보기의 스크롤을 원문 줄 기준으로 양방향 동기화한다.
 *
 * 비율 동기화는 이미지나 코드블록처럼 원문 몇 줄이 렌더 후 수백 px이 되는 지점에서
 * 크게 어긋난다. 그래서 미리보기 블록에 심어둔 data-source-line을 눈금 삼아
 * 구간별로 보간한다. 눈금은 미리보기가 다시 그려질 때마다 다시 잰다.
 *
 * 두 판이 나란히 보이는 2단 레이아웃에서만 동작한다 — 세로로 쌓인 화면에서는
 * 보이지도 않는 판이 따라 움직이는 게 오히려 방해된다.
 *
 * @returns 미리보기 스크롤 컨테이너에 붙일 ref. 콜백 ref라서 로딩이 끝나고
 *          에디터가 뒤늦게 마운트돼도 그 시점에 정확히 붙는다.
 */
export function useScrollSync({ textareaRef, content }: Params) {
  const [preview, setPreview] = useState<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const anchorsRef = useRef<Anchors | null>(null);
  /** 지금 스크롤을 주도하는 쪽. 반대편이 되받아 치는 무한 루프를 막는다. */
  const driverRef = useRef<Element | null>(null);

  const rebuild = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !preview) return;
    anchorsRef.current = buildAnchors(textarea, preview);
  }, [textareaRef, preview]);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${EDITOR_SPLIT_MIN_WIDTH}px)`);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // 레이아웃이 바뀌거나(리사이즈) 미리보기 높이가 변할 때(이미지 로딩) 눈금을 다시 잰다
  useEffect(() => {
    if (!enabled || !preview) {
      anchorsRef.current = null;
      return;
    }

    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(rebuild, REBUILD_DELAY_MS);
    };

    rebuild();

    const observer = new ResizeObserver(schedule);
    observer.observe(preview);
    if (preview.firstElementChild) observer.observe(preview.firstElementChild);
    window.addEventListener("resize", schedule);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      anchorsRef.current = null;
    };
  }, [enabled, preview, rebuild]);

  // 본문이 바뀌면 렌더가 끝난 뒤 눈금을 다시 잰다 (타이핑마다 재지 않도록 디바운스)
  useEffect(() => {
    if (!enabled || !preview) return;
    const timer = window.setTimeout(rebuild, REBUILD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, preview, content, rebuild]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!enabled || !preview || !textarea) return;

    let release = 0;

    const sync = (source: Element, target: Element) => {
      // 반대편이 주도 중이면, 지금 온 이벤트는 우리가 방금 옮겨 놓아서 생긴 메아리다
      if (driverRef.current && driverRef.current !== source) return;

      const anchors = anchorsRef.current;
      if (!anchors) return;

      const targetMax = target.scrollHeight - target.clientHeight;
      if (source.scrollHeight <= source.clientHeight || targetMax <= 0) return;

      const [from, to] =
        source === textarea
          ? [anchors.editor, anchors.preview]
          : [anchors.preview, anchors.editor];
      const next = Math.min(
        Math.max(project(source.scrollTop, from, to), 0),
        targetMax,
      );
      if (Math.abs(target.scrollTop - next) < 0.5) return;

      driverRef.current = source;
      target.scrollTop = next;

      // 프로그래매틱 스크롤이 만든 scroll 이벤트가 도착할 때까지 주도권을 쥔다.
      // 스펙상 scroll 이벤트는 rAF 콜백보다 먼저 돌지만, 한 프레임 늦게 흘리는
      // 엔진도 있어서 두 프레임 뒤에 놓아준다.
      cancelAnimationFrame(release);
      release = requestAnimationFrame(() => {
        release = requestAnimationFrame(() => {
          driverRef.current = null;
        });
      });
    };

    const onEditorScroll = () => sync(textarea, preview);
    const onPreviewScroll = () => sync(preview, textarea);

    textarea.addEventListener("scroll", onEditorScroll, { passive: true });
    preview.addEventListener("scroll", onPreviewScroll, { passive: true });

    return () => {
      cancelAnimationFrame(release);
      driverRef.current = null;
      textarea.removeEventListener("scroll", onEditorScroll);
      preview.removeEventListener("scroll", onPreviewScroll);
    };
  }, [enabled, preview, textareaRef]);

  return setPreview;
}
