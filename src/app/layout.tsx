import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import { Providers } from "./providers";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

const avenir = localFont({
  src: [
    {
      path: "../fonts/Avenir-Light.ttf",
      weight: "300",
    },
    {
      path: "../fonts/Avenir-Book.ttf",
      weight: "350",
    },
    {
      path: "../fonts/Avenir-Regular.ttf",
      weight: "400",
    },
    {
      path: "../fonts/Avenir-Heavy.ttf",
      weight: "700",
    },
    {
      path: "../fonts/Avenir-Black.ttf",
      weight: "900",
    },
  ],
  variable: "--font-avenir",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "권민재", url: SITE_URL }],
  creator: "권민재",
  publisher: "권민재",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  /**
   * alternates.canonical은 여기 두면 안 된다.
   *
   * Next는 하위 라우트가 덮어쓰지 않은 메타데이터를 그대로 상속시킨다.
   * 루트에 canonical: SITE_URL을 두면 카테고리 페이지가 "내 정본은 홈이다"라고
   * 선언하고, sitemap에는 색인해달라고 제출한 상태가 된다 — Google은 그걸
   * "대체 페이지(적절한 표준 태그 있음)"로 색인에서 제외한다.
   *
   * 그래서 canonical은 각 라우트가 자기 것을 직접 명시한다.
   * 빠뜨리면 Google이 스스로 자기 URL을 정본으로 잡으니, 틀린 값을
   * 물려받는 것보다 안전하다. 새 라우트가 생겨도 조용히 망가지지 않는다.
   */
  // Search Console 소유권 확인. HTML 태그 방식이면 이 환경변수만 채우면 된다.
  // NEXT_PUBLIC_이 아니라서 클라이언트 번들에 인라인되지 않고 서버 프로세스
  // 환경에서 읽힌다 — 값만 넣고 서버를 다시 띄우면 반영된다.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // data-scroll-behavior: 라우트 이동 시 Next가 CSS smooth 스크롤을 잠시 꺼서 새 페이지가 항상 맨 위에서 시작하도록 함
    <html lang="ko" data-scroll-behavior="smooth">
      <body className={`${avenir.variable} antialiased bg-white text-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
