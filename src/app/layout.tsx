import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Header from "@/shared/Header";
import Footer from "@/shared/Footer";

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

export const metadata: Metadata = {
  title: "Kwon5700's Blog",
  description: "권민재의 블로그입니다.",
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
      <body className={`${avenir.variable} antialiased bg-white text-gray-900`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
