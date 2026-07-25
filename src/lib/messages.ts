/**
 * 사용자에게 노출되는 문구
 *
 * 백엔드가 내려준 메시지를 그대로 화면에 뿌리지 않고 여기서 통제한다.
 */

import { PASSWORD_MIN_LENGTH } from "./constants";

export const AUTH_MESSAGES = {
  // 로그인 — 미가입과 비밀번호 오류를 구분해 안내한다(백엔드가 404/401로 나눠줘야 동작)
  NOT_REGISTERED: "가입되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요.",
  INVALID_PASSWORD: "비밀번호가 올바르지 않습니다.",
  TOO_MANY_ATTEMPTS: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  SERVER_ERROR: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  NETWORK_ERROR: "네트워크 연결을 확인해 주세요.",
  UNKNOWN: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",

  // 로그인 화면 상단 안내 배너
  REGISTER_SUCCESS: "회원가입이 완료되었습니다. 로그인해 주세요.",
  PASSWORD_RESET_SUCCESS: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.",
} as const;

/** 이메일 인증 코드 전송 / 검증 단계의 문구 */
export const VERIFICATION_MESSAGES = {
  EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  EMAIL_NOT_REGISTERED: "가입되지 않은 이메일입니다.",
  SEND_FAILED: "인증 코드 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  TOO_MANY_REQUESTS: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  INVALID_CODE: "인증 코드가 올바르지 않거나 만료되었습니다.",
  VERIFY_FAILED: "인증에 실패했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

/** 비밀번호 재설정 화면의 문구 */
export const RESET_PASSWORD_MESSAGES = {
  NOT_VERIFIED: "이메일 인증을 완료해주세요.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  PASSWORD_TOO_SHORT: `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
  TOKEN_EXPIRED: "인증이 만료되었습니다. 처음부터 다시 시도해 주세요.",
  FAILED: "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.",
} as const;
