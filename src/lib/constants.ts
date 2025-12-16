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
} as const;

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
