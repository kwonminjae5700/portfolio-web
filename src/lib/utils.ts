/**
 * 유틸리티 함수 모음
 */

/**
 * 날짜 문자열을 한국어 형식으로 포맷팅
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * 날짜 문자열을 짧은 형식으로 포맷팅
 */
export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

/**
 * 마크다운 문법을 제거하고 순수 텍스트만 반환
 */
export const stripMarkdown = (text: string): string => {
  return text
    // 코드 블록 제거 (```...```)
    .replace(/```[\s\S]*?```/g, "")
    // 인라인 코드 제거 (`...`)
    .replace(/`([^`]+)`/g, "$1")
    // 이미지 제거 ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    // 링크를 텍스트만 남기기 [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // 헤더 제거 (# ## ### 등)
    .replace(/^#{1,6}\s+/gm, "")
    // Bold/Italic 제거 (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // 취소선 제거 (~~text~~)
    .replace(/~~(.*?)~~/g, "$1")
    // 블록 인용 제거 (> )
    .replace(/^>\s+/gm, "")
    // 리스트 마커 제거 (-, *, +, 1.)
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // 수평선 제거 (---, ***, ___)
    .replace(/^[-*_]{3,}$/gm, "")
    // HTML 태그 제거
    .replace(/<[^>]+>/g, "")
    // 여러 줄바꿈을 공백으로
    .replace(/\n+/g, " ")
    // 여러 공백을 하나로
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * 문자열을 지정된 길이로 자르고 말줄임표 추가
 */
export const truncateText = (text: string, maxLength: number): string => {
  const cleanText = stripMarkdown(text);
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength)}...`;
};

/**
 * 본문 읽기 시간 추정 (분 단위, 최소 1분)
 * 한국어 산문 기준 분당 약 500자, 코드는 분당 약 25줄로 계산
 */
export const estimateReadingTime = (content: string): number => {
  const codeBlocks = content.match(/```[\s\S]*?```/g) ?? [];
  const codeLines = codeBlocks.reduce(
    (sum, block) => sum + block.split("\n").length,
    0,
  );
  const proseChars = stripMarkdown(
    content.replace(/```[\s\S]*?```/g, ""),
  ).length;
  return Math.max(1, Math.ceil(proseChars / 500 + codeLines / 25));
};

/**
 * 상대 시간 표기 (방금 전 ~ N일 전, 7일 이후는 날짜로)
 */
export const formatRelativeTime = (dateString: string): string => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(dateString);
};

/**
 * 클래스명 조건부 결합
 */
export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};
