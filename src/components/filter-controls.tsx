import {
  COURSE_TAGS,
  METHOD_TAGS,
  QUESTION_KINDS,
  type CourseTag,
  type MethodTag,
  type QuestionKind,
} from "@/lib/questions";

export type Filters = {
  kinds: QuestionKind[];
  courseTags: CourseTag[];
  methodTags: MethodTag[];
};

type FilterControlsProps = {
  filters: Filters;
  onToggleKind: (kind: QuestionKind) => void;
  onToggleCourseTag: (tag: CourseTag) => void;
  onToggleMethodTag: (tag: MethodTag) => void;
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
  onToggleKind,
  onToggleCourseTag,
  onToggleMethodTag,
  onClear,
}: FilterControlsProps) {
  const hasFilters =
    filters.kinds.length > 0 ||
    filters.courseTags.length > 0 ||
    filters.methodTags.length > 0;

  return (
    <div className="w-full space-y-5">
      <FilterGroup title="Type">
        {QUESTION_KINDS.map((kind) => (
          <Chip
            key={kind}
            label={kind}
            selected={filters.kinds.includes(kind)}
            onClick={() => onToggleKind(kind)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Course">
        {COURSE_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            selected={filters.courseTags.includes(tag)}
            onClick={() => onToggleCourseTag(tag)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Method">
        {METHOD_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            selected={filters.methodTags.includes(tag)}
            onClick={() => onToggleMethodTag(tag)}
          />
        ))}
      </FilterGroup>

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
