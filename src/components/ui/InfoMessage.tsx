"use client";

interface InfoMessageProps {
  message: string;
  className?: string;
}

export default function InfoMessage({
  message,
  className = "",
}: InfoMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`bg-accent-soft border border-accent/25 text-accent-deep px-4 py-3 rounded-md text-sm ${className}`}
    >
      {message}
    </div>
  );
}
