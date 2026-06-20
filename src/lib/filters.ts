import {
  FILTER_DIMENSIONS,
  FILTER_DIMENSION_REGISTRY,
  type CoreDimensionId,
  type Question,
} from "@/lib/questions";

/** Selected values per dimension, keyed by dimension id. */
export type Filters = Partial<Record<CoreDimensionId, string[]>>;

export const EMPTY_FILTERS: Filters = {};

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function getSelected(filters: Filters, dimensionId: CoreDimensionId): string[] {
  return filters[dimensionId] ?? [];
}

function dimensionMatches(
  question: Question,
  dimensionId: CoreDimensionId,
  selected: string[],
): boolean {
  if (selected.length === 0) {
    return true;
  }

  const questionTags = question.tags[dimensionId] ?? [];
  const mode = FILTER_DIMENSION_REGISTRY[dimensionId].matchMode;

  return mode === "all"
    ? selected.every((tag) => questionTags.includes(tag))
    : selected.some((tag) => questionTags.includes(tag));
}

function matchesFiltersExcept(
  question: Question,
  filters: Filters,
  ignoredDimensionId?: CoreDimensionId,
): boolean {
  for (const dimension of FILTER_DIMENSIONS) {
    const dimensionId = dimension.id as CoreDimensionId;
    if (dimensionId === ignoredDimensionId) {
      continue;
    }

    const selected = getSelected(filters, dimensionId);
    if (!dimensionMatches(question, dimensionId, selected)) {
      return false;
    }
  }

  return true;
}

export function matchesFilters(question: Question, filters: Filters): boolean {
  return matchesFiltersExcept(question, filters);
}

export function getMatchingQuestions(
  questions: Question[],
  filters: Filters,
): Question[] {
  return questions.filter((question) => matchesFilters(question, filters));
}

function uniqueInOrder<T>(canonicalOrder: T[], values: T[]): T[] {
  const availableValues = new Set(values);
  return canonicalOrder.filter((value) => availableValues.has(value));
}

/** Values that still yield matches for a dimension, given the other filters. */
export function getVisibleValues(
  questions: Question[],
  filters: Filters,
  dimensionId: CoreDimensionId,
): string[] {
  const dimension = FILTER_DIMENSION_REGISTRY[dimensionId];
  const values = questions
    .filter((question) => matchesFiltersExcept(question, filters, dimensionId))
    .flatMap((question) => question.tags[dimensionId] ?? []);

  return uniqueInOrder(dimension?.order ?? [], values);
}

/** Visible values for every registered dimension. */
export function getVisibleValuesByDimension(
  questions: Question[],
  filters: Filters,
): Partial<Record<CoreDimensionId, string[]>> {
  const result: Partial<Record<CoreDimensionId, string[]>> = {};
  for (const dimension of FILTER_DIMENSIONS) {
    const dimensionId = dimension.id as CoreDimensionId;
    result[dimensionId] = getVisibleValues(questions, filters, dimensionId);
  }
  return result;
}

/** Toggle a value within a dimension, then drop any now-invisible selections. */
export function toggleFilter(
  questions: Question[],
  filters: Filters,
  dimensionId: CoreDimensionId,
  value: string,
): Filters {
  return pruneFilters(questions, {
    ...filters,
    [dimensionId]: toggle(getSelected(filters, dimensionId), value),
  });
}

export function pruneFilters(questions: Question[], filters: Filters): Filters {
  let result: Filters = { ...filters };

  for (const dimension of FILTER_DIMENSIONS) {
    const dimensionId = dimension.id as CoreDimensionId;
    const selected = result[dimensionId];
    if (!selected || selected.length === 0) {
      continue;
    }

    const visible = getVisibleValues(questions, result, dimensionId);
    result = {
      ...result,
      [dimensionId]: selected.filter((value) => visible.includes(value)),
    };
  }

  return result;
}
