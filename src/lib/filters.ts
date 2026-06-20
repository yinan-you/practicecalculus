import {
  CORE_DIMENSION_IDS,
  FILTER_DIMENSIONS,
  type CoreDimensionId,
  type CourseTag,
  type MethodTag,
  type Question,
  type Topic,
} from "@/lib/questions";

export type Filters = {
  courseTags: CourseTag[];
  topics: Topic[];
  methodTags: MethodTag[];
};

export const EMPTY_FILTERS: Filters = {
  courseTags: [],
  topics: [],
  methodTags: [],
};

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

const LEGACY_FILTER_KEY_BY_DIMENSION: Record<CoreDimensionId, keyof Filters> = {
  [CORE_DIMENSION_IDS.course]: "courseTags",
  [CORE_DIMENSION_IDS.topic]: "topics",
  [CORE_DIMENSION_IDS.method]: "methodTags",
};

/** How selected filter values must relate to a question's tags for that dimension. */
const DIMENSION_MATCH_MODE: Record<CoreDimensionId, "all" | "any"> = {
  [CORE_DIMENSION_IDS.course]: "all",
  [CORE_DIMENSION_IDS.topic]: "any",
  [CORE_DIMENSION_IDS.method]: "all",
};

function getFilterValuesForDimension(
  filters: Filters,
  dimensionId: CoreDimensionId,
): string[] {
  return filters[LEGACY_FILTER_KEY_BY_DIMENSION[dimensionId]] as string[];
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
  const mode = DIMENSION_MATCH_MODE[dimensionId];

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

    const selected = getFilterValuesForDimension(filters, dimensionId);
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

function getVisibleValuesForDimension(
  questions: Question[],
  filters: Filters,
  dimensionId: CoreDimensionId,
): string[] {
  const dimension = FILTER_DIMENSIONS.find((entry) => entry.id === dimensionId);
  const values = questions
    .filter((question) => matchesFiltersExcept(question, filters, dimensionId))
    .flatMap((question) => question.tags[dimensionId] ?? []);

  return uniqueInOrder(dimension?.order ?? [], values);
}

export function getVisibleCourses(
  questions: Question[],
  filters: Filters,
): CourseTag[] {
  return getVisibleValuesForDimension(
    questions,
    filters,
    CORE_DIMENSION_IDS.course,
  ) as CourseTag[];
}

export function getVisibleTopics(
  questions: Question[],
  filters: Filters,
): Topic[] {
  return getVisibleValuesForDimension(
    questions,
    filters,
    CORE_DIMENSION_IDS.topic,
  ) as Topic[];
}

export function getVisibleMethods(
  questions: Question[],
  filters: Filters,
): MethodTag[] {
  return getVisibleValuesForDimension(
    questions,
    filters,
    CORE_DIMENSION_IDS.method,
  ) as MethodTag[];
}

export function pruneFilters(questions: Question[], filters: Filters): Filters {
  let result: Filters = { ...filters };

  for (const dimension of FILTER_DIMENSIONS) {
    const dimensionId = dimension.id as CoreDimensionId;
    const key = LEGACY_FILTER_KEY_BY_DIMENSION[dimensionId];
    const visible = getVisibleValuesForDimension(questions, result, dimensionId);

    result = {
      ...result,
      [key]: (result[key] as string[]).filter((value) => visible.includes(value)),
    };
  }

  return result;
}
