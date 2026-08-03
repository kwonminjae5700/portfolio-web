/**
 * 앱 전역 상수
 */

/**
 * 미설정이면 모든 요청 URL이 "undefined/articles/3"이 되는데, 이 문자열은
 * 환경이 달라도 똑같아서 백엔드가 다른데 fetch 캐시 키가 겹친다.
 * (로컬 3번 글 자리에 프로덕션 3번 글이 보이는 사고) 그래서 빠르게 터뜨린다.
 * 끝 슬래시도 잘라낸다 — "…:8080/"과 "…:8080"은 캐시 키가 다르다.
 */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!rawApiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL이 설정되지 않았습니다. .env를 확인하세요.",
  );
}

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  TOP_POSTS_LIMIT: 5,
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  RESET_PASSWORD: "/reset-password",
  WRITE: "/write",
  PROFILE: "/profile",
  POST: (id: number | string) => `/post/${id}`,
  EDIT: (id: number | string) => `/edit/${id}`,
  CATEGORY: (id: number | string) => `/category/${id}`,
} as const;

// 모든 페이지가 공유하는 콘텐츠 컨테이너
export const CONTAINER = "max-w-6xl mx-auto px-5 sm:px-8 lg:px-10";

/**
 * 글 본문이 실제로 읽히는 컬럼 폭 (46rem = 736px).
 * 상세 페이지 <article>, 로딩 스켈레톤, 에디터 미리보기가 모두 이걸 쓴다.
 * 셋이 어긋나면 미리보기에서 본 줄바꿈이 발행 후 달라진다.
 *
 * mx-auto를 쓰지 않는다 — 가운데 정렬하면 헤더 로고/네비의 왼쪽 선(CONTAINER의
 * 패딩 끝)보다 본문이 안쪽으로 밀린다. xl에서는 20px(목차 그리드 컬럼 776 - 736의
 * 절반), 목차가 빠지는 xl 미만에서는 최대 168px까지 어긋난다.
 * 홈의 본문 컬럼(flex-1)도 왼쪽에 붙어 있어서, 왼쪽 선을 사이트 전체에서 하나로 맞춘다.
 */
export const READING_COLUMN = "max-w-[46rem] min-w-0 w-full";

/**
 * 에디터 한 판(작성창 / 미리보기)의 박스 폭.
 * 본문 736 + px-4 좌우 32 + border 좌우 2 + 스크롤바 8 = 778.
 * (globals.css가 ::-webkit-scrollbar에 width를 지정해 자리를 차지하는 스크롤바를 쓴다)
 */
export const EDITOR_PANE = "w-full max-w-[778px] mx-auto min-w-0";

/**
 * 에디터 컨테이너 — 두 판이 나란히 들어갈 때만 넓어진다.
 * 상세 페이지처럼 감싸는 카드 없이 컨테이너 패딩만 쓴다.
 *   1단: 778 + px-10 80 = 858
 *   2단: 778*2 + gap-6 24 = 1580 → + px-10 80 = 1660
 * 필요 뷰포트 = 1660 + 스크롤바 게터 8 = 1668 → 여유를 두고 1672에서 전환.
 * (MacBook 16" 기본 해상도가 1728px이라 그 아래여야 한다)
 *
 * 이 수치들은 EDITOR_PANE, 그리드 gap, EDITOR_SPLIT_MIN_WIDTH와 물려 있다.
 * 하나 바꾸면 전부 다시 계산할 것.
 */
export const EDITOR_CONTAINER =
  "mx-auto px-5 sm:px-8 lg:px-10 max-w-[858px] min-[1672px]:max-w-[1660px]";

/**
 * 에디터가 좌우 2단이 되는 최소 뷰포트 폭.
 * 위 EDITOR_CONTAINER와 PostEditor 그리드의 min-[1672px]와 반드시 같아야 한다 —
 * 스크롤 동기화가 "두 판이 나란히 보이는가"를 이 값으로 판단한다.
 */
export const EDITOR_SPLIT_MIN_WIDTH = 1672;

/**
 * 사이트 정본 URL. canonical, OG, sitemap, robots, JSON-LD가 전부 이 값에서 나온다.
 * 8곳에 흩어져 있던 하드코딩을 여기로 모았다 — 도메인이 바뀌면 여기만 고친다.
 * 끝 슬래시를 자르는 이유: `${SITE_URL}/post/3`이 "//post/3"이 되면 canonical이
 * 실제 URL과 달라지고, Google은 그걸 다른 페이지로 취급한다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr"
).replace(/\/+$/, "");

// 검색 결과와 OG 카드에 노출되는 사이트 이름
export const SITE_NAME = "Kwon5700's Blog";

/**
 * 사이트 공통 메타 설명 — 여러 곳에서 재사용해 중복을 피한다.
 * 검색 결과 스니펫에 그대로 쓰이므로, 무슨 글이 있는 곳인지 알 수 있을 만큼은 길게.
 */
export const SITE_DESCRIPTION =
  "개발하며 배운 것들과 공부한 내용을 기록하는 권민재의 블로그. 문제를 만나고 해결한 과정, 그때그때의 학습 노트를 남깁니다.";

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

// 회원가입·비밀번호 재설정이 공유하는 비밀번호 최소 길이
export const PASSWORD_MIN_LENGTH = 6;
