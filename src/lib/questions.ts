export type Topic = "differentiation" | "integration";

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

export type SolutionSource = "manual" | "ai";

export type SolutionMeta = {
  questionId: string;
  source: SolutionSource;
  exemplar?: boolean;
  locked?: boolean;
  templateVersion?: number;
};

/** Imported question record — no solution body. See data/questions.json. */
export type QuestionBankEntry = {
  id: string;
  topic: Topic;
  courseTags: CourseTag[];
  methodTags: MethodTag[];
  prompt: string;
  answer: string;
  difficulty?: 1 | 2 | 3;
  source?: string;
};

/** Runtime question after merging bank + solution overlay. */
export type Question = QuestionBankEntry & {
  solution?: string;
  solutionMeta?: SolutionMeta;
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

export const TOPICS: Topic[] = ["differentiation", "integration"];
