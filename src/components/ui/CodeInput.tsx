"use client";

import { useRef } from "react";

interface CodeInputProps {
  code: string[];
  onChange: (code: string[]) => void;
  disabled: boolean;
}

// 6자리 인증 코드 입력 컴포넌트
export default function CodeInput({
  code,
  onChange,
  disabled,
}: CodeInputProps) {
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
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold text-ink border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition disabled:bg-wash disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}
