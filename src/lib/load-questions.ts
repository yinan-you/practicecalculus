import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  DEFAULT_ORIGIN_TAGS,
  METHOD_TAGS,
  TOPICS,
  type CourseTag,
  type MethodTag,
  type Question,
  type QuestionBankEntry,
  type QuestionPart,
  type QuestionPartTags,
  type SolutionMeta,
  type TagMap,
  type Topic,
} from "@/lib/questions";

const DATA_DIR = path.join(process.cwd(), "data");

type RawQuestionPart = {
  id: string;
  prompt: string;
  answer: string;
  tags: QuestionPartTags;
};

type RawQuestionBankEntry = {
  id: string;
  stem?: string;
  prompt?: string;
  answer?: string;
  parts?: RawQuestionPart[];
  tags: TagMap;
  difficulty?: 1 | 2 | 3;
  source?: string;
};

function uniqueInOrder<T>(canonicalOrder: T[], values: T[]): T[] {
  const available = new Set(values);
  return canonicalOrder.filter((value) => available.has(value));
}

function buildEffectiveTags(parentTags: TagMap, parts: QuestionPart[]): TagMap {
  const topics = uniqueInOrder(
    TOPICS,
    parts.map((part) => part.topic),
  );
  const methods = uniqueInOrder(
    METHOD_TAGS,
    parts.flatMap((part) => part.methodTags),
  );

  const tags: TagMap = {
    ...parentTags,
    topic: topics,
    method: methods,
  };

  if (methods.length === 0) {
    delete tags.method;
  }

  return tags;
}

function normalizeFlatEntry(raw: RawQuestionBankEntry): QuestionBankEntry {
  if (!raw.prompt || !raw.answer) {
    throw new Error(
      `Question ${raw.id}: flat entries require both prompt and answer.`,
    );
  }

  const topic = raw.tags.topic?.[0] as Topic | undefined;
  if (!topic) {
    throw new Error(`Question ${raw.id} is missing tags.topic.`);
  }

  const parentTags: TagMap = {
    ...raw.tags,
    origin: raw.tags.origin ?? [...DEFAULT_ORIGIN_TAGS],
  };

  const methodTags = [...((parentTags.method ?? []) as MethodTag[])];
  const parts: QuestionPart[] = [
    {
      id: "main",
      prompt: raw.prompt,
      answer: raw.answer,
      topic,
      methodTags,
    },
  ];

  const tags = buildEffectiveTags(parentTags, parts);

  return {
    id: raw.id,
    parts,
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

function normalizeMultipartEntry(raw: RawQuestionBankEntry): QuestionBankEntry {
  if (!raw.parts || raw.parts.length === 0) {
    throw new Error(
      `Question ${raw.id}: multipart entries require at least one part.`,
    );
  }

  if (raw.tags.topic?.length) {
    throw new Error(
      `Question ${raw.id}: multipart parent tags must not include topic.`,
    );
  }

  if (raw.tags.method?.length) {
    throw new Error(
      `Question ${raw.id}: multipart parent tags must not include method.`,
    );
  }

  const seenPartIds = new Set<string>();
  const parts: QuestionPart[] = raw.parts.map((part) => {
    if (seenPartIds.has(part.id)) {
      throw new Error(
        `Question ${raw.id}: duplicate part id "${part.id}".`,
      );
    }
    seenPartIds.add(part.id);

    const topic = part.tags.topic?.[0] as Topic | undefined;
    if (!topic || part.tags.topic.length !== 1) {
      throw new Error(
        `Question ${raw.id} part "${part.id}": tags.topic must contain exactly one value.`,
      );
    }

    return {
      id: part.id,
      prompt: part.prompt,
      answer: part.answer,
      topic,
      methodTags: [...(part.tags.method ?? [])],
    };
  });

  const parentTags: TagMap = {
    ...raw.tags,
    origin: raw.tags.origin ?? [...DEFAULT_ORIGIN_TAGS],
  };
  delete parentTags.topic;
  delete parentTags.method;

  const tags = buildEffectiveTags(parentTags, parts);
  const firstPart = parts[0];

  return {
    id: raw.id,
    stem: raw.stem,
    parts,
    prompt: firstPart.prompt,
    answer: firstPart.answer,
    difficulty: raw.difficulty,
    source: raw.source,
    topic: firstPart.topic,
    courseTags: [...((tags.course ?? []) as CourseTag[])],
    methodTags: [...((tags.method ?? []) as MethodTag[])],
    tags,
  };
}

function normalizeQuestionEntry(raw: RawQuestionBankEntry): QuestionBankEntry {
  const hasFlatContent = Boolean(raw.prompt && raw.answer);
  const hasParts = Boolean(raw.parts && raw.parts.length > 0);

  if (hasFlatContent && hasParts) {
    throw new Error(
      `Question ${raw.id}: provide either (prompt + answer) or parts, not both.`,
    );
  }

  if (!hasFlatContent && !hasParts) {
    throw new Error(
      `Question ${raw.id}: must provide either (prompt + answer) or parts.`,
    );
  }

  return hasParts
    ? normalizeMultipartEntry(raw)
    : normalizeFlatEntry(raw);
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
