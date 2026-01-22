import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";

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
}

const INITIAL_TIME = 10 * 60; // 10분
const RESEND_COOLDOWN = 60; // 60초

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEmailVerification() {
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
      await api.sendVerificationCode({ email: state.email });

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
      const message =
        error instanceof Error
          ? error.message
          : "인증 코드 전송에 실패했습니다. 다시 시도해주세요";
      setState((prev) => ({
        ...prev,
        isCodeSending: false,
        emailError: message,
      }));
    }
  }, [state.email, state.isEmailValid]);

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
      await api.verifyCode({ email: state.email, code });

      // 타이머 정리
      if (timerRef.current) clearInterval(timerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);

      setState((prev) => ({
        ...prev,
        isCodeVerifying: false,
        isEmailVerified: true,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "인증 코드가 일치하지 않습니다";
      setState((prev) => ({
        ...prev,
        isCodeVerifying: false,
        codeError: message,
      }));
    }
  }, [state.email, state.verificationCode]);

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
