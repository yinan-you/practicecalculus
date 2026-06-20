"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type CourseTag,
  type MethodTag,
  type OriginTag,
  type Question,
  type Topic,
} from "@/lib/questions";
import {
  EMPTY_FILTERS,
  getMatchingQuestions,
  getVisibleCourses,
  getVisibleMethods,
  getVisibleOrigins,
  getVisibleTopics,
  pruneFilters,
  toggle,
  type Filters,
} from "@/lib/filters";
import { pickNextQuestion } from "@/lib/session";
import { FilterControls } from "@/components/filter-controls";
import { QuestionCard } from "@/components/question-card";

type PracticeSessionProps = {
  questions: Question[];
};

export function PracticeSession({ questions }: PracticeSessionProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  const visibleOrigins = useMemo(
    () => getVisibleOrigins(questions, filters),
    [questions, filters],
  );

  const visibleCourses = useMemo(
    () => getVisibleCourses(questions, filters),
    [questions, filters],
  );

  const visibleTopics = useMemo(
    () => getVisibleTopics(questions, filters),
    [questions, filters],
  );

  const visibleMethods = useMemo(
    () => getVisibleMethods(questions, filters),
    [questions, filters],
  );

  const matchingQuestions = useMemo(
    () => getMatchingQuestions(questions, filters),
    [questions, filters],
  );

  const generateNextQuestion = useCallback(() => {
    const next = pickNextQuestion(matchingQuestions, currentQuestion);
    setCurrentQuestion(next);
    setIsSolutionOpen(false);
  }, [matchingQuestions, currentQuestion]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") {
        return;
      }
      const target = event.target as HTMLElement | null;
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

  const handleToggleOrigin = (tag: OriginTag) =>
    setFilters((prev) =>
      pruneFilters(questions, {
        ...prev,
        originTags: toggle(prev.originTags, tag),
      }),
    );

  const handleToggleCourse = (tag: CourseTag) =>
    setFilters((prev) =>
      pruneFilters(questions, {
        ...prev,
        courseTags: toggle(prev.courseTags, tag),
      }),
    );

  const handleToggleTopic = (topic: Topic) =>
    setFilters((prev) =>
      pruneFilters(questions, {
        ...prev,
        topics: toggle(prev.topics, topic),
      }),
    );

  const handleToggleMethod = (tag: MethodTag) =>
    setFilters((prev) =>
      pruneFilters(questions, {
        ...prev,
        methodTags: toggle(prev.methodTags, tag),
      }),
    );

  const handleClear = () => setFilters(EMPTY_FILTERS);

  const hasNoMatches = matchingQuestions.length === 0;

  return (
    <div className="w-full space-y-8">
      <FilterControls
        filters={filters}
        visibleOrigins={visibleOrigins}
        visibleCourses={visibleCourses}
        visibleTopics={visibleTopics}
        visibleMethods={visibleMethods}
        onToggleOrigin={handleToggleOrigin}
        onToggleCourse={handleToggleCourse}
        onToggleTopic={handleToggleTopic}
        onToggleMethod={handleToggleMethod}
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
