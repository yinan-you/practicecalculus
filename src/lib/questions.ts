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

export type QuestionPart = {
  id: string;
  prompt: string;
  answer: string;
  topic: Topic;
  methodTags: MethodTag[];
};

/** Tags on a single part in the raw bank JSON. */
export type QuestionPartTags = {
  topic: Topic[];
  method?: MethodTag[];
};

/** Normalized question record — no solution body. See data/questions.json. */
export type QuestionBankEntry = {
  id: string;
  stem?: string;
  parts: QuestionPart[];
  topic: Topic;
  courseTags: CourseTag[];
  methodTags: MethodTag[];
  tags: TagMap;
  /** First part prompt (legacy convenience). */
  prompt: string;
  /** First part answer (legacy convenience). */
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

export type OriginTag = "public" | "user";

export const ORIGIN_TAGS: OriginTag[] = ["public", "user"];

export const DEFAULT_ORIGIN_TAGS: OriginTag[] = ["public"];

// --- Generic filter dimensions (phase 1 primitives) ---

export type DimensionId = string;

export type TagMap = Record<DimensionId, string[]>;

export type FilterDimension = {
  id: DimensionId;
  label: string;
  multi: boolean;
  /** How selected values relate to a question's tags: "all" = AND, "any" = OR. */
  matchMode: "all" | "any";
  order?: string[];
  /** Optional per-value display overrides (e.g. "user" → "User-added"). */
  labels?: Record<string, string>;
};

export const CORE_DIMENSION_IDS = {
  origin: "origin",
  course: "course",
  topic: "topic",
  method: "method",
} as const satisfies Record<string, DimensionId>;

export type CoreDimensionId =
  (typeof CORE_DIMENSION_IDS)[keyof typeof CORE_DIMENSION_IDS];

export const FILTER_DIMENSIONS: FilterDimension[] = [
  {
    id: CORE_DIMENSION_IDS.origin,
    label: "Source",
    multi: true,
    matchMode: "any",
    order: ORIGIN_TAGS,
    labels: {
      public: "Public",
      user: "User-added",
    },
  },
  {
    id: CORE_DIMENSION_IDS.course,
    label: "Course",
    multi: true,
    matchMode: "all",
    order: COURSE_TAGS,
  },
  {
    id: CORE_DIMENSION_IDS.topic,
    label: "Topic",
    multi: true,
    matchMode: "any",
    order: TOPICS,
  },
  {
    id: CORE_DIMENSION_IDS.method,
    label: "Method",
    multi: true,
    matchMode: "all",
    order: METHOD_TAGS,
  },
];

export const FILTER_DIMENSION_REGISTRY: Record<CoreDimensionId, FilterDimension> =
  Object.fromEntries(
    FILTER_DIMENSIONS.map((dimension) => [dimension.id, dimension]),
  ) as Record<CoreDimensionId, FilterDimension>;
