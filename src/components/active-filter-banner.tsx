type ActiveFilterBannerProps = {
  query: string;
  onClear: () => void;
};

export function ActiveFilterBanner({ query, onClear }: ActiveFilterBannerProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-black/[.12] bg-white px-4 py-3 dark:border-white/[.18] dark:bg-zinc-950">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Custom filter active
        </p>
        <p className="mt-1 break-words text-sm text-zinc-700 dark:text-zinc-300">
          {query}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear custom filter"
        className="shrink-0 rounded-full border border-black/[.12] px-3 py-1 text-sm font-medium text-zinc-600 hover:border-black/[.3] hover:text-black dark:border-white/[.18] dark:text-zinc-300 dark:hover:border-white/[.4] dark:hover:text-zinc-50"
      >
        Clear
      </button>
    </div>
  );
}
