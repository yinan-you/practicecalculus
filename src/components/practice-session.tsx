"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type CourseTag,
  type MethodTag,
  type Question,
  type QuestionKind,
} from "@/lib/questions";
import { FilterControls, type Filters } from "@/components/filter-controls";
import { QuestionCard } from "@/components/question-card";

type PracticeSessionProps = {
  questions: Question[];
};

const EMPTY_FILTERS: Filters = {
  kinds: [],
  courseTags: [],
  methodTags: [],
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function matchesFilters(question: Question, filters: Filters): boolean {
  if (filters.kinds.length > 0 && !filters.kinds.includes(question.kind)) {
    return false;
  }
  if (
    filters.courseTags.length > 0 &&
    !filters.courseTags.every((tag) => question.courseTags.includes(tag))
  ) {
    return false;
  }
  if (
    filters.methodTags.length > 0 &&
    !filters.methodTags.every((tag) => question.methodTags.includes(tag))
  ) {
    return false;
  }
  return true;
}

export function PracticeSession({ questions }: PracticeSessionProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  const matchingQuestions = useMemo(
    () => questions.filter((question) => matchesFilters(question, filters)),
    [questions, filters],
  );

  const generateNextQuestion = useCallback(() => {
    if (matchingQuestions.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    // Avoid immediately repeating the current question when alternatives exist.
    const pool =
      matchingQuestions.length > 1 && currentQuestion
        ? matchingQuestions.filter((q) => q.id !== currentQuestion.id)
        : matchingQuestions;

    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(next);
    setIsSolutionOpen(false);
  }, [matchingQuestions, currentQuestion]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") {
        return;
      }
      const target = event.target as HTMLElement | null;
      // Don't hijack Enter while typing in inputs (future answer box / LLM input).
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      generateNextQuestion();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generateNextQuestion]);

  const handleToggleKind = (kind: QuestionKind) =>
    setFilters((prev) => ({ ...prev, kinds: toggle(prev.kinds, kind) }));
  const handleToggleCourseTag = (tag: CourseTag) =>
    setFilters((prev) => ({
      ...prev,
      courseTags: toggle(prev.courseTags, tag),
    }));
  const handleToggleMethodTag = (tag: MethodTag) =>
    setFilters((prev) => ({
      ...prev,
      methodTags: toggle(prev.methodTags, tag),
    }));
  const handleClear = () => setFilters(EMPTY_FILTERS);

  const hasNoMatches = matchingQuestions.length === 0;

  return (
    <div className="w-full space-y-8">
      <FilterControls
        filters={filters}
        onToggleKind={handleToggleKind}
        onToggleCourseTag={handleToggleCourseTag}
        onToggleMethodTag={handleToggleMethodTag}
        onClear={handleClear}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={generateNextQuestion}
          disabled={hasNoMatches}
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {currentQuestion ? "Next question" : "Start practice"}
        </button>
        <span className="text-sm text-zinc-500">
          {matchingQuestions.length} matching · press Enter
        </span>
      </div>

      {currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          isSolutionOpen={isSolutionOpen}
          onToggleSolution={() => setIsSolutionOpen((open) => !open)}
        />
      ) : (
        <div className="w-full rounded-2xl border border-dashed border-black/[.12] p-10 text-center text-zinc-500 dark:border-white/[.18]">
          {hasNoMatches
            ? "No questions match these filters. Try removing some."
            : "Pick your filters, then press Enter or click Start practice."}
        </div>
      )}
    </div>
  );
}
