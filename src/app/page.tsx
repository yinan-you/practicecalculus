import { PracticeSession } from "@/components/practice-session";
import { loadQuestions } from "@/lib/load-questions";

export default function Home() {
  const questions = loadQuestions();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            What would you like to practice today?
          </h1>
        </header>

        <PracticeSession questions={questions} />
      </main>
    </div>
  );
}
