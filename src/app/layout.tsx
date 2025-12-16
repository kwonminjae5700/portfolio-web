import type { Metadata } from "next";
import { Nanum_Gothic } from "next/font/google";
import "./globals.css";

import Header from "@/shared/Header";

const nanum = Nanum_Gothic({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kwon5700's Portfolio & Blog",
  description: "권민재의 포트폴리오 및 블로그입니다.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className={`${nanum.variable} font-sans antialiased bg-white text-gray-900 pt-21`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
