"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useEmailVerification } from "@/hooks/useEmailVerification";

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
          className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-mainBlue hover:text-blue-500"
            >
              로그인
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* 이메일 입력 섹션 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                  className={`appearance-none relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    emailError
                      ? "border-red-500"
                      : isEmailVerified
                        ? "border-green-500"
                        : "border-gray-300"
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
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-mainBlue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainBlue transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCodeSending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    전송 중...
                  </span>
                ) : (
                  "인증 코드 전송"
                )}
              </button>
            )}

            {/* 인증 코드 입력 섹션 */}
            {isCodeSent && !isEmailVerified && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    인증 코드를 이메일로 전송했습니다.
                  </p>
                  <p className="text-sm text-gray-500">
                    (유효시간:{" "}
                    <span
                      className={`font-mono font-semibold ${
                        timeRemaining < 60 ? "text-red-500" : "text-mainBlue"
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                    )
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-mainBlue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainBlue transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCodeVerifying ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      확인 중...
                    </span>
                  ) : (
                    "인증 확인"
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    코드를 받지 못하셨나요?{" "}
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={!canResend}
                      className={`font-medium ${
                        canResend
                          ? "text-mainBlue hover:text-blue-500 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      재전송
                    </button>
                    {!canResend && resendCooldown > 0 && (
                      <span className="text-gray-400 ml-1">
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
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition"
                    placeholder="사용자 이름을 입력하세요 (최소 3자)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition"
                    placeholder="비밀번호를 입력하세요 (최소 6자)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent transition"
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-mainBlue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainBlue transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
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
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
