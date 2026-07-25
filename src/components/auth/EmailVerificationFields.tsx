"use client";

import { LoadingSpinner, CodeInput } from "@/components/ui";
import type { useEmailVerification } from "@/hooks/useEmailVerification";

// 훅이 돌려주는 값을 그대로 받는다 — 회원가입과 비밀번호 재설정이 공유하는 UI
type EmailVerification = ReturnType<typeof useEmailVerification>;

interface EmailVerificationFieldsProps {
  verification: EmailVerification;
}

export default function EmailVerificationFields({
  verification,
}: EmailVerificationFieldsProps) {
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
  } = verification;

  const isCodeComplete = verificationCode.every((digit) => digit !== "");
  const isTimerExpired = timeRemaining === 0;

  return (
    <>
      {/* 이메일 입력 섹션 */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-body mb-1"
        >
          이메일 <span className="text-danger">*</span>
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
            className={`w-full px-4 py-3 border text-ink placeholder:text-faint rounded-md focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition disabled:bg-wash disabled:cursor-not-allowed ${
              emailError
                ? "border-danger"
                : isEmailVerified
                  ? "border-accent"
                  : "border-line"
            }`}
            placeholder="이메일을 입력하세요"
          />
          {isEmailVerified && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-accent"
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
        {emailError && <p className="mt-1 text-sm text-danger">{emailError}</p>}
        {isEmailVerified && (
          <p className="mt-1 text-sm text-accent-deep">인증 완료</p>
        )}
      </div>

      {/* 인증 코드 전송 버튼 (이메일 미인증 & 코드 미전송 상태) */}
      {!isEmailVerified && !isCodeSent && (
        <button
          type="button"
          onClick={sendVerificationCode}
          disabled={!isEmailValid || isCodeSending}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="space-y-4 bg-wash p-4 rounded-md border border-line">
          <div className="text-center">
            <p className="text-sm text-muted">
              인증 코드를 이메일로 전송했습니다.
            </p>
            <p className="text-sm text-muted">
              (유효시간:{" "}
              <span
                className={`font-mono font-semibold ${
                  timeRemaining < 60 ? "text-danger" : "text-accent"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
              )
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-2 text-center">
              인증 코드 <span className="text-danger">*</span>
            </label>
            <CodeInput
              code={verificationCode}
              onChange={setVerificationCode}
              disabled={isTimerExpired || isCodeVerifying}
            />
            {codeError && (
              <p className="mt-2 text-sm text-danger text-center">{codeError}</p>
            )}
          </div>

          <button
            type="button"
            onClick={verifyCode}
            disabled={!isCodeComplete || isTimerExpired || isCodeVerifying}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="text-faint ml-1">({resendCooldown}초)</span>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
