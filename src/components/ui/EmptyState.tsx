"use client";

import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mb-4">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-mainBlue hover:underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
