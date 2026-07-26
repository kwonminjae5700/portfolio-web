import { cache } from "react";
import { API_BASE_URL } from "./constants";
import { CATEGORIES_TAG } from "./cacheTags";
import type { Category } from "@/types/api";

/**
 * 카테고리 조회. src/lib/articles.ts와 같은 규칙을 따른다 —
 * 4xx는 "없는 카테고리"라 null, 5xx와 네트워크 오류는 throw.
 *
 * 카테고리 페이지 / 사이드바 / sitemap 세 곳에 똑같은 fetch가 흩어져 있었고,
 * 셋 다 실패를 빈 배열로 삼켜서 백엔드가 죽으면 "카테고리가 없는 사이트"처럼
 * 보였다. 한곳에 모아 실패를 실패로 전달한다.
 */
export const getCategory = cache(
  async (id: string): Promise<Category | null> => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      next: { revalidate: 300, tags: [CATEGORIES_TAG] },
    });
    if (res.ok) return res.json();
    if (res.status < 500) return null;
    throw new Error(`카테고리 조회 실패: ${res.status} ${res.statusText}`);
  },
);

/** 카테고리 전체 목록. 실패는 그대로 던진다 — 호출부가 보조 UI면 거기서 잡는다. */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    next: { revalidate: 300, tags: [CATEGORIES_TAG] }, // 5분마다 + 변경 시 재검증
  });
  if (!res.ok) {
    throw new Error(`카테고리 목록 조회 실패: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
