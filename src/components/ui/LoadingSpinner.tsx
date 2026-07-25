"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  /** 어두운/컬러 배경 위에서는 white 사용 */
  tone?: "accent" | "white";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-3",
};

const toneClasses = {
  accent: "border-accent",
  white: "border-white",
};

export default function LoadingSpinner({
  size = "md",
  tone = "accent",
  text,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${toneClasses[tone]} border-t-transparent rounded-full animate-spin`}
      />
      {text && <span className="text-sm text-muted">{text}</span>}
    </div>
  );
}
