import type { Question } from "@/lib/questions";

export function pickNextQuestion(
  matchingQuestions: Question[],
  currentQuestion: Question | null,
): Question | null {
  if (matchingQuestions.length === 0) {
    return null;
  }

  const pool =
    matchingQuestions.length > 1 && currentQuestion
      ? matchingQuestions.filter((q) => q.id !== currentQuestion.id)
      : matchingQuestions;

  return pool[Math.floor(Math.random() * pool.length)];
}
