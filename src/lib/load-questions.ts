import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
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

type RawQuestionBankEntry = {
  id: string;
  prompt: string;
  answer: string;
  tags: TagMap;
  difficulty?: 1 | 2 | 3;
  source?: string;
};

function normalizeQuestionEntry(raw: RawQuestionBankEntry): QuestionBankEntry {
  const topic = raw.tags.topic?.[0] as Topic | undefined;
  if (!topic) {
    throw new Error(`Question ${raw.id} is missing tags.topic.`);
  }

  const tags: TagMap = {
    ...raw.tags,
    origin: raw.tags.origin ?? [...DEFAULT_ORIGIN_TAGS],
  };

  return {
    id: raw.id,
    prompt: raw.prompt,
    answer: raw.answer,
    difficulty: raw.difficulty,
    source: raw.source,
    topic,
    courseTags: [...((tags.course ?? []) as CourseTag[])],
    methodTags: [...((tags.method ?? []) as MethodTag[])],
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
