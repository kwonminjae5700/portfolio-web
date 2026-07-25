/**
 * 앱 전역 상수
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  TOP_POSTS_LIMIT: 5,
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WRITE: "/write",
  PROFILE: "/profile",
  POST: (id: number | string) => `/post/${id}`,
  EDIT: (id: number | string) => `/edit/${id}`,
  CATEGORY: (id: number | string) => `/category/${id}`,
} as const;

// 모든 페이지가 공유하는 콘텐츠 컨테이너
export const CONTAINER = "max-w-6xl mx-auto px-5 sm:px-8 lg:px-10";

// 사이트 공통 메타 설명 — 여러 곳에서 재사용해 중복을 피한다
export const SITE_DESCRIPTION = "개발하며 배운 것들을 기록하는 권민재의 블로그.";

export const EXTERNAL_LINKS = {
  PORTFOLIO: "https://kwon5700.kr",
  GITHUB: "https://github.com/kwonminjae5700",
} as const;

export const INTERSECTION_OBSERVER_OPTIONS = {
  threshold: 0,
  rootMargin: "200px",
} as const;

// 글 작성 권한이 있는 이메일
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
