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
  const [rawContent, setRawContent] = useState<string | null>(null);

  const handleSubmit = async () => {
    const utterance = text.trim();
    if (utterance.length === 0 || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setRawContent(null);

    try {
      const response = await fetch("/api/filter-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance }),
      });

      const data = (await response.json()) as {
        requirement?: Requirement;
        error?: string;
        rawContent?: string;
      };

      if (!response.ok || !data.requirement) {
        setError(data.error ?? "Could not build a filter from that request.");
        setRawContent(data.rawContent ?? null);
        return;
      }

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
      {rawContent && (
        <pre className="max-h-48 overflow-auto rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {rawContent}
        </pre>
      )}
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={text.trim().length === 0 || isLoading}
        className="rounded-full border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isLoading ? "Interpreting…" : "Build filter"}
      </button>
    </div>
  );
}
