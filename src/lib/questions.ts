export type QuestionKind = "differentiation" | "integration";

export type CourseTag = "calc1" | "calc2" | "IB" | "VCE" | "HSC" | "AP";

export type MethodTag =
  | "uSubstitution"
  | "trigIdentity"
  | "chainRule"
  | "productRule"
  | "quotientRule"
  | "integrationByParts"
  | "partialFractions"
  | "powerRule";

export type Question = {
  id: string;
  kind: QuestionKind;
  courseTags: CourseTag[];
  methodTags: MethodTag[];
  prompt: string;
  solution: string;
  answer: string;
  // Reserved for future features (timers, difficulty sorting, sourcing).
  difficulty?: 1 | 2 | 3;
  source?: string;
};

export const COURSE_TAGS: CourseTag[] = [
  "calc1",
  "calc2",
  "IB",
  "VCE",
  "HSC",
  "AP",
];

export const METHOD_TAGS: MethodTag[] = [
  "powerRule",
  "chainRule",
  "productRule",
  "quotientRule",
  "uSubstitution",
  "integrationByParts",
  "partialFractions",
  "trigIdentity",
];

export const QUESTION_KINDS: QuestionKind[] = ["differentiation", "integration"];

export const questions: Question[] = [
  {
    id: "q1",
    kind: "differentiation",
    courseTags: ["calc1", "AP"],
    methodTags: ["powerRule"],
    prompt: "This is a calc1 / AP differentiation question (power rule).",
    solution: "Solution placeholder for q1.",
    answer: "Answer placeholder for q1.",
    difficulty: 1,
  },
  {
    id: "q2",
    kind: "differentiation",
    courseTags: ["calc1", "VCE"],
    methodTags: ["chainRule"],
    prompt: "This is a calc1 / VCE differentiation question (chain rule).",
    solution: "Solution placeholder for q2.",
    answer: "Answer placeholder for q2.",
    difficulty: 2,
  },
  {
    id: "q3",
    kind: "differentiation",
    courseTags: ["calc1", "HSC"],
    methodTags: ["productRule"],
    prompt: "This is a calc1 / HSC differentiation question (product rule).",
    solution: "Solution placeholder for q3.",
    answer: "Answer placeholder for q3.",
    difficulty: 2,
  },
  {
    id: "q4",
    kind: "differentiation",
    courseTags: ["calc1", "IB"],
    methodTags: ["quotientRule"],
    prompt: "This is a calc1 / IB differentiation question (quotient rule).",
    solution: "Solution placeholder for q4.",
    answer: "Answer placeholder for q4.",
    difficulty: 2,
  },
  {
    id: "q5",
    kind: "differentiation",
    courseTags: ["calc2", "AP"],
    methodTags: ["chainRule", "trigIdentity"],
    prompt:
      "This is a calc2 / AP differentiation question (chain rule + trig identity).",
    solution: "Solution placeholder for q5.",
    answer: "Answer placeholder for q5.",
    difficulty: 3,
  },
  {
    id: "q6",
    kind: "integration",
    courseTags: ["calc1", "VCE"],
    methodTags: ["powerRule"],
    prompt: "This is a calc1 / VCE integration question (power rule).",
    solution: "Solution placeholder for q6.",
    answer: "Answer placeholder for q6.",
    difficulty: 1,
  },
  {
    id: "q7",
    kind: "integration",
    courseTags: ["calc2", "AP"],
    methodTags: ["uSubstitution"],
    prompt: "This is a calc2 / AP integration question (u-substitution).",
    solution: "Solution placeholder for q7.",
    answer: "Answer placeholder for q7.",
    difficulty: 2,
  },
  {
    id: "q8",
    kind: "integration",
    courseTags: ["calc2", "IB"],
    methodTags: ["integrationByParts"],
    prompt: "This is a calc2 / IB integration question (integration by parts).",
    solution: "Solution placeholder for q8.",
    answer: "Answer placeholder for q8.",
    difficulty: 3,
  },
  {
    id: "q9",
    kind: "integration",
    courseTags: ["calc2", "HSC"],
    methodTags: ["partialFractions"],
    prompt: "This is a calc2 / HSC integration question (partial fractions).",
    solution: "Solution placeholder for q9.",
    answer: "Answer placeholder for q9.",
    difficulty: 3,
  },
  {
    id: "q10",
    kind: "integration",
    courseTags: ["calc2", "IB", "AP"],
    methodTags: ["uSubstitution", "trigIdentity"],
    prompt:
      "This is a calc2 / IB / AP integration question (u-substitution + trig identity).",
    solution: "Solution placeholder for q10.",
    answer: "Answer placeholder for q10.",
    difficulty: 3,
  },
];
