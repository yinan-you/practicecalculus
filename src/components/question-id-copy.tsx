"use client";

import { useCallback, useState } from "react";

type QuestionIdCopyProps = {
  questionId: string;
};

export function QuestionIdCopy({ questionId }: QuestionIdCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(questionId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — tooltip still shows the id on hover.
    }
  }, [questionId]);

  return (
    <div className="group/id relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy question ID ${questionId}`}
        className="rounded-md p-1.5 text-zinc-400 opacity-40 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.59-7.59a1 1 0 0 0 0-1.41L12 2Z" />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <span
        role="status"
        className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md border border-black/[.08] bg-white px-2 py-1 font-mono text-xs text-zinc-600 opacity-0 shadow-sm transition-opacity group-hover/id:opacity-100 group-focus-within/id:opacity-100 dark:border-white/[.12] dark:bg-zinc-900 dark:text-zinc-300"
      >
        {copied ? "Copied!" : questionId}
      </span>
    </div>
  );
}
