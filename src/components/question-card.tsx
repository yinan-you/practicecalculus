import type { Question } from "@/lib/questions";
import { MarkdownMath } from "@/components/markdown-math";

type QuestionCardProps = {
  question: Question;
  isSolutionOpen: boolean;
  onToggleSolution: () => void;
};

const proseBase =
  "prose prose-zinc dark:prose-invert max-w-none prose-p:my-0 prose-headings:mb-2 prose-headings:mt-4 prose-headings:first:mt-0";

function formatPartLabel(partId: string): string {
  return partId === "main" ? "" : `(${partId})`;
}

export function QuestionCard({
  question,
  isSolutionOpen,
  onToggleSolution,
}: QuestionCardProps) {
  const tags = [
    ...(question.tags.topic ?? []),
    ...(question.tags.course ?? []),
    ...(question.tags.method ?? []),
  ];

  const hasSolution = Boolean(question.solution);
  const isMultipart = question.parts.length > 1 || question.parts[0]?.id !== "main";

  return (
    <div className="w-full rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {question.stem && (
        <MarkdownMath className={`${proseBase} text-lg leading-8`}>
          {question.stem}
        </MarkdownMath>
      )}

      <div className={question.stem ? "mt-4 space-y-4" : "space-y-4"}>
        {question.parts.map((part) => {
          const label = formatPartLabel(part.id);
          return (
            <div key={part.id}>
              {isMultipart && label && (
                <p className="mb-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  Part {label}
                </p>
              )}
              <MarkdownMath className={`${proseBase} text-lg leading-8`}>
                {part.prompt}
              </MarkdownMath>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-black/[.06] pt-4 dark:border-white/[.1]">
        <button
          type="button"
          onClick={onToggleSolution}
          disabled={!hasSolution}
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {isSolutionOpen ? "Hide solution" : "Show solution"}
        </button>

        {isSolutionOpen && hasSolution && (
          <div className="mt-4 space-y-4">
            {question.parts.map((part) => {
              const label = formatPartLabel(part.id);
              return (
                <div key={part.id}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {isMultipart && label ? `Answer ${label}` : "Answer"}
                  </h3>
                  <MarkdownMath className={`${proseBase} mt-1 text-base`}>
                    {part.answer}
                  </MarkdownMath>
                </div>
              );
            })}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Solution
              </h3>
              <MarkdownMath
                className={`${proseBase} mt-1 text-base leading-7 text-zinc-700 dark:text-zinc-300`}
              >
                {question.solution!}
              </MarkdownMath>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
