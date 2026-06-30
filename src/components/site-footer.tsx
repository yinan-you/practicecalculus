import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="w-full px-6 py-8 text-center text-sm text-zinc-500">
      <a
        href={SITE.feedbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Feedback
      </a>
    </footer>
  );
}
