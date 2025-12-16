"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-3",
};

export default function LoadingSpinner({
  size = "md",
  text,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-mainBlue border-t-transparent rounded-full animate-spin`}
      />
      {text && <span className="text-gray-500">{text}</span>}
    </div>
  );
}
