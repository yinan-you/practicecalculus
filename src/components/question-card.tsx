import type { Question } from "@/lib/questions";

type QuestionCardProps = {
  question: Question;
  isSolutionOpen: boolean;
  onToggleSolution: () => void;
};

export function QuestionCard({
  question,
  isSolutionOpen,
  onToggleSolution,
}: QuestionCardProps) {
  const tags = [
    question.topic,
    ...question.courseTags,
    ...question.methodTags,
  ];

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

      <p className="text-lg leading-8 text-black dark:text-zinc-50">
        {question.prompt}
      </p>

      <div className="mt-6 border-t border-black/[.06] pt-4 dark:border-white/[.1]">
        <button
          type="button"
          onClick={onToggleSolution}
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {isSolutionOpen ? "Hide solution" : "Show solution"}
        </button>

        {isSolutionOpen && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Answer
              </h3>
              <p className="mt-1 text-base text-black dark:text-zinc-50">
                {question.answer}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Solution
              </h3>
              <p className="mt-1 whitespace-pre-line text-base leading-7 text-zinc-700 dark:text-zinc-300">
                {question.solution}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
