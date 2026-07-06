"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { ErrorMessage } from "@/components/ui";
import { inputBase } from "@/components/ui/buttonStyles";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.login({ email, password });
      login(response.token, response.user);
      router.push(ROUTES.HOME);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center bg-white py-12 px-5">
      <div className="max-w-md w-full">
        <div>
          <h1 className="text-center text-2xl font-bold text-ink">로그인</h1>
          <p className="mt-2 text-center text-sm text-muted">
            아직 계정이 없으신가요?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="font-medium text-accent hover:text-accent-deep transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <ErrorMessage message={error} />

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-body mb-1.5"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-body mb-1.5"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href={ROUTES.HOME}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
