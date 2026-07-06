"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type CoreDimensionId, type Question } from "@/lib/questions";
import {
  EMPTY_FILTERS,
  getMatchingQuestions,
  getVisibleValuesByDimension,
  toggleFilter,
  type Filters,
} from "@/lib/filters";
import {
  getMatchingByRequirement,
  type Requirement,
} from "@/lib/requirements";
import { pickNextQuestion } from "@/lib/session";
import { FilterControls } from "@/components/filter-controls";
import { QuestionCard } from "@/components/question-card";
import { ActiveFilterBanner } from "@/components/active-filter-banner";
import { CustomFilterChat } from "@/components/custom-filter-chat";
import { CollapsibleSection } from "@/components/collapsible-section";

type CustomFilter = { query: string; requirement: Requirement };

type PracticeSessionProps = {
  questions: Question[];
};

export function PracticeSession({ questions }: PracticeSessionProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [customFilter, setCustomFilter] = useState<CustomFilter | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  const visibleValues = useMemo(
    () => getVisibleValuesByDimension(questions, filters),
    [questions, filters],
  );

  const matchingQuestions = useMemo(
    () =>
      customFilter
        ? getMatchingByRequirement(questions, customFilter.requirement)
        : getMatchingQuestions(questions, filters),
    [questions, filters, customFilter],
  );

  useEffect(() => {
    setCurrentQuestion(null);
    setIsSolutionOpen(false);
  }, [filters, customFilter]);

  const generateNextQuestion = useCallback(() => {
    const next = pickNextQuestion(matchingQuestions, currentQuestion);
    setCurrentQuestion(next);
    setIsSolutionOpen(false);
  }, [matchingQuestions, currentQuestion]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        generateNextQuestion();
        return;
      }

      if (
        event.key.toLowerCase() === "s" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        currentQuestion?.solution
      ) {
        event.preventDefault();
        setIsSolutionOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generateNextQuestion, currentQuestion]);

  const handleToggle = useCallback(
    (dimensionId: CoreDimensionId, value: string) => {
      setCustomFilter(null);
      setFilters((prev) => toggleFilter(questions, prev, dimensionId, value));
    },
    [questions],
  );

  const handleClear = () => {
    setCustomFilter(null);
    setFilters(EMPTY_FILTERS);
  };

  const handleApplyCustomFilter = useCallback((next: CustomFilter) => {
    setCustomFilter(next);
  }, []);

  const handleClearCustomFilter = useCallback(() => {
    setCustomFilter(null);
  }, []);

  const hasNoMatches = matchingQuestions.length === 0;

  const selectedChipCount = useMemo(
    () =>
      Object.values(filters).reduce(
        (count, values) => count + (values?.length ?? 0),
        0,
      ),
    [filters],
  );

  const chipCollapsedHint =
    selectedChipCount > 0
      ? `${selectedChipCount} selected`
      : undefined;

  const customCollapsedHint = customFilter?.query;

  return (
    <div className="flex w-full flex-col gap-10">
      <section className="rounded-2xl border border-black/[.06] bg-white/70 p-5 shadow-sm backdrop-blur-sm sm:p-6 dark:border-white/[.08] dark:bg-zinc-950/70">
        <div className="space-y-6">
          <CollapsibleSection
            title="Filter by tags"
            collapsedHint={chipCollapsedHint}
          >
            <FilterControls
              filters={filters}
              visibleValues={visibleValues}
              onToggle={handleToggle}
              onClear={handleClear}
            />
          </CollapsibleSection>

          <div className="border-t border-black/[.06] dark:border-white/[.08]" />

          <CollapsibleSection
            title="Describe what you want to practice"
            defaultExpanded={false}
            collapsedHint={customCollapsedHint}
          >
            <div className="space-y-4 pl-5">
              <CustomFilterChat onApply={handleApplyCustomFilter} />
              {customFilter && (
                <ActiveFilterBanner
                  query={customFilter.query}
                  requirement={customFilter.requirement}
                  onClear={handleClearCustomFilter}
                />
              )}
            </div>
          </CollapsibleSection>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={generateNextQuestion}
            disabled={hasNoMatches}
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
          >
            {currentQuestion ? "Next question" : "Start practice"}
          </button>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {matchingQuestions.length} matching
            </span>
            <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="kbd-hint">Enter</kbd>
              next question
            </span>
            {currentQuestion?.solution && (
              <>
                <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="kbd-hint">S</kbd>
                  solution
                </span>
              </>
            )}
          </div>
        </div>

        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            isSolutionOpen={isSolutionOpen}
            onToggleSolution={() => setIsSolutionOpen((open) => !open)}
          />
        ) : (
          <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/[.1] bg-white/50 px-6 py-14 text-center dark:border-white/[.14] dark:bg-zinc-950/40">
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {hasNoMatches
                ? "No questions match these filters. Try removing some or broadening your search."
                : "Set your filters above, then press Enter or click Start practice."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
