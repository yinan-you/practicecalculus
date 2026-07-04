"use client";

import { useCallback, useMemo, useState } from "react";
import type { Requirement } from "@/lib/requirements";

type ActiveFilterBannerProps = {
  query: string;
  requirement: Requirement;
  onClear: () => void;
};

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export function ActiveFilterBanner({
  query,
  requirement,
  onClear,
}: ActiveFilterBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const json = useMemo(
    () => JSON.stringify(requirement, null, 2),
    [requirement],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  }, [json]);

  return (
    <div className="w-full rounded-2xl border border-black/[.12] bg-white dark:border-white/[.18] dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-start gap-1.5 text-left"
        >
          <Chevron expanded={expanded} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Custom filter active
            </p>
            <p className="mt-1 break-words text-sm text-zinc-700 dark:text-zinc-300">
              {query}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear custom filter"
          className="shrink-0 rounded-full border border-black/[.12] px-3 py-1 text-sm font-medium text-zinc-600 hover:border-black/[.3] hover:text-black dark:border-white/[.18] dark:text-zinc-300 dark:hover:border-white/[.4] dark:hover:text-zinc-50"
        >
          Clear
        </button>
      </div>

      {expanded && (
        <div className="border-t border-black/[.08] px-4 py-3 dark:border-white/[.12]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Interpreted requirement (dev)
            </p>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="shrink-0 rounded-full border border-black/[.12] px-3 py-1 text-xs font-medium text-zinc-600 hover:border-black/[.3] hover:text-black dark:border-white/[.18] dark:text-zinc-300 dark:hover:border-white/[.4] dark:hover:text-zinc-50"
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-black/[.08] bg-zinc-50 px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words text-zinc-700 dark:border-white/[.12] dark:bg-zinc-900/50 dark:text-zinc-300">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}
