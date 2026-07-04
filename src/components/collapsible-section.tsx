"use client";

import { useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  defaultExpanded?: boolean;
  collapsedHint?: string;
  children: React.ReactNode;
};

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
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

export function CollapsibleSection({
  title,
  defaultExpanded = true,
  collapsedHint,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="w-full">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="mb-3 flex w-full items-center gap-1.5 text-left"
      >
        <Chevron expanded={expanded} />
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {title}
        </span>
        {!expanded && collapsedHint && (
          <span className="truncate text-xs font-medium text-zinc-400">
            · {collapsedHint}
          </span>
        )}
      </button>
      {expanded && children}
    </section>
  );
}
