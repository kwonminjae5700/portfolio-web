import type { NextConfig } from "next";

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
