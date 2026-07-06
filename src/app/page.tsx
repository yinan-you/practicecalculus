import { PracticeSession } from "@/components/practice-session";
import { SiteFooter } from "@/components/site-footer";
import { loadQuestions } from "@/lib/load-questions";

export default function Home() {
  const questions = loadQuestions();

  return (
    <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-zinc-50 via-zinc-50 to-zinc-100/70 font-sans dark:from-zinc-950 dark:via-zinc-950 dark:to-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-14 sm:px-10 sm:py-20">
        <header className="space-y-3">
          <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
            Practice Calculus
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            What would you like to practice today?
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Filter by topic, course, or technique — or describe what you want in
            plain English.
          </p>
        </header>

        <PracticeSession questions={questions} />
      </main>

      <SiteFooter />
    </div>
  );
}
