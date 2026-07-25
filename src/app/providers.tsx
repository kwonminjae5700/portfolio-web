"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/shared/Header";
import Footer from "@/shared/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      {/* fixed 헤더(h-18) 높이만큼 전역에서 한 번만 보정 */}
      <div className="pt-18">{children}</div>
      <Footer />
    </AuthProvider>
  );
}
