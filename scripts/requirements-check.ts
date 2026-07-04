/**
 * Requirement engine check: verify evaluateRequirement handles arbitrary
 * nested AND/OR/NOT combinations, that validateRequirement grounds tags, and
 * that compileFiltersToRequirement reproduces chip semantics.
 * Run: npx tsx scripts/requirements-check.ts
 */
import type { Question, TagMap } from "@/lib/questions";
import {
  compileFiltersToRequirement,
  evaluateRequirement,
  getMatchingByRequirement,
  validateRequirement,
  type Requirement,
} from "@/lib/requirements";
import { getMatchingQuestions, type Filters } from "@/lib/filters";

function makeQuestion(id: string, tags: TagMap): Question {
  return { id, tags } as Question;
}

const failures: string[] = [];

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures.push(`${label}: expected ${e}, got ${a}`);
  }
}

function expectThrows(label: string, fn: () => unknown) {
  try {
    fn();
    failures.push(`${label}: expected an error but none was thrown`);
  } catch {
    // expected
  }
}

// --- Fixtures ---

const vceMethods = makeQuestion("vce", {
  origin: ["public"],
  course: ["calc1", "VCE-yr12", "VCE-methods"],
  topic: ["differentiation"],
  method: ["chainRule", "trig"],
});

const hscAdvanced = makeQuestion("hsc", {
  origin: ["public"],
  course: ["calc1", "HSC-yr12", "HSC-advanced"],
  topic: ["differentiation"],
  method: ["chainRule"],
});

const hscNoChain = makeQuestion("hsc2", {
  origin: ["public"],
  course: ["calc1", "HSC-yr12", "HSC-advanced"],
  topic: ["integration"],
  method: ["uSubstitution"],
});

const unrelated = makeQuestion("other", {
  origin: ["user"],
  course: ["calc2"],
  topic: ["integration"],
  method: ["integrationByParts"],
});

const all = [vceMethods, hscAdvanced, hscNoChain, unrelated];

// --- Nested (VCE bundle) OR (HSC bundle) AND method:chainRule ---

const nested: Requirement = {
  op: "and",
  children: [
    {
      op: "or",
      children: [
        {
          op: "and",
          children: [
            { op: "tag", check: { dimension: "course", value: "VCE-yr12" } },
            { op: "tag", check: { dimension: "course", value: "VCE-methods" } },
          ],
        },
        {
          op: "and",
          children: [
            { op: "tag", check: { dimension: "course", value: "HSC-yr12" } },
            { op: "tag", check: { dimension: "course", value: "HSC-advanced" } },
          ],
        },
      ],
    },
    { op: "tag", check: { dimension: "method", value: "chainRule" } },
  ],
};

check(
  "nested OR/AND matches vce + hsc(with chainRule) only",
  getMatchingByRequirement(all, nested).map((q) => q.id),
  ["vce", "hsc"],
);

// --- NOT: differentiation questions that are NOT VCE ---

const notVce: Requirement = {
  op: "and",
  children: [
    { op: "tag", check: { dimension: "topic", value: "differentiation" } },
    {
      op: "not",
      child: { op: "tag", check: { dimension: "course", value: "VCE-methods" } },
    },
  ],
};

check(
  "not excludes vce",
  getMatchingByRequirement(all, notVce).map((q) => q.id),
  ["hsc"],
);

// --- OR across dimensions (impossible with flat chips) ---

const crossOr: Requirement = {
  op: "or",
  children: [
    { op: "tag", check: { dimension: "course", value: "VCE-methods" } },
    { op: "tag", check: { dimension: "method", value: "integrationByParts" } },
  ],
};

check(
  "cross-dimension OR matches vce or IBP",
  getMatchingByRequirement(all, crossOr).map((q) => q.id),
  ["vce", "other"],
);

// --- null requirement matches everything ---

check(
  "null requirement matches all",
  getMatchingByRequirement(all, null).length,
  all.length,
);

// --- single tag ---

check(
  "single tag check",
  evaluateRequirement(
    { op: "tag", check: { dimension: "topic", value: "integration" } },
    unrelated,
  ),
  true,
);

// --- Validation: rejects unknown tags/ops, accepts valid ---

expectThrows("reject unknown dimension", () =>
  validateRequirement({ op: "tag", check: { dimension: "bogus", value: "x" } }),
);
expectThrows("reject unknown tag value", () =>
  validateRequirement({
    op: "tag",
    check: { dimension: "course", value: "not-a-course" },
  }),
);
expectThrows("reject unknown op", () =>
  validateRequirement({ op: "xor", children: [] }),
);
expectThrows("reject empty and children", () =>
  validateRequirement({ op: "and", children: [] }),
);

const validated = validateRequirement(nested);
check(
  "validate returns equivalent requirement",
  getMatchingByRequirement(all, validated).map((q) => q.id),
  ["vce", "hsc"],
);

// --- compileFiltersToRequirement parity with chip engine ---

const filterStates: Filters[] = [
  {},
  { course: ["VCE-yr12", "VCE-methods"] },
  { topic: ["differentiation", "integration"] },
  { method: ["chainRule"], topic: ["differentiation"] },
  { origin: ["public"], course: ["calc1"] },
];

for (const [i, filters] of filterStates.entries()) {
  const viaChips = getMatchingQuestions(all, filters)
    .map((q) => q.id)
    .sort();
  const compiled = compileFiltersToRequirement(filters);
  const viaRequirement = getMatchingByRequirement(all, compiled)
    .map((q) => q.id)
    .sort();
  check(`compile parity #${i}`, viaRequirement, viaChips);
}

check(
  "empty filters compile to null",
  compileFiltersToRequirement({}),
  null,
);

// --- Report ---

console.log("=== Requirement Engine Check ===\n");
if (failures.length > 0) {
  console.error(`FAILED (${failures.length} issue(s)):\n`);
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}
console.log(
  "PASSED: nested AND/OR/NOT, cross-dimension OR, validation grounding, and chip compile parity.",
);
