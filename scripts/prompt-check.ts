import { buildFilterCommandSystemPrompt } from "@/lib/ai/filter-command-prompt";
import {
  COURSE_TAGS,
  METHOD_TAGS,
  ORIGIN_TAGS,
  TOPICS,
} from "@/lib/questions";

const prompt = buildFilterCommandSystemPrompt();
const allTags = [...TOPICS, ...METHOD_TAGS, ...COURSE_TAGS, ...ORIGIN_TAGS];
const missing = allTags.filter((tag) => !prompt.includes(tag));

for (const dimension of ["topic", "method", "course", "origin"]) {
  if (!prompt.includes(`dimension "${dimension}"`)) {
    console.error(`FAILED: prompt missing dimension "${dimension}"`);
    process.exit(1);
  }
}

if (missing.length > 0) {
  console.error(`FAILED: prompt missing tags: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(
  `PASSED: prompt covers all 4 dimensions and ${allTags.length} tags (${prompt.length} chars).`,
);
