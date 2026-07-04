"use client";

import { useState } from "react";
import type { Requirement } from "@/lib/requirements";

type CustomFilterChatProps = {
  onApply: (customFilter: { query: string; requirement: Requirement }) => void;
};

export function CustomFilterChat({ onApply }: CustomFilterChatProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Requirement | null>(null);

  const handleSubmit = async () => {
    const utterance = text.trim();
    if (utterance.length === 0 || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/filter-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance }),
      });

      const data = (await response.json()) as {
        requirement?: Requirement;
        error?: string;
      };

      if (!response.ok || !data.requirement) {
        setError(data.error ?? "Could not build a filter from that request.");
        return;
      }

      setPreview(data.requirement);
      onApply({ query: utterance, requirement: data.requirement });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. chain rule for VCE Methods or HSC Advanced, no integration"
        rows={2}
        className="w-full rounded-2xl border border-black/[.12] bg-white px-4 py-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-black/[.3] dark:border-white/[.18] dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-white/[.4]"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={text.trim().length === 0 || isLoading}
        className="rounded-full border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isLoading ? "Interpreting…" : "Build filter"}
      </button>

      {preview && (
        <details className="mt-2 rounded-2xl border border-black/[.08] bg-zinc-50 px-4 py-3 dark:border-white/[.12] dark:bg-zinc-900/50">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Interpreted requirement (dev)
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
