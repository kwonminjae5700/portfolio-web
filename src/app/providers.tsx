"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/shared/Header";
import Footer from "@/shared/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      {children}
      <Footer />
    </AuthProvider>
  );
}
