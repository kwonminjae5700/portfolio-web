import type { NextConfig } from "next";

// 미설정이면 모든 요청 URL이 "undefined/articles/3"이 되는데, 이 문자열은
// 백엔드가 달라도 똑같아서 fetch 캐시 키가 겹친다. 빌드 시작부터 막는다.
// (NEXT_PUBLIC_API_URL을 바꿨다면 dev:clean / build:clean 으로 .next를 비울 것 —
//  이 값은 빌드 타임에 번들로 인라인되기 때문에 재빌드 없이는 안 바뀐다)
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL이 필요합니다. .env를 확인하세요.");
}

const nextConfig: NextConfig = {
  // 성능 최적화
  compress: true,
  productionBrowserSourceMaps: false,

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 헤더 보안
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],
  
  // 리다이렉트
  redirects: async () => [],
  
  // 재작성 규칙
  rewrites: async () => ({
    fallback: [],
    beforeFiles: [],
    afterFiles: [],
  }),
};

export default nextConfig;
