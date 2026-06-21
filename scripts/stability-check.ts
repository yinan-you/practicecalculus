/**
 * Filter stability check: compare the generic filter engine against an
 * independent, hardcoded reference implementation.
 * Run: npx tsx scripts/stability-check.ts
 */
import {
  COURSE_TAGS,
  METHOD_TAGS,
  ORIGIN_TAGS,
  TOPICS,
  WORKSHEET_TAGS,
  type CoreDimensionId,
  type Question,
} from "@/lib/questions";
import { loadQuestions } from "@/lib/load-questions";
import {
  EMPTY_FILTERS,
  getMatchingQuestions,
  getVisibleValues,
  pruneFilters,
  toggleFilter,
  type Filters,
} from "@/lib/filters";

// --- Reference filter engine (independent, hardcoded per dimension) ---

const DIMENSION_IDS: CoreDimensionId[] = [
  "origin",
  "course",
  "topic",
  "method",
  "worksheet",
];

function sel(filters: Filters, dimensionId: CoreDimensionId): string[] {
  return filters[dimensionId] ?? [];
}

function tagsOf(question: Question, dimensionId: CoreDimensionId): string[] {
  return question.tags[dimensionId] ?? [];
}

function legacyMatchesFiltersExcept(
  question: Question,
  filters: Filters,
  ignored?: CoreDimensionId,
): boolean {
  if (
    ignored !== "origin" &&
    sel(filters, "origin").length > 0 &&
    !sel(filters, "origin").some((tag) => tagsOf(question, "origin").includes(tag))
  ) {
    return false;
  }
  if (
    ignored !== "topic" &&
    sel(filters, "topic").length > 0 &&
    !sel(filters, "topic").some((tag) => tagsOf(question, "topic").includes(tag))
  ) {
    return false;
  }
  if (
    ignored !== "course" &&
    sel(filters, "course").length > 0 &&
    !sel(filters, "course").every((tag) => tagsOf(question, "course").includes(tag))
  ) {
    return false;
  }
  if (
    ignored !== "method" &&
    sel(filters, "method").length > 0 &&
    !sel(filters, "method").every((tag) => tagsOf(question, "method").includes(tag))
  ) {
    return false;
  }
  if (
    ignored !== "worksheet" &&
    sel(filters, "worksheet").length > 0 &&
    !sel(filters, "worksheet").every((tag) =>
      tagsOf(question, "worksheet").includes(tag),
    )
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

const CANONICAL_ORDER: Record<CoreDimensionId, string[]> = {
  origin: ORIGIN_TAGS,
  course: COURSE_TAGS,
  topic: TOPICS,
  method: METHOD_TAGS,
  worksheet: WORKSHEET_TAGS,
};

function legacyGetVisibleValues(
  questions: Question[],
  filters: Filters,
  dimensionId: CoreDimensionId,
): string[] {
  const values = questions
    .filter((question) =>
      legacyMatchesFiltersExcept(question, filters, dimensionId),
    )
    .flatMap((question) => tagsOf(question, dimensionId));
  return uniqueInOrder(CANONICAL_ORDER[dimensionId], values);
}

function legacyPruneFilters(questions: Question[], filters: Filters): Filters {
  let result: Filters = { ...filters };
  for (const dimensionId of DIMENSION_IDS) {
    const selected = result[dimensionId];
    if (!selected || selected.length === 0) {
      continue;
    }
    const visible = legacyGetVisibleValues(questions, result, dimensionId);
    result = {
      ...result,
      [dimensionId]: selected.filter((value) => visible.includes(value)),
    };
  }
  return result;
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function filtersEqual(a: Filters, b: Filters): boolean {
  return DIMENSION_IDS.every((dimensionId) =>
    arraysEqual(sel(a, dimensionId), sel(b, dimensionId)),
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

  for (const dimensionId of DIMENSION_IDS) {
    const legacy = legacyGetVisibleValues(questions, filters, dimensionId);
    const current = getVisibleValues(questions, filters, dimensionId);
    if (!arraysEqual(legacy, current)) {
      failures.push({
        label,
        detail: `visible ${dimensionId}: legacy=[${legacy.join(",")}] new=[${current.join(",")}]`,
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
  for (const dimensionId of DIMENSION_IDS) {
    const visible = getVisibleValues(questions, filters, dimensionId);
    for (const tag of sel(filters, dimensionId)) {
      if (!visible.includes(tag)) {
        failures.push({
          label,
          detail: `chip parity: selected ${dimensionId} "${tag}" not in visible values`,
        });
      }
    }
  }
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

  // Single-toggle states from empty, for every dimension
  for (const dimensionId of DIMENSION_IDS) {
    for (const value of getVisibleValues(questions, EMPTY_FILTERS, dimensionId)) {
      const filters = toggleFilter(
        questions,
        EMPTY_FILTERS,
        dimensionId,
        value,
      );
      states.push({ label: `toggle ${dimensionId}:${value}`, filters });
    }
  }

  // Combined toggles: course + topic + method from a few seeds
  const seedCourses = ["calc1", "calc2", "AP-AB", "VCE-methods"];
  const seedMethods = ["powerRule", "uSubstitution", "chainRule"];

  for (const course of seedCourses) {
    let f = toggleFilter(questions, EMPTY_FILTERS, "course", course);
    for (const topic of TOPICS) {
      f = toggleFilter(questions, f, "topic", topic);
      states.push({ label: `combo course:${course}+topic:${topic}`, filters: f });
      for (const method of seedMethods) {
        const combo = toggleFilter(questions, f, "method", method);
        states.push({
          label: `combo course:${course}+topic:${topic}+method:${method}`,
          filters: combo,
        });
      }
    }
  }

  // Multi-select within a single dimension
  let multiCourse: Filters = EMPTY_FILTERS;
  for (const tag of ["calc1", "AP-AB"]) {
    multiCourse = toggleFilter(questions, multiCourse, "course", tag);
  }
  states.push({ label: "multi course calc1+AP-AB", filters: multiCourse });

  let multiMethod: Filters = EMPTY_FILTERS;
  for (const tag of ["uSubstitution", "trigIdentity"]) {
    multiMethod = toggleFilter(questions, multiMethod, "method", tag);
  }
  states.push({
    label: "multi method uSubstitution+trigIdentity",
    filters: multiMethod,
  });

  // Origin combined with other dimensions
  const userOnly = toggleFilter(questions, EMPTY_FILTERS, "origin", "user");
  states.push({ label: "origin user only", filters: userOnly });
  const publicOnly = toggleFilter(questions, EMPTY_FILTERS, "origin", "public");
  states.push({ label: "origin public only", filters: publicOnly });

  for (const state of states) {
    compareAtState(questions, state.filters, state.label, failures);
    assertChipStateParity(questions, state.filters, state.label, failures);
  }

  // Clearing filters restores initial chip visibility and full match pool
  compareAtState(questions, EMPTY_FILTERS, "clear restores initial", failures);

  // Initial UI snapshot (empty filters)
  const initialMatchCount = getMatchingQuestions(questions, EMPTY_FILTERS).length;

  console.log("=== Filter Stability Check ===\n");
  console.log(`Questions loaded: ${questions.length}`);
  console.log(`Filter states exercised: ${states.length}`);
  console.log(`Initial matching count: ${initialMatchCount}`);
  for (const dimensionId of DIMENSION_IDS) {
    const visible = getVisibleValues(questions, EMPTY_FILTERS, dimensionId);
    console.log(`Initial visible ${dimensionId} (${visible.length}): ${visible.join(", ")}`);
  }

  if (failures.length > 0) {
    console.error(`\nFAILED (${failures.length} issue(s)):\n`);
    for (const failure of failures) {
      console.error(`  [${failure.label}] ${failure.detail}`);
    }
    process.exit(1);
  }

  console.log(
    "\nPASSED: matching counts, visibility, prune, and chip state parity all match the reference implementation.",
  );
}

main();
