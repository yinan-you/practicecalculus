"use client";

import { useState } from "react";
import { validateRequirement, type Requirement } from "@/lib/requirements";

type CustomFilterInputProps = {
  onApply: (customFilter: { query: string; requirement: Requirement }) => void;
};

const PLACEHOLDER = `{
  "op": "and",
  "children": [
    { "op": "tag", "check": { "dimension": "topic", "value": "differentiation" } },
    { "op": "tag", "check": { "dimension": "method", "value": "chainRule" } }
  ]
}`;

export function CustomFilterInput({ onApply }: CustomFilterInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("Invalid JSON.");
      return;
    }

    try {
      const requirement = validateRequirement(parsed);
      setError(null);
      onApply({ query: text.trim(), requirement });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid requirement.");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Custom filter (requirement JSON)
      </label>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={PLACEHOLDER}
        rows={6}
        spellCheck={false}
        className="w-full rounded-2xl border border-black/[.12] bg-white px-4 py-3 font-mono text-xs text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-black/[.3] dark:border-white/[.18] dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-white/[.4]"
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="button"
        onClick={handleApply}
        disabled={text.trim().length === 0}
        className="rounded-full border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Apply custom filter
      </button>
    </div>
  );
}
