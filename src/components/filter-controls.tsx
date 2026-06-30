"use client";

import { useState } from "react";
import { FILTER_DIMENSIONS, type CoreDimensionId } from "@/lib/questions";
import type { Filters } from "@/lib/filters";

type FilterControlsProps = {
  filters: Filters;
  visibleValues: Partial<Record<CoreDimensionId, string[]>>;
  onToggle: (dimensionId: CoreDimensionId, value: string) => void;
  onClear: () => void;
};

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? "rounded-full border border-black bg-black px-3 py-1.5 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-black"
          : "rounded-full border border-black/[.12] bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-black/[.3] dark:border-white/[.18] dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-white/[.4]"
      }
    >
      {label}
    </button>
  );
}

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

function FilterGroup({
  title,
  selectedCount,
  children,
}: {
  title: string;
  selectedCount: number;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="mb-2 flex w-full items-center gap-1.5 text-left"
      >
        <Chevron expanded={expanded} />
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {title}
        </span>
        {!expanded && selectedCount > 0 && (
          <span className="text-xs font-medium text-zinc-400">
            · {selectedCount} selected
          </span>
        )}
      </button>
      {expanded && <div className="flex flex-wrap gap-2 pl-5">{children}</div>}
    </div>
  );
}

export function FilterControls({
  filters,
  visibleValues,
  onToggle,
  onClear,
}: FilterControlsProps) {
  const hasFilters = Object.values(filters).some(
    (values) => values && values.length > 0,
  );

  return (
    <div className="w-full space-y-5">
      {FILTER_DIMENSIONS.map((dimension) => {
        const dimensionId = dimension.id as CoreDimensionId;
        const visible = visibleValues[dimensionId] ?? [];
        if (visible.length === 0) {
          return null;
        }

        const selected = filters[dimensionId] ?? [];

        return (
          <FilterGroup
            key={dimensionId}
            title={dimension.label}
            selectedCount={selected.length}
          >
            {visible.map((value) => (
              <Chip
                key={value}
                label={dimension.labels?.[value] ?? value}
                selected={selected.includes(value)}
                onClick={() => onToggle(dimensionId, value)}
              />
            ))}
          </FilterGroup>
        );
      })}

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-black hover:underline dark:hover:text-zinc-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
