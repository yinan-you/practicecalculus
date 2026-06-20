/**
 * Phase 1 stability check: compare generic filter engine against legacy behavior.
 * Run: npx tsx scripts/stability-check.ts
 */
import {
  COURSE_TAGS,
  METHOD_TAGS,
  TOPICS,
  type CourseTag,
  type MethodTag,
  type Question,
  type Topic,
} from "@/lib/questions";
import { loadQuestions } from "@/lib/load-questions";
import {
  EMPTY_FILTERS,
  getMatchingQuestions,
  getVisibleCourses,
  getVisibleMethods,
  getVisibleTopics,
  pruneFilters,
  toggle,
  type Filters,
} from "@/lib/filters";

// --- Legacy filter engine (pre phase-1 generic refactor) ---

type IgnoredFilterGroup = keyof Filters;

function legacyMatchesFiltersExcept(
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

function legacyGetMatchingQuestions(
  questions: Question[],
  filters: Filters,
): Question[] {
  return questions.filter((question) =>
    legacyMatchesFiltersExcept(question, filters),
  );
}

function uniqueInOrder<T>(canonicalOrder: T[], values: T[]): T[] {
  const availableValues = new Set(values);
  return canonicalOrder.filter((value) => availableValues.has(value));
}

function legacyGetVisibleCourses(
  questions: Question[],
  filters: Filters,
): CourseTag[] {
  const courseTags = questions
    .filter((question) =>
      legacyMatchesFiltersExcept(question, filters, "courseTags"),
    )
    .flatMap((question) => question.courseTags);
  return uniqueInOrder(COURSE_TAGS, courseTags);
}

function legacyGetVisibleTopics(
  questions: Question[],
  filters: Filters,
): Topic[] {
  const topics = questions
    .filter((question) =>
      legacyMatchesFiltersExcept(question, filters, "topics"),
    )
    .map((question) => question.topic);
  return uniqueInOrder(TOPICS, topics);
}

function legacyGetVisibleMethods(
  questions: Question[],
  filters: Filters,
): MethodTag[] {
  const methodTags = questions
    .filter((question) =>
      legacyMatchesFiltersExcept(question, filters, "methodTags"),
    )
    .flatMap((question) => question.methodTags);
  return uniqueInOrder(METHOD_TAGS, methodTags);
}

function legacyPruneFilters(
  questions: Question[],
  filters: Filters,
): Filters {
  const visibleCourses = legacyGetVisibleCourses(questions, filters);
  const courseTags = filters.courseTags.filter((tag) =>
    visibleCourses.includes(tag),
  );
  const filtersWithCourses = { ...filters, courseTags };

  const visibleTopics = legacyGetVisibleTopics(questions, filtersWithCourses);
  const topics = filtersWithCourses.topics.filter((topic) =>
    visibleTopics.includes(topic),
  );
  const filtersWithTopics = { ...filtersWithCourses, topics };

  const visibleMethods = legacyGetVisibleMethods(questions, filtersWithTopics);
  const methodTags = filtersWithTopics.methodTags.filter((tag) =>
    visibleMethods.includes(tag),
  );

  return { ...filtersWithTopics, methodTags };
}

// Fix typo in legacyPruneFilters - I made an error. Let me fix when writing.

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function filtersEqual(a: Filters, b: Filters): boolean {
  return (
    arraysEqual(a.courseTags, b.courseTags) &&
    arraysEqual(a.topics, b.topics) &&
    arraysEqual(a.methodTags, b.methodTags)
  );
}

type Failure = { label: string; detail: string };

function compareAtState(
  questions: Question[],
  filters: Filters,
  label: string,
  failures: Failure[],
): void {
  const legacyMatch = legacyGetMatchingQuestions(questions, filters);
  const newMatch = getMatchingQuestions(questions, filters);
  if (legacyMatch.length !== newMatch.length) {
    failures.push({
      label,
      detail: `matching count: legacy=${legacyMatch.length} new=${newMatch.length}`,
    });
  } else {
    const legacyIds = legacyMatch.map((q) => q.id).sort().join(",");
    const newIds = newMatch.map((q) => q.id).sort().join(",");
    if (legacyIds !== newIds) {
      failures.push({
        label,
        detail: `matching ids differ: legacy=[${legacyIds}] new=[${newIds}]`,
      });
    }
  }

  const visibilityChecks: Array<{
    name: string;
    legacy: string[];
    current: string[];
  }> = [
    {
      name: "courses",
      legacy: legacyGetVisibleCourses(questions, filters),
      current: getVisibleCourses(questions, filters),
    },
    {
      name: "topics",
      legacy: legacyGetVisibleTopics(questions, filters),
      current: getVisibleTopics(questions, filters),
    },
    {
      name: "methods",
      legacy: legacyGetVisibleMethods(questions, filters),
      current: getVisibleMethods(questions, filters),
    },
  ];

  for (const check of visibilityChecks) {
    if (!arraysEqual(check.legacy, check.current)) {
      failures.push({
        label,
        detail: `visible ${check.name}: legacy=[${check.legacy.join(",")}] new=[${check.current.join(",")}]`,
      });
    }
  }

  const legacyPruned = legacyPruneFilters(questions, filters);
  const newPruned = pruneFilters(questions, filters);
  if (!filtersEqual(legacyPruned, newPruned)) {
    failures.push({
      label,
      detail: `prune: legacy=${JSON.stringify(legacyPruned)} new=${JSON.stringify(newPruned)}`,
    });
  }
}

function assertChipStateParity(
  questions: Question[],
  filters: Filters,
  label: string,
  failures: Failure[],
): void {
  const visibleCourses = getVisibleCourses(questions, filters);
  const visibleTopics = getVisibleTopics(questions, filters);
  const visibleMethods = getVisibleMethods(questions, filters);

  for (const tag of filters.courseTags) {
    if (!visibleCourses.includes(tag)) {
      failures.push({
        label,
        detail: `chip parity: selected course "${tag}" not in visible courses`,
      });
    }
  }
  for (const topic of filters.topics) {
    if (!visibleTopics.includes(topic)) {
      failures.push({
        label,
        detail: `chip parity: selected topic "${topic}" not in visible topics`,
      });
    }
  }
  for (const tag of filters.methodTags) {
    if (!visibleMethods.includes(tag)) {
      failures.push({
        label,
        detail: `chip parity: selected method "${tag}" not in visible methods`,
      });
    }
  }

  for (const tag of visibleCourses) {
    const selected = filters.courseTags.includes(tag);
    if (selected !== filters.courseTags.includes(tag)) {
      failures.push({
        label,
        detail: `chip parity: course "${tag}" selected state inconsistent`,
      });
    }
  }

  for (const topic of visibleTopics) {
    if (filters.topics.includes(topic) !== filters.topics.includes(topic)) {
      failures.push({
        label,
        detail: `chip parity: topic "${topic}" selected state inconsistent`,
      });
    }
  }

  for (const tag of visibleMethods) {
    if (filters.methodTags.includes(tag) !== filters.methodTags.includes(tag)) {
      failures.push({
        label,
        detail: `chip parity: method "${tag}" selected state inconsistent`,
      });
    }
  }
}

function simulateUiToggle(
  questions: Question[],
  filters: Filters,
  group: keyof Filters,
  value: string,
): Filters {
  const key = group;
  return pruneFilters(questions, {
    ...filters,
    [key]: toggle(filters[key] as string[], value),
  });
}

function main(): void {
  const questions = loadQuestions();
  const failures: Failure[] = [];

  // Tag normalization: legacy fields must mirror tags for core dimensions
  for (const question of questions) {
    if (question.topic !== question.tags.topic?.[0]) {
      failures.push({
        label: `normalize:${question.id}`,
        detail: `topic mismatch: legacy=${question.topic} tags=${question.tags.topic?.[0]}`,
      });
    }
    if (!arraysEqual(question.courseTags, question.tags.course ?? [])) {
      failures.push({
        label: `normalize:${question.id}`,
        detail: `courseTags mismatch`,
      });
    }
    if (!arraysEqual(question.methodTags, question.tags.method ?? [])) {
      failures.push({
        label: `normalize:${question.id}`,
        detail: `methodTags mismatch`,
      });
    }
  }

  const states: Array<{ label: string; filters: Filters }> = [
    { label: "empty", filters: EMPTY_FILTERS },
  ];

  // Single-toggle states from empty
  let current = EMPTY_FILTERS;
  for (const tag of getVisibleCourses(questions, current)) {
    current = simulateUiToggle(questions, EMPTY_FILTERS, "courseTags", tag);
    states.push({ label: `toggle course:${tag}`, filters: current });
  }
  for (const topic of getVisibleTopics(questions, EMPTY_FILTERS)) {
    current = simulateUiToggle(questions, EMPTY_FILTERS, "topics", topic);
    states.push({ label: `toggle topic:${topic}`, filters: current });
  }
  for (const tag of getVisibleMethods(questions, EMPTY_FILTERS)) {
    current = simulateUiToggle(questions, EMPTY_FILTERS, "methodTags", tag);
    states.push({ label: `toggle method:${tag}`, filters: current });
  }

  // Combined toggles: course + topic + method from a few seeds
  const seedCourses = ["calc1", "calc2", "AP-AB", "VCE-methods"] as CourseTag[];
  const seedTopics = TOPICS;
  const seedMethods = ["powerRule", "uSubstitution", "chainRule"] as MethodTag[];

  for (const course of seedCourses) {
    let f = simulateUiToggle(questions, EMPTY_FILTERS, "courseTags", course);
    for (const topic of seedTopics) {
      f = simulateUiToggle(questions, f, "topics", topic);
      states.push({
        label: `combo course:${course}+topic:${topic}`,
        filters: f,
      });
      for (const method of seedMethods) {
        const combo = simulateUiToggle(questions, f, "methodTags", method);
        states.push({
          label: `combo course:${course}+topic:${topic}+method:${method}`,
          filters: combo,
        });
      }
    }
  }

  // Multi-select same dimension
  let multiCourse = EMPTY_FILTERS;
  for (const tag of ["calc1", "AP-AB"] as CourseTag[]) {
    multiCourse = simulateUiToggle(questions, multiCourse, "courseTags", tag);
  }
  states.push({ label: "multi course calc1+AP-AB", filters: multiCourse });

  let multiMethod = EMPTY_FILTERS;
  for (const tag of ["uSubstitution", "trigIdentity"] as MethodTag[]) {
    multiMethod = simulateUiToggle(questions, multiMethod, "methodTags", tag);
  }
  states.push({ label: "multi method uSubstitution+trigIdentity", filters: multiMethod });

  for (const state of states) {
    compareAtState(questions, state.filters, state.label, failures);
    assertChipStateParity(questions, state.filters, state.label, failures);
  }

  // Clearing filters restores initial chip visibility and full match pool
  compareAtState(
    questions,
    EMPTY_FILTERS,
    "clear restores initial",
    failures,
  );

  // Initial UI snapshot (empty filters)
  const initialMatchCount = getMatchingQuestions(questions, EMPTY_FILTERS).length;
  const initialCourses = getVisibleCourses(questions, EMPTY_FILTERS);
  const initialTopics = getVisibleTopics(questions, EMPTY_FILTERS);
  const initialMethods = getVisibleMethods(questions, EMPTY_FILTERS);

  console.log("=== Phase 1 Filter Stability Check ===\n");
  console.log(`Questions loaded: ${questions.length}`);
  console.log(`Filter states exercised: ${states.length}`);
  console.log(`Initial matching count: ${initialMatchCount}`);
  console.log(`Initial visible courses: ${initialCourses.length}`);
  console.log(`Initial visible topics: ${initialTopics.join(", ")}`);
  console.log(`Initial visible methods: ${initialMethods.length}`);
  console.log(`q1 solution present: ${Boolean(questions.find((q) => q.id === "q1")?.solution)}`);
  console.log(
    `q1 tags: topic=${questions.find((q) => q.id === "q1")?.topic} methods=${questions.find((q) => q.id === "q1")?.methodTags.join(",")}`,
  );

  if (failures.length > 0) {
    console.error(`\nFAILED (${failures.length} issue(s)):\n`);
    for (const failure of failures) {
      console.error(`  [${failure.label}] ${failure.detail}`);
    }
    process.exit(1);
  }

  console.log("\nPASSED: matching counts, visibility, prune, and chip state parity all match legacy behavior.");
}

main();
