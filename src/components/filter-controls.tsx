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

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
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
          <FilterGroup key={dimensionId} title={dimension.label}>
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
