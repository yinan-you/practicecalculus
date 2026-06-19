import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Question, QuestionBankEntry, SolutionMeta } from "@/lib/questions";

const DATA_DIR = path.join(process.cwd(), "data");

function loadQuestionBank(): QuestionBankEntry[] {
  const filePath = path.join(DATA_DIR, "questions.json");
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as QuestionBankEntry[];
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
    const solution = solutions.get(entry.id);

    return {
      ...entry,
      solution: solution?.body,
      solutionMeta: solution?.meta,
    };
  });
}
