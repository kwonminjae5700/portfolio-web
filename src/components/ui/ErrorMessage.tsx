"use client";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`bg-danger-soft border border-danger-line text-danger px-4 py-3 rounded-md text-sm ${className}`}
    >
      {message}
    </div>
  );
}
