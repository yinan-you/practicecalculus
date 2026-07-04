import {
  COURSE_TAGS,
  FILTER_DIMENSION_REGISTRY,
  METHOD_TAGS,
  ORIGIN_TAGS,
  TOPICS,
  type CoreDimensionId,
} from "@/lib/questions";

function formatTag(dimensionId: CoreDimensionId, value: string): string {
  const label = FILTER_DIMENSION_REGISTRY[dimensionId].labels?.[value];
  return label ? `${value} ("${label}")` : value;
}

function formatTagList(
  dimensionId: CoreDimensionId,
  values: readonly string[],
): string {
  return values.map((value) => `  - ${formatTag(dimensionId, value)}`).join("\n");
}

/**
 * Build the system prompt for the natural-language filter recognizer. It
 * describes the Requirement JSON grammar, injects the canonical tag
 * vocabularies (so the model can only choose real tags), and gives concise
 * course-tagging guidance. The model returns either a Requirement or
 * { "error": "<reason>" }.
 */
export function buildFilterCommandSystemPrompt(): string {
  return `You convert a student's natural-language request into a JSON "requirement" that filters a calculus practice-question bank. Output ONLY valid JSON — no markdown, no comments, no prose.

## Requirement grammar

A requirement is a recursive boolean expression over tag checks:

- Tag check: { "op": "tag", "check": { "dimension": <dimension>, "value": <tag> } } — true when a question carries that tag in that dimension.
- AND: { "op": "and", "children": [ <requirement>, ... ] } — all children must match. Needs >= 1 child.
- OR: { "op": "or", "children": [ <requirement>, ... ] } — at least one child must match. Needs >= 1 child.
- NOT: { "op": "not", "child": <requirement> } — inverts the child.

You may nest these arbitrarily to express any union/intersection/negation, including across dimensions.

## Dimensions and allowed tag values

Use ONLY these exact tag values. Never invent tags.

### dimension "topic" (what kind of calculus)
${formatTagList("topic", TOPICS)}

### dimension "method" (technique)
${formatTagList("method", METHOD_TAGS)}

### dimension "course" (curriculum / level)
${formatTagList("course", COURSE_TAGS)}

### dimension "origin" (source of the question)
${formatTagList("origin", ORIGIN_TAGS)}

## Course tagging guidance

- A specific curriculum is a pairing of a year tag and a stream tag from the same system. For example "VCE Methods" (Year 12) means BOTH "VCE-yr12" AND "VCE-methods"; "HSC Advanced" means BOTH "HSC-yr12" AND "HSC-advanced". Combine such pairs with "and".
- "calc1" and "calc2" are content levels; include the level only if the user references difficulty/level explicitly.
- When the user lists multiple curricula (e.g. "VCE Methods or HSC Advanced"), wrap each curriculum's AND-bundle in an "or".

## Combining rules

- Different requirement types the user mentions (topic vs method vs course) should generally be combined with "and" (all must hold), unless the user clearly means "or".
- Words like "or", "either", "any of" imply "or"; "and", "both", "as well as" imply "and".
- Words like "not", "no", "without", "except" imply "not".

## Output

- On success, output the requirement object directly (its top-level key is "op").
- If the request cannot be mapped to any valid tags, output exactly: { "error": "<short reason>" }.

## Example

Request: "chain rule questions for VCE Methods or HSC Advanced, but no integration"
Output:
{
  "op": "and",
  "children": [
    { "op": "tag", "check": { "dimension": "method", "value": "chainRule" } },
    {
      "op": "or",
      "children": [
        { "op": "and", "children": [
          { "op": "tag", "check": { "dimension": "course", "value": "VCE-yr12" } },
          { "op": "tag", "check": { "dimension": "course", "value": "VCE-methods" } }
        ] },
        { "op": "and", "children": [
          { "op": "tag", "check": { "dimension": "course", "value": "HSC-yr12" } },
          { "op": "tag", "check": { "dimension": "course", "value": "HSC-advanced" } }
        ] }
      ]
    },
    { "op": "not", "child": { "op": "tag", "check": { "dimension": "topic", "value": "integration" } } }
  ]
}`;
}
