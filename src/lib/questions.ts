export type Topic = "differentiation" | "integration";

/** Generic content depth — pairs with curriculum-specific tags. */
export type ContentLevelTag = "calc1" | "calc2";

export type AustralianYearTag =
  | "VCE-yr11"
  | "VCE-yr12"
  | "HSC-yr11"
  | "HSC-yr12"
  | "QCE-yr11"
  | "QCE-yr12"
  | "SACE-yr11"
  | "SACE-yr12"
  | "WACE-yr11"
  | "WACE-yr12"
  | "TCE-yr11"
  | "TCE-yr12"
  | "ACT-yr11"
  | "ACT-yr12";

/** Calculus-relevant subject streams. Pair with a year tag from the same state. */
export type AustralianStreamTag =
  | "VCE-methods"
  | "VCE-specialist"
  | "HSC-advanced"
  | "HSC-ext1"
  | "HSC-ext2"
  | "QCE-methods"
  | "QCE-specialist"
  | "SACE-methods"
  | "SACE-specialist"
  | "WACE-methods"
  | "WACE-specialist"
  | "TCE-methods"
  | "TCE-specialised"
  | "ACT-methods"
  | "ACT-specialist";

export type AustralianCourseTag = AustralianYearTag | AustralianStreamTag;

export type IBCourseTag =
  | "IB-AA-SL-yr11"
  | "IB-AA-SL-yr12"
  | "IB-AA-HL-yr11"
  | "IB-AA-HL-yr12"
  | "IB-AI-SL-yr11"
  | "IB-AI-SL-yr12"
  | "IB-AI-HL-yr11"
  | "IB-AI-HL-yr12";

export type USCourseTag = "AP-AB" | "AP-BC";

export type CourseTag =
  | ContentLevelTag
  | AustralianCourseTag
  | IBCourseTag
  | USCourseTag;

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

export const CONTENT_LEVEL_TAGS: ContentLevelTag[] = ["calc1", "calc2"];

export const AUSTRALIAN_YEAR_TAGS: AustralianYearTag[] = [
  "VCE-yr11",
  "VCE-yr12",
  "HSC-yr11",
  "HSC-yr12",
  "QCE-yr11",
  "QCE-yr12",
  "SACE-yr11",
  "SACE-yr12",
  "WACE-yr11",
  "WACE-yr12",
  "TCE-yr11",
  "TCE-yr12",
  "ACT-yr11",
  "ACT-yr12",
];

export const AUSTRALIAN_STREAM_TAGS: AustralianStreamTag[] = [
  "VCE-methods",
  "VCE-specialist",
  "HSC-advanced",
  "HSC-ext1",
  "HSC-ext2",
  "QCE-methods",
  "QCE-specialist",
  "SACE-methods",
  "SACE-specialist",
  "WACE-methods",
  "WACE-specialist",
  "TCE-methods",
  "TCE-specialised",
  "ACT-methods",
  "ACT-specialist",
];

export const AUSTRALIAN_COURSE_TAGS: AustralianCourseTag[] = [
  ...AUSTRALIAN_YEAR_TAGS,
  ...AUSTRALIAN_STREAM_TAGS,
];

export const IB_COURSE_TAGS: IBCourseTag[] = [
  "IB-AA-SL-yr11",
  "IB-AA-SL-yr12",
  "IB-AA-HL-yr11",
  "IB-AA-HL-yr12",
  "IB-AI-SL-yr11",
  "IB-AI-SL-yr12",
  "IB-AI-HL-yr11",
  "IB-AI-HL-yr12",
];

export const US_COURSE_TAGS: USCourseTag[] = ["AP-AB", "AP-BC"];

export const COURSE_TAGS: CourseTag[] = [
  ...CONTENT_LEVEL_TAGS,
  ...AUSTRALIAN_COURSE_TAGS,
  ...IB_COURSE_TAGS,
  ...US_COURSE_TAGS,
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

// --- Generic filter dimensions (phase 1 primitives) ---

export type DimensionId = string;

export type TagMap = Record<DimensionId, string[]>;

export type FilterDimension = {
  id: DimensionId;
  label: string;
  multi: boolean;
  order?: string[];
};

export const CORE_DIMENSION_IDS = {
  course: "course",
  topic: "topic",
  method: "method",
} as const satisfies Record<string, DimensionId>;

export type CoreDimensionId =
  (typeof CORE_DIMENSION_IDS)[keyof typeof CORE_DIMENSION_IDS];

export const FILTER_DIMENSIONS: FilterDimension[] = [
  {
    id: CORE_DIMENSION_IDS.course,
    label: "Course",
    multi: true,
    order: COURSE_TAGS,
  },
  {
    id: CORE_DIMENSION_IDS.topic,
    label: "Topic",
    multi: true,
    order: TOPICS,
  },
  {
    id: CORE_DIMENSION_IDS.method,
    label: "Method",
    multi: true,
    order: METHOD_TAGS,
  },
];

export const FILTER_DIMENSION_REGISTRY: Record<CoreDimensionId, FilterDimension> =
  Object.fromEntries(
    FILTER_DIMENSIONS.map((dimension) => [dimension.id, dimension]),
  ) as Record<CoreDimensionId, FilterDimension>;
