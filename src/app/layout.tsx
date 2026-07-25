import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import { Providers } from "./providers";
import { SITE_DESCRIPTION } from "@/lib/constants";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.kwon5700.kr";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kwon5700's Blog",
    template: "%s | Kwon5700's Blog",
  },
  description:
    SITE_DESCRIPTION,
  authors: [{ name: "권민재", url: siteUrl }],
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
    url: siteUrl,
    siteName: "Kwon5700's Blog",
    title: "Kwon5700's Blog",
    description:
      SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kwon5700's Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kwon5700's Blog",
    description:
      SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Google Search Console 인증 시 추가
    // google: "your-google-verification-code",
    // Naver Search Advisor 인증 시 추가
    // other: { "naver-site-verification": "your-naver-verification-code" },
  },
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
