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
    <div className="w-full space-y-8">
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

      <CollapsibleSection
        title="Describe what you want to practice"
        defaultExpanded={false}
        collapsedHint={customCollapsedHint}
      >
        <div className="space-y-4 pl-5">
          {customFilter && (
            <ActiveFilterBanner
              query={customFilter.query}
              requirement={customFilter.requirement}
              onClear={handleClearCustomFilter}
            />
          )}
          <CustomFilterChat onApply={handleApplyCustomFilter} />
        </div>
      </CollapsibleSection>

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
          {currentQuestion?.solution ? " · S solution" : ""}
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
