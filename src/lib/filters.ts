import {
  COURSE_TAGS,
  METHOD_TAGS,
  TOPICS,
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

type IgnoredFilterGroup = keyof Filters;

function matchesFiltersExcept(
  question: Question,
  filters: Filters,
  ignoredGroup?: IgnoredFilterGroup,
): boolean {
  if (filters.topics.length > 0 && !filters.topics.includes(question.topic)) {
    if (ignoredGroup !== "topics") {
      return false;
    }
  }
  if (
    ignoredGroup !== "courseTags" &&
    filters.courseTags.length > 0 &&
    !filters.courseTags.every((tag) => question.courseTags.includes(tag))
  ) {
    return false;
  }
  if (
    ignoredGroup !== "methodTags" &&
    filters.methodTags.length > 0 &&
    !filters.methodTags.every((tag) => question.methodTags.includes(tag))
  ) {
    return false;
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

export function getVisibleCourses(
  questions: Question[],
  filters: Filters,
): CourseTag[] {
  const courseTags = questions
    .filter((question) => matchesFiltersExcept(question, filters, "courseTags"))
    .flatMap((question) => question.courseTags);

  return uniqueInOrder(COURSE_TAGS, courseTags);
}

export function getVisibleTopics(
  questions: Question[],
  filters: Filters,
): Topic[] {
  const topics = questions
    .filter((question) => matchesFiltersExcept(question, filters, "topics"))
    .map((question) => question.topic);

  return uniqueInOrder(TOPICS, topics);
}

export function getVisibleMethods(
  questions: Question[],
  filters: Filters,
): MethodTag[] {
  const methodTags = questions
    .filter((question) => matchesFiltersExcept(question, filters, "methodTags"))
    .flatMap((question) => question.methodTags);

  return uniqueInOrder(METHOD_TAGS, methodTags);
}

export function pruneFilters(questions: Question[], filters: Filters): Filters {
  const visibleCourses = getVisibleCourses(questions, filters);
  const courseTags = filters.courseTags.filter((tag) =>
    visibleCourses.includes(tag),
  );
  const filtersWithCourses = { ...filters, courseTags };

  const visibleTopics = getVisibleTopics(questions, filtersWithCourses);
  const topics = filters.topics.filter((topic) => visibleTopics.includes(topic));
  const filtersWithTopics = { ...filtersWithCourses, topics };

  const visibleMethods = getVisibleMethods(questions, filtersWithTopics);
  const methodTags = filters.methodTags.filter((tag) =>
    visibleMethods.includes(tag),
  );

  return { ...filtersWithTopics, methodTags };
}
