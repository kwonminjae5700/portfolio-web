"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { LoadingSpinner, ErrorMessage } from "@/components/ui";
import { inputBase } from "@/components/ui/buttonStyles";

// 인증 코드 입력 컴포넌트
function CodeInput({
  code,
  onChange,
  disabled,
}: {
  code: string[];
  onChange: (code: string[]) => void;
  disabled: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    onChange(newCode);

    // 다음 입력 필드로 자동 포커스
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Backspace 시 이전 필드로 이동
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // 6자리 숫자인 경우 자동 분배
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      onChange(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="one-time-code"
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold text-ink border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition disabled:bg-wash disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const {
    email,
    isEmailValid,
    isEmailVerified,
    verificationCode,
    isCodeSending,
    isCodeSent,
    isCodeVerifying,
    timeRemaining,
    canResend,
    resendCooldown,
    emailError,
    codeError,
    setEmail,
    sendVerificationCode,
    setVerificationCode,
    verifyCode,
    resendCode,
    formatTime,
  } = useEmailVerification();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isCodeComplete = verificationCode.every((digit) => digit !== "");
  const isTimerExpired = timeRemaining === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (username.length < 3) {
      setError("사용자 이름은 최소 3자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      await api.register({ email, username, password });
      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center bg-white py-12 px-5">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold text-ink">회원가입</h2>
          <p className="mt-2 text-center text-sm text-muted">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:text-accent-deep transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <ErrorMessage message={error} />}

          <div className="space-y-4">
            {/* 이메일 입력 섹션 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-body mb-1"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isCodeSent || isEmailVerified}
                  className={`w-full px-4 py-3 border text-ink placeholder:text-faint rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition disabled:bg-wash disabled:cursor-not-allowed ${
                    emailError
                      ? "border-red-500"
                      : isEmailVerified
                        ? "border-green-500"
                        : "border-line"
                  }`}
                  placeholder="이메일을 입력하세요"
                />
                {isEmailVerified && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
              {isEmailVerified && (
                <p className="mt-1 text-sm text-green-600">인증 완료</p>
              )}
            </div>

            {/* 인증 코드 전송 버튼 (이메일 미인증 & 코드 미전송 상태) */}
            {!isEmailVerified && !isCodeSent && (
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={!isEmailValid || isCodeSending}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCodeSending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" tone="white" />
                    전송 중...
                  </span>
                ) : (
                  "인증 코드 전송"
                )}
              </button>
            )}

            {/* 인증 코드 입력 섹션 */}
            {isCodeSent && !isEmailVerified && (
              <div className="space-y-4 bg-wash p-4 rounded-lg border border-line">
                <div className="text-center">
                  <p className="text-sm text-muted">
                    인증 코드를 이메일로 전송했습니다.
                  </p>
                  <p className="text-sm text-muted">
                    (유효시간:{" "}
                    <span
                      className={`font-mono font-semibold ${
                        timeRemaining < 60 ? "text-red-500" : "text-accent"
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                    )
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-2 text-center">
                    인증 코드 <span className="text-red-500">*</span>
                  </label>
                  <CodeInput
                    code={verificationCode}
                    onChange={setVerificationCode}
                    disabled={isTimerExpired || isCodeVerifying}
                  />
                  {codeError && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {codeError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={
                    !isCodeComplete || isTimerExpired || isCodeVerifying
                  }
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCodeVerifying ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" tone="white" />
                      확인 중...
                    </span>
                  ) : (
                    "인증 확인"
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-muted">
                    코드를 받지 못하셨나요?{" "}
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={!canResend}
                      className={`font-medium ${
                        canResend
                          ? "text-accent hover:text-accent-deep cursor-pointer"
                          : "text-faint cursor-not-allowed"
                      }`}
                    >
                      재전송
                    </button>
                    {!canResend && resendCooldown > 0 && (
                      <span className="text-faint ml-1">
                        ({resendCooldown}초)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* 사용자 정보 입력 섹션 (이메일 인증 완료 후) */}
            {isEmailVerified && (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-body mb-1"
                  >
                    사용자 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="name"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputBase}
                    placeholder="사용자 이름을 입력하세요 (최소 3자)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-body mb-1"
                  >
                    비밀번호 <span className="text-red-500">*</span>
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
                    placeholder="비밀번호를 입력하세요 (최소 6자)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-body mb-1"
                  >
                    비밀번호 확인 <span className="text-red-500">*</span>
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
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              </>
            )}
          </div>

          {isEmailVerified && (
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" tone="white" />
                  가입 중...
                </span>
              ) : (
                "회원가입"
              )}
            </button>
          )}
        </form>

        <div className="text-center flex justify-end">
          <Link
            href="/"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
