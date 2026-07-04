import {
  COURSE_TAGS,
  CORE_DIMENSION_IDS,
  FILTER_DIMENSIONS,
  FILTER_DIMENSION_REGISTRY,
  METHOD_TAGS,
  ORIGIN_TAGS,
  TOPICS,
  type CoreDimensionId,
  type Question,
} from "@/lib/questions";
import type { Filters } from "@/lib/filters";

/** A single atomic condition: does the question carry this tag in this dimension? */
export type TagCheck = {
  dimension: CoreDimensionId;
  value: string;
};

/**
 * Arbitrary boolean combination over atomic tag checks. This is the fully
 * flexible requirement spec: any union/intersection/negation, cross-dimension.
 */
export type Requirement =
  | { op: "tag"; check: TagCheck }
  | { op: "and"; children: Requirement[] }
  | { op: "or"; children: Requirement[] }
  | { op: "not"; child: Requirement };

/** Canonical tag vocabularies per dimension, used for grounding validation. */
const VALID_TAGS: Record<CoreDimensionId, readonly string[]> = {
  [CORE_DIMENSION_IDS.origin]: ORIGIN_TAGS,
  [CORE_DIMENSION_IDS.course]: COURSE_TAGS,
  [CORE_DIMENSION_IDS.topic]: TOPICS,
  [CORE_DIMENSION_IDS.method]: METHOD_TAGS,
};

function hasTag(question: Question, { dimension, value }: TagCheck): boolean {
  return (question.tags[dimension] ?? []).includes(value);
}

/** Deterministically evaluate a requirement against a single question. */
export function evaluateRequirement(
  requirement: Requirement,
  question: Question,
): boolean {
  switch (requirement.op) {
    case "tag":
      return hasTag(question, requirement.check);
    case "and":
      return requirement.children.every((child) =>
        evaluateRequirement(child, question),
      );
    case "or":
      return requirement.children.some((child) =>
        evaluateRequirement(child, question),
      );
    case "not":
      return !evaluateRequirement(requirement.child, question);
  }
}

/**
 * Filter questions by a requirement. A `null` requirement matches everything
 * (no constraint), mirroring an empty filter set.
 */
export function getMatchingByRequirement(
  questions: Question[],
  requirement: Requirement | null,
): Question[] {
  if (!requirement) {
    return questions;
  }
  return questions.filter((question) =>
    evaluateRequirement(requirement, question),
  );
}

function isCoreDimensionId(value: unknown): value is CoreDimensionId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(VALID_TAGS, value)
  );
}

/**
 * Validate and normalize an untrusted requirement (e.g. hand-written JSON or a
 * future LLM response). Throws on unknown ops, malformed structure, or tags
 * outside the canonical vocabularies. Returns a clean `Requirement` on success.
 */
export function validateRequirement(node: unknown): Requirement {
  if (!node || typeof node !== "object") {
    throw new Error("Requirement must be an object.");
  }

  const candidate = node as Record<string, unknown>;

  switch (candidate.op) {
    case "tag": {
      const check = candidate.check as Record<string, unknown> | undefined;
      if (!check || typeof check !== "object") {
        throw new Error('A "tag" requirement needs a "check" object.');
      }
      if (!isCoreDimensionId(check.dimension)) {
        throw new Error(`Unknown dimension: ${String(check.dimension)}`);
      }
      if (typeof check.value !== "string") {
        throw new Error('Tag check "value" must be a string.');
      }
      if (!VALID_TAGS[check.dimension].includes(check.value)) {
        throw new Error(
          `Unknown tag "${check.value}" for dimension "${check.dimension}".`,
        );
      }
      return {
        op: "tag",
        check: { dimension: check.dimension, value: check.value },
      };
    }
    case "and":
    case "or": {
      if (!Array.isArray(candidate.children)) {
        throw new Error(`A "${candidate.op}" requirement needs a children array.`);
      }
      if (candidate.children.length === 0) {
        throw new Error(`A "${candidate.op}" requirement needs at least one child.`);
      }
      return {
        op: candidate.op,
        children: candidate.children.map(validateRequirement),
      };
    }
    case "not": {
      if (!("child" in candidate)) {
        throw new Error('A "not" requirement needs a "child".');
      }
      return { op: "not", child: validateRequirement(candidate.child) };
    }
    default:
      throw new Error(`Unknown requirement op: ${String(candidate.op)}`);
  }
}

/**
 * Compile flat chip filters into the equivalent restricted requirement:
 * each dimension's selected values are combined by its configured matchMode
 * ("all" -> AND, "any" -> OR), and dimensions are AND-ed together. Returns
 * `null` when no dimension has any selection (match everything).
 */
export function compileFiltersToRequirement(filters: Filters): Requirement | null {
  const children: Requirement[] = [];

  for (const dimension of FILTER_DIMENSIONS) {
    const dimensionId = dimension.id as CoreDimensionId;
    const selected = filters[dimensionId] ?? [];
    if (selected.length === 0) {
      continue;
    }

    const checks: Requirement[] = selected.map((value) => ({
      op: "tag" as const,
      check: { dimension: dimensionId, value },
    }));

    const mode = FILTER_DIMENSION_REGISTRY[dimensionId].matchMode;
    const combined: Requirement =
      mode === "all"
        ? { op: "and", children: checks }
        : { op: "or", children: checks };

    children.push(combined);
  }

  if (children.length === 0) {
    return null;
  }

  return { op: "and", children };
}
