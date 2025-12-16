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
 * 클래스명 조건부 결합
 */
export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};
