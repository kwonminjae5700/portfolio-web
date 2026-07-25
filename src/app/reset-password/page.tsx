"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, NETWORK_ERROR_STATUS } from "@/lib/api";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { ROUTES, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { AUTH_MESSAGES, RESET_PASSWORD_MESSAGES } from "@/lib/messages";
import { LoadingSpinner, ErrorMessage } from "@/components/ui";
import EmailVerificationFields from "@/components/auth/EmailVerificationFields";
import { inputBase } from "@/components/ui/buttonStyles";

function getResetErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return RESET_PASSWORD_MESSAGES.FAILED;

  if (err.status === NETWORK_ERROR_STATUS) return AUTH_MESSAGES.NETWORK_ERROR;
  if (err.status === 429) return AUTH_MESSAGES.TOO_MANY_ATTEMPTS;
  if (err.status >= 500) return AUTH_MESSAGES.SERVER_ERROR;
  // 재설정 토큰은 수명이 짧다 — 만료되면 처음부터 다시 받아야 한다
  if (err.status === 400 || err.status === 401) {
    return RESET_PASSWORD_MESSAGES.TOKEN_EXPIRED;
  }

  return RESET_PASSWORD_MESSAGES.FAILED;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const verification = useEmailVerification({ purpose: "reset_password" });
  const { email, isEmailVerified, resetToken } = verification;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isEmailVerified || !resetToken) {
      setError(RESET_PASSWORD_MESSAGES.NOT_VERIFIED);
      return;
    }

    if (password !== confirmPassword) {
      setError(RESET_PASSWORD_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(RESET_PASSWORD_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword({
        email,
        reset_token: resetToken,
        new_password: password,
      });
      router.push(`${ROUTES.LOGIN}?reset=true`);
    } catch (err) {
      setError(getResetErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center bg-white py-12 px-5">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-2xl font-bold text-ink">
            비밀번호 재설정
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            가입하신 이메일로 인증 코드를 보내드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <ErrorMessage message={error} />}

          <div className="space-y-4">
            <EmailVerificationFields verification={verification} />

            {/* 새 비밀번호 입력 섹션 (이메일 인증 완료 후) */}
            {isEmailVerified && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-body mb-1"
                  >
                    새 비밀번호 <span className="text-danger">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputBase}
                    placeholder={`새 비밀번호를 입력하세요 (최소 ${PASSWORD_MIN_LENGTH}자)`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-body mb-1"
                  >
                    새 비밀번호 확인 <span className="text-danger">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputBase}
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                </div>
              </>
            )}
          </div>

          {isEmailVerified && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" tone="white" />
                  변경 중...
                </span>
              ) : (
                "비밀번호 변경"
              )}
            </button>
          )}
        </form>

        <div className="text-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
