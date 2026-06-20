import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  CORE_DIMENSION_IDS,
  DEFAULT_ORIGIN_TAGS,
  type CourseTag,
  type MethodTag,
  type Question,
  type QuestionBankEntry,
  type SolutionMeta,
  type TagMap,
  type Topic,
} from "@/lib/questions";

const DATA_DIR = path.join(process.cwd(), "data");

/** JSON records may use legacy fields, native tags, or a mix during migration. */
type RawQuestionBankEntry = {
  id: string;
  prompt: string;
  answer: string;
  topic?: Topic;
  courseTags?: CourseTag[];
  methodTags?: MethodTag[];
  tags?: TagMap;
  difficulty?: 1 | 2 | 3;
  source?: string;
};

function normalizeQuestionEntry(raw: RawQuestionBankEntry): QuestionBankEntry {
  const courseTags =
    raw.courseTags ??
    (raw.tags?.[CORE_DIMENSION_IDS.course] as CourseTag[] | undefined) ??
    [];
  const methodTags =
    raw.methodTags ??
    (raw.tags?.[CORE_DIMENSION_IDS.method] as MethodTag[] | undefined) ??
    [];
  const topic =
    raw.topic ??
    (raw.tags?.[CORE_DIMENSION_IDS.topic]?.[0] as Topic | undefined);

  if (!topic) {
    throw new Error(`Question ${raw.id} is missing a topic.`);
  }

  const tags: TagMap = {
    ...(raw.tags ?? {}),
    [CORE_DIMENSION_IDS.course]: [...courseTags],
    [CORE_DIMENSION_IDS.topic]: [topic],
    [CORE_DIMENSION_IDS.method]: [...methodTags],
    [CORE_DIMENSION_IDS.origin]:
      raw.tags?.[CORE_DIMENSION_IDS.origin] ?? [...DEFAULT_ORIGIN_TAGS],
  };

  return {
    id: raw.id,
    prompt: raw.prompt,
    answer: raw.answer,
    difficulty: raw.difficulty,
    source: raw.source,
    topic,
    courseTags: [...courseTags],
    methodTags: [...methodTags],
    tags,
  };
}

function loadQuestionBank(): RawQuestionBankEntry[] {
  const filePath = path.join(DATA_DIR, "questions.json");
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as RawQuestionBankEntry[];
}

function loadSolutions(): Map<string, { body: string; meta: SolutionMeta }> {
  const solutionsDir = path.join(DATA_DIR, "solutions");
  const solutions = new Map<string, { body: string; meta: SolutionMeta }>();

  if (!fs.existsSync(solutionsDir)) {
    return solutions;
  }

  for (const fileName of fs.readdirSync(solutionsDir)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const filePath = path.join(solutionsDir, fileName);
    const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
    const questionId = data.questionId as string | undefined;

    if (!questionId) {
      console.warn(`Solution file ${fileName} is missing questionId in frontmatter.`);
      continue;
    }

    solutions.set(questionId, {
      body: content.trim(),
      meta: {
        questionId,
        source: data.source ?? "manual",
        exemplar: data.exemplar,
        locked: data.locked,
        templateVersion: data.templateVersion,
      },
    });
  }

  return solutions;
}

export function loadQuestions(): Question[] {
  const bank = loadQuestionBank();
  const solutions = loadSolutions();

  return bank.map((entry) => {
    const normalized = normalizeQuestionEntry(entry);
    const solution = solutions.get(normalized.id);

    return {
      ...normalized,
      solution: solution?.body,
      solutionMeta: solution?.meta,
    };
  });
}
