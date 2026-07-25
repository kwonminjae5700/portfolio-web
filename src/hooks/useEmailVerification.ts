import { useState, useCallback, useEffect, useRef } from "react";
import { api, ApiError, NETWORK_ERROR_STATUS } from "@/lib/api";
import { AUTH_MESSAGES, VERIFICATION_MESSAGES } from "@/lib/messages";
import type { VerificationPurpose } from "@/types/api";

interface EmailVerificationState {
  // 이메일 관련
  email: string;
  isEmailValid: boolean;
  isEmailVerified: boolean;

  // 인증 코드 관련
  verificationCode: string[];
  isCodeSending: boolean;
  isCodeSent: boolean;
  isCodeVerifying: boolean;

  // 타이머 관련
  timeRemaining: number;
  canResend: boolean;
  resendCooldown: number;

  // 에러 관련
  emailError: string | null;
  codeError: string | null;

  // 비밀번호 재설정용 — 인증 성공 시 백엔드가 내려주는 일회용 토큰
  resetToken: string | null;
}

const INITIAL_TIME = 10 * 60; // 10분
const RESEND_COOLDOWN = 60; // 60초

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 코드 전송 실패를 status로 구분한다 — 백엔드 원문은 노출하지 않는다 */
function getSendCodeErrorMessage(
  error: unknown,
  purpose: VerificationPurpose
): string {
  if (!(error instanceof ApiError)) return VERIFICATION_MESSAGES.SEND_FAILED;

  if (error.status === NETWORK_ERROR_STATUS) return AUTH_MESSAGES.NETWORK_ERROR;
  if (error.status === 429) return VERIFICATION_MESSAGES.TOO_MANY_REQUESTS;
  if (error.status >= 500) return AUTH_MESSAGES.SERVER_ERROR;
  // 회원가입은 이미 가입된 이메일이 오류, 재설정은 미가입이 오류 — 정반대다
  if (error.status === 409) return VERIFICATION_MESSAGES.EMAIL_ALREADY_EXISTS;
  if (error.status === 404) return VERIFICATION_MESSAGES.EMAIL_NOT_REGISTERED;
  if (error.status === 400) {
    return purpose === "reset_password"
      ? VERIFICATION_MESSAGES.EMAIL_NOT_REGISTERED
      : VERIFICATION_MESSAGES.SEND_FAILED;
  }

  return VERIFICATION_MESSAGES.SEND_FAILED;
}

/** 코드 검증 실패를 status로 구분한다 */
function getVerifyCodeErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return VERIFICATION_MESSAGES.VERIFY_FAILED;

  if (error.status === NETWORK_ERROR_STATUS) return AUTH_MESSAGES.NETWORK_ERROR;
  if (error.status === 429) return VERIFICATION_MESSAGES.TOO_MANY_REQUESTS;
  if (error.status >= 500) return AUTH_MESSAGES.SERVER_ERROR;
  if (error.status === 400) return VERIFICATION_MESSAGES.INVALID_CODE;

  return VERIFICATION_MESSAGES.VERIFY_FAILED;
}

interface UseEmailVerificationOptions {
  purpose?: VerificationPurpose;
}

export function useEmailVerification({
  purpose = "register",
}: UseEmailVerificationOptions = {}) {
  const [state, setState] = useState<EmailVerificationState>({
    email: "",
    isEmailValid: false,
    isEmailVerified: false,
    verificationCode: ["", "", "", "", "", ""],
    isCodeSending: false,
    isCodeSent: false,
    isCodeVerifying: false,
    timeRemaining: INITIAL_TIME,
    canResend: false,
    resendCooldown: RESEND_COOLDOWN,
    emailError: null,
    codeError: null,
    resetToken: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  // 이메일 변경 핸들러
  const setEmail = useCallback((email: string) => {
    const isValid = EMAIL_REGEX.test(email);
    setState((prev) => ({
      ...prev,
      email,
      isEmailValid: isValid,
      emailError: null,
    }));
  }, []);

  // 인증 코드 전송
  const sendVerificationCode = useCallback(async () => {
    if (!state.isEmailValid) return;

    setState((prev) => ({
      ...prev,
      isCodeSending: true,
      emailError: null,
      codeError: null,
    }));

    try {
      await api.sendVerificationCode({ email: state.email, purpose });

      setState((prev) => ({
        ...prev,
        isCodeSending: false,
        isCodeSent: true,
        timeRemaining: INITIAL_TIME,
        canResend: false,
        resendCooldown: RESEND_COOLDOWN,
        verificationCode: ["", "", "", "", "", ""],
      }));

      // 메인 타이머 시작 (10분)
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);

      // 재전송 쿨다운 타이머 (60초)
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setState((prev) => {
          const newCooldown = prev.resendCooldown - 1;
          if (newCooldown <= 0) {
            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
            return { ...prev, resendCooldown: 0, canResend: true };
          }
          return { ...prev, resendCooldown: newCooldown };
        });
      }, 1000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isCodeSending: false,
        emailError: getSendCodeErrorMessage(error, purpose),
      }));
    }
  }, [state.email, state.isEmailValid, purpose]);

  // 인증 코드 변경 핸들러
  const setVerificationCode = useCallback((code: string[]) => {
    setState((prev) => ({
      ...prev,
      verificationCode: code,
      codeError: null,
    }));
  }, []);

  // 인증 코드 검증
  const verifyCode = useCallback(async () => {
    const code = state.verificationCode.join("");
    if (code.length !== 6) return;

    setState((prev) => ({
      ...prev,
      isCodeVerifying: true,
      codeError: null,
    }));

    try {
      const response = await api.verifyCode({
        email: state.email,
        code,
        purpose,
      });

      // 타이머 정리
      if (timerRef.current) clearInterval(timerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);

      setState((prev) => ({
        ...prev,
        isCodeVerifying: false,
        isEmailVerified: true,
        resetToken: response.reset_token ?? null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isCodeVerifying: false,
        codeError: getVerifyCodeErrorMessage(error),
      }));
    }
  }, [state.email, state.verificationCode, purpose]);

  // 재전송
  const resendCode = useCallback(async () => {
    if (!state.canResend) return;
    await sendVerificationCode();
  }, [state.canResend, sendVerificationCode]);

  // 리셋
  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);

    setState({
      email: "",
      isEmailValid: false,
      isEmailVerified: false,
      verificationCode: ["", "", "", "", "", ""],
      isCodeSending: false,
      isCodeSent: false,
      isCodeVerifying: false,
      timeRemaining: INITIAL_TIME,
      canResend: false,
      resendCooldown: RESEND_COOLDOWN,
      emailError: null,
      codeError: null,
      resetToken: null,
    });
  }, []);

  // 시간 포맷팅 함수
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    ...state,
    setEmail,
    sendVerificationCode,
    setVerificationCode,
    verifyCode,
    resendCode,
    reset,
    formatTime,
  };
}
