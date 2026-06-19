import {
  METHODS_BY_TOPIC,
  TOPICS_BY_COURSE,
} from "@/lib/filter-config";
import {
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

export function matchesFilters(question: Question, filters: Filters): boolean {
  if (filters.topics.length > 0 && !filters.topics.includes(question.topic)) {
    return false;
  }
  if (
    filters.courseTags.length > 0 &&
    !filters.courseTags.every((tag) => question.courseTags.includes(tag))
  ) {
    return false;
  }
  if (
    filters.methodTags.length > 0 &&
    !filters.methodTags.every((tag) => question.methodTags.includes(tag))
  ) {
    return false;
  }
  return true;
}

export function getMatchingQuestions(
  questions: Question[],
  filters: Filters,
): Question[] {
  return questions.filter((question) => matchesFilters(question, filters));
}

function union<T>(arrays: T[][]): T[] {
  return [...new Set(arrays.flat())];
}

export function getVisibleTopics(selectedCourses: CourseTag[]): Topic[] {
  if (selectedCourses.length === 0) {
    return TOPICS;
  }
  return union(selectedCourses.map((course) => TOPICS_BY_COURSE[course]));
}

function getApplicableTopics(
  selectedCourses: CourseTag[],
  selectedTopics: Topic[],
): Topic[] {
  if (selectedTopics.length > 0) {
    return selectedTopics;
  }
  return getVisibleTopics(selectedCourses);
}

export function getVisibleMethods(
  selectedCourses: CourseTag[],
  selectedTopics: Topic[],
): MethodTag[] {
  const applicableTopics = getApplicableTopics(selectedCourses, selectedTopics);
  return union(applicableTopics.map((topic) => METHODS_BY_TOPIC[topic]));
}

export function pruneFilters(filters: Filters): Filters {
  const visibleTopics = getVisibleTopics(filters.courseTags);
  const topics = filters.topics.filter((topic) => visibleTopics.includes(topic));
  const visibleMethods = getVisibleMethods(filters.courseTags, topics);
  const methodTags = filters.methodTags.filter((tag) =>
    visibleMethods.includes(tag),
  );
  return { ...filters, topics, methodTags };
}
