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

function makeMultipartFixture(): Question {
  return {
    id: "fixture-multipart",
    stem: "Shared stem.",
    parts: [
      {
        id: "a",
        prompt: "Differentiate.",
        answer: "A",
        topic: "differentiation",
        methodTags: ["chainRule"],
      },
      {
        id: "b",
        prompt: "Integrate.",
        answer: "B",
        topic: "integration",
        methodTags: ["productRule"],
      },
    ],
    topic: "differentiation",
    courseTags: ["HSC-yr12", "HSC-ext1"],
    methodTags: ["chainRule", "productRule"],
    tags: {
      course: ["HSC-yr12", "HSC-ext1"],
      origin: ["public"],
      topic: ["differentiation", "integration"],
      method: ["chainRule", "productRule"],
    },
    prompt: "Differentiate.",
    answer: "A",
  };
}

function assertMatches(
  questions: Question[],
  filters: Filters,
  expectedIds: string[],
  label: string,
  failures: Failure[],
): void {
  const matches = getMatchingQuestions(questions, filters);
  const ids = matches.map((q) => q.id).sort().join(",");
  const expected = [...expectedIds].sort().join(",");
  if (ids !== expected) {
    failures.push({
      label,
      detail: `expected [${expected}] got [${ids}]`,
    });
  }
}

function runMultipartTests(failures: Failure[]): void {
  const multipart = makeMultipartFixture();
  const pool = [multipart];

  assertMatches(
    pool,
    { topic: ["differentiation"] },
    ["fixture-multipart"],
    "multipart matches topic differentiation",
    failures,
  );
  assertMatches(
    pool,
    { topic: ["integration"] },
    ["fixture-multipart"],
    "multipart matches topic integration",
    failures,
  );
  assertMatches(
    pool,
    { method: ["chainRule", "productRule"] },
    ["fixture-multipart"],
    "multipart matches split methods (union AND)",
    failures,
  );
  assertMatches(
    pool,
    { method: ["chainRule", "powerRule"] },
    [],
    "multipart rejects method not on any part",
    failures,
  );
  assertMatches(
    pool,
    { course: ["HSC-yr12", "HSC-ext1"] },
    ["fixture-multipart"],
    "multipart matches parent course tags",
    failures,
  );
  assertMatches(
    pool,
    { course: ["HSC-yr12", "VCE-methods"] },
    [],
    "multipart rejects incompatible course combo",
    failures,
  );

  const flat = loadQuestions().find((q) => q.id === "q1");
  if (!flat) {
    failures.push({
      label: "flat normalization",
      detail: "q1 not found in bank",
    });
    return;
  }

  if (flat.parts.length !== 1 || flat.parts[0]?.id !== "main") {
    failures.push({
      label: "flat normalization",
      detail: `expected single part id main, got ${JSON.stringify(flat.parts.map((p) => p.id))}`,
    });
  }

  if (flat.tags.topic?.join(",") !== "differentiation") {
    failures.push({
      label: "flat normalization",
      detail: `expected topic differentiation, got ${flat.tags.topic?.join(",")}`,
    });
  }
}

function main(): void {
  const questions = loadQuestions();
  const failures: Failure[] = [];

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

  runMultipartTests(failures);

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
    "\nPASSED: matching counts, visibility, prune, chip state parity, and multipart semantics.",
  );
}

main();
