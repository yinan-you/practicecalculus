import { COURSE_TAGS, type CourseTag, type MethodTag, type Topic } from "@/lib/questions";
import type { Filters } from "@/lib/filters";

type FilterControlsProps = {
  filters: Filters;
  visibleTopics: Topic[];
  visibleMethods: MethodTag[];
  onToggleCourse: (tag: CourseTag) => void;
  onToggleTopic: (topic: Topic) => void;
  onToggleMethod: (tag: MethodTag) => void;
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
  visibleTopics,
  visibleMethods,
  onToggleCourse,
  onToggleTopic,
  onToggleMethod,
  onClear,
}: FilterControlsProps) {
  const hasFilters =
    filters.courseTags.length > 0 ||
    filters.topics.length > 0 ||
    filters.methodTags.length > 0;

  return (
    <div className="w-full space-y-5">
      <FilterGroup title="Course">
        {COURSE_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            selected={filters.courseTags.includes(tag)}
            onClick={() => onToggleCourse(tag)}
          />
        ))}
      </FilterGroup>

      {visibleTopics.length > 0 && (
        <FilterGroup title="Topic">
          {visibleTopics.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              selected={filters.topics.includes(topic)}
              onClick={() => onToggleTopic(topic)}
            />
          ))}
        </FilterGroup>
      )}

      {visibleMethods.length > 0 && (
        <FilterGroup title="Method">
          {visibleMethods.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={filters.methodTags.includes(tag)}
              onClick={() => onToggleMethod(tag)}
            />
          ))}
        </FilterGroup>
      )}

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
