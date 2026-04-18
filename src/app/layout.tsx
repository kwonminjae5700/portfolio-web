import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Providers } from "./providers";

const avenir = localFont({
  src: [
    {
      path: "../fonts/Avenir-Light.ttf",
      weight: "300",
    },
    {
      path: "../fonts/Avenir-Book.ttf",
      weight: "500",
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
    "권민재의 개발 블로그입니다. 웹 개발, 프로그래밍, 기술 관련 글을 공유합니다.",
  keywords: [
    "블로그",
    "개발",
    "프로그래밍",
    "웹 개발",
    "Next.js",
    "React",
    "권민재",
    "Kwon5700",
  ],
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
      "권민재의 개발 블로그입니다. 웹 개발, 프로그래밍, 기술 관련 글을 공유합니다.",
    images: [
      {
        url: "/bridge.png",
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
      "권민재의 개발 블로그입니다. 웹 개발, 프로그래밍, 기술 관련 글을 공유합니다.",
    images: ["/bridge.png"],
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
    <html lang="ko">
      <body className={`${avenir.variable} antialiased bg-white text-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
