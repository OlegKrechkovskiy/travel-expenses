"use client";

import { useState } from "react";

type ErrorBannerProps = {
  message: string | null | undefined;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  return (
    <p className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 border border-border-error text-sm text-text-error">
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 transition-colors cursor-pointer"
        aria-label="Закрыть"
      >
        ✕
      </button>
    </p>
  );
}