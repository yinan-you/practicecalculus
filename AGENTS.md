# Agent context

**Primary audience:** agents and contributors who need fast, accurate context before editing code or data.

Stack: **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **KaTeX** (via `remark-math` / `rehype-katex`), **OpenAI** (natural-language filter recognition).

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint
npx tsx scripts/stability-check.ts     # chip filter engine regression check
npx tsx scripts/requirements-check.ts  # flexible requirement engine check
npx tsx scripts/prompt-check.ts        # LLM prompt covers all tags/dimensions
```

**Env:** the natural-language filter needs `OPENAI_API_KEY` (optional `OPENAI_MODEL`, default `gpt-4o-mini`) in `.env.local` (gitignored). The app runs without it; only the chatbox path returns a config error.

---

## Architecture (high level)

```
data/questions.json          ─┐
data/solutions/*.md          ─┼─► loadQuestions() ─► Question[] ─► PracticeSession
data/course-tags.md (docs)   ─┘         ▲
                                        │
                              src/lib/questions.ts    (types, tag vocab, filter dimensions)
                              src/lib/filters.ts      (chip filter state + visibility)
                              src/lib/requirements.ts (flexible AND/OR/NOT match engine)
                              src/lib/session.ts      (random question pick)
```

**Two matching paths, one evaluator.** All matching goes through `evaluateRequirement` in `src/lib/requirements.ts`:

- **Chip path (default):** `Filters` (flat per-dimension selections) → `compileFiltersToRequirement` → `Requirement` → evaluate. Preserves the fixed per-dimension match modes.
- **Custom path (LLM):** natural language → `/api/filter-command` → validated `Requirement` (arbitrary union/intersection/negation, cross-dimension) → evaluate.

**Runtime flow**

1. `src/app/page.tsx` calls `loadQuestions()` at build/render time.
2. `PracticeSession` holds `filters` (chips) and `customFilter` (`{ query, requirement } | null`). When `customFilter` is set it drives the pool; otherwise chip filters do. Any chip toggle clears `customFilter` (revert to chip mode).
3. Filter chips show only **values that still have matches** (`getVisibleValues`) — empty tags never appear. Chip visibility/pruning stays flat and chip-only (not affected by the custom path).
4. User presses Enter or clicks **Start practice** / **Next question** → `pickNextQuestion` picks randomly from the matching pool.

**Not yet implemented (planned direction)**

- User-imported questions stored client-side (merged at runtime with public bank).
- Curator import pipeline (LLM + schema → validated JSON → git).
- User preferences (default courses, collapsed curricula, saved filter presets).
- Custom-filter UX polish (the chatbox + dev requirement preview exist; no persistence or multi-turn memory yet).

---

## Directory map

| Path | Purpose |
| --- | --- |
| `data/questions.json` | Question bank: flat or multipart entries, tags, optional difficulty/source |
| `data/solutions/` | Optional markdown solutions keyed by `questionId` in frontmatter |
| `data/course-tags.md` | Human guide for **course** tagging (curricula, examples) |
| `src/lib/questions.ts` | Types, tag enums, `FILTER_DIMENSIONS` registry |
| `src/lib/load-questions.ts` | Reads JSON + solution markdown, normalizes to `Question` |
| `src/lib/filters.ts` | Chip filter state, visibility/pruning; `getMatchingQuestions` compiles to a requirement |
| `src/lib/requirements.ts` | Flexible `Requirement` model, `evaluateRequirement`, `validateRequirement`, `compileFiltersToRequirement` |
| `src/lib/ai/filter-command-prompt.ts` | Builds the LLM system prompt from tag registries |
| `src/lib/session.ts` | Question selection logic |
| `src/app/api/filter-command/route.ts` | POST route: NL utterance → OpenAI → validated `Requirement` |
| `src/components/practice-session.tsx` | Main client UI: chip + custom filters, question loop |
| `src/components/filter-controls.tsx` | Renders filter chip groups per dimension |
| `src/components/custom-filter-chat.tsx` | NL chatbox → `/api/filter-command`; dev requirement preview |
| `src/components/active-filter-banner.tsx` | Banner shown when a custom filter is active |
| `src/components/question-card.tsx` | Stem, parts, answer, solution display |
| `src/components/markdown-math.tsx` | Markdown + LaTeX rendering |
| `scripts/stability-check.ts` | Compares chip filter engine vs hardcoded reference impl |
| `scripts/requirements-check.ts` | Verifies the flexible engine, validation, and chip-compile parity |
| `scripts/prompt-check.ts` | Verifies the LLM prompt covers every dimension and tag |

---

## Data model

### Question bank entry (`data/questions.json`)

Each entry is either **flat** (single part) or **multipart** (shared stem + labeled parts). Provide one shape, not both.

**Flat (single-part):**

```json
{
  "id": "q1",
  "prompt": "Differentiate $f(x) = x^3$ using the power rule.",
  "answer": "$f'(x) = 3x^2$",
  "difficulty": 1,
  "source": "optional provenance string",
  "tags": {
    "topic": ["differentiation"],
    "course": ["calc1", "AP-AB", "VCE-yr11", "VCE-methods"],
    "method": ["powerRule"],
    "origin": ["public"],
  }
}
```

**Multipart:**

```json
{
  "id": "q14",
  "stem": "Let $f(x) = x^2 e^x$.",
  "parts": [
    {
      "id": "a",
      "prompt": "Find $f'(x)$.",
      "answer": "$f'(x) = e^x(x^2 + 2x)$",
      "tags": { "topic": ["differentiation"], "method": ["productRule"] }
    },
    {
      "id": "b",
      "prompt": "Hence evaluate $\\int_0^1 f'(x)\\,dx$.",
      "answer": "$e$",
      "tags": { "topic": ["integration"], "method": ["uSubstitution"] }
    }
  ],
  "tags": {
    "course": ["calc2", "HSC-yr12", "HSC-ext1"],
    "origin": ["public"]
  }
}
```

**Validation (loader throws on violation):**

- Flat: requires `prompt`, `answer`, and `tags.topic` (exactly one topic).
- Multipart: requires `parts` (length ≥ 1); parent `tags` must **not** include `topic` or `method`.
- Each part: `tags.topic` with exactly one value; part `id` values unique within the question.
- Mutually exclusive: do not provide both `(prompt + answer)` and `parts`.

**Tag ownership:**

| Dimension | Flat entry | Multipart parent | Multipart part |
| --- | --- | --- | --- |
| `course`, `origin` | on entry | on parent | — |
| `topic`, `method` | on entry | — | on each part |

**Filter semantics for multipart:** at load time, part `topic` and `method` tags are merged into effective `question.tags` (union). A question matches topic filters if **any** part's topic is selected. Method filters use **AND** against the union — each selected method must appear on at least one part. One random pick = the whole item (stem + all parts).

**Defaults applied at load time:** if `tags.origin` is missing, it becomes `["public"]`. Flat entries normalize to a single implicit part `{ id: "main", ... }`.

**Images:** not supported in v1 (text + LaTeX only).

### Runtime `Question` type

After loading, entries become `Question` (`src/lib/questions.ts`):

- Always has `parts: QuestionPart[]` (min length 1).
- Optional `stem` for shared context (multipart).
- `tags` holds **effective merged tags** used by the filter engine.
- Denormalized fields: `topic`, `courseTags`, `methodTags`, `prompt`, `answer` (legacy convenience from first part).
- Optional `solution` (markdown body) and `solutionMeta` (from solution frontmatter).

Bank records intentionally **do not** embed solution bodies — solutions live in `data/solutions/`.

### Solution files (`data/solutions/*.md`)

Gray-matter frontmatter + markdown body:

```yaml
---
questionId: q1
source: manual          # "manual" | "ai"
exemplar: true          # optional
locked: true            # optional
templateVersion: 1      # optional
---
```

Body uses standard markdown headings (`## Approach`, `## Steps`, `## Answer`) and `$...$` / `$$...$$` LaTeX. For multipart questions, use per-part headings such as `## Part (a)` and `## Part (b)`.

---

## Tag system

Tags are grouped into **dimensions** (`TagMap = Record<string, string[]>`). Each dimension has filter behavior defined in `FILTER_DIMENSIONS`:

| Dimension | ID | Match mode | Meaning |
| --- | --- | --- | --- |
| Source | `origin` | **any** (OR) | `public` = curated bank; `user` = user-added |
| Course | `course` | **all** (AND) | Curriculum / level tags — see below |
| Topic | `topic` | **any** (OR) | `differentiation` \| `integration` |
| Method | `method` | **all** (AND) | Technique tags (e.g. `chainRule`, `uSubstitution`) |

**Match semantics (chip path):** When a dimension has selected chips, a question must satisfy that dimension's match mode. Across dimensions, requirements are **AND**ed together. These fixed modes apply **only** to the chip path; `compileFiltersToRequirement` encodes them as a restricted `Requirement`.

**Flexible match semantics (custom path):** the LLM/custom path is not bound by the per-dimension modes. A `Requirement` (`src/lib/requirements.ts`) is any nesting of `tag` / `and` / `or` / `not` over tag checks, so it can express arbitrary union/intersection/negation across dimensions (e.g. `(VCE-yr12 AND VCE-methods) OR (HSC-yr12 AND HSC-advanced)`). All input is grounded by `validateRequirement` against the closed vocabularies below.

**Visibility:** A chip appears only if at least one question matches *all other active filters* and carries that tag. Unpopulated tags are auto-hidden — no separate "hide empty courses" config needed. Visibility is a chip-path concern; while a custom filter is active, chips remain fully visible and non-driving.

### Closed vocabularies (defined in `src/lib/questions.ts`)

- **Topics:** `differentiation`, `integration`
- **Methods:** `simple`, `polynomial`, `powerRule`, `exp`, `log`, `trig`, `inverseTrig`, `hyperbolic`, `inverseHyperbolic`, `linearity`, `simpleChainRule`, `chainRule`, `productRule`, `quotientRule`, `simpleUSub`, `uSubstitution`, `integrationByParts`, `partialFractions`, `trigIdentity`, `definiteIntegral`, `indefiniteIntegral`
- **Origin:** `public`, `user`
- **Course tags:** content levels (`calc1`, `calc2`), Australian year/stream tags, IB tags, US AP tags — full lists in `COURSE_TAGS` and documented in `data/course-tags.md`

Adding a **new canonical tag** requires updating `src/lib/questions.ts` (and usually `data/course-tags.md`). The TypeScript unions are intentionally closed for data quality.

### Method tagging conventions

Full tagging guide for importers: `data/import-specv2.md` § Method tagging conventions. Summary:

- **`simple`** — direct recall or a single standard form with no composition or multi-term structure (e.g. $\frac{d}{dx}\ln x$, $\int\sin x\,dx$, $\frac{d}{dx}[x^3]$).
- **`polynomial`** — the whole expression is a polynomial; pair with `powerRule` and usually `linearity` for multi-term polynomials.
- **Family tags** — `powerRule`, `exp`, `log`, `trig`, `inverseTrig`, `hyperbolic`, `inverseHyperbolic`; assign whenever that family appears, even if another technique also applies.
- **`linearity`** — two or more terms handled term-by-term.
- **`simpleChainRule` / `simpleUSub`** — inner function is linear ($g(x)=ax+b$). Often taught without naming substitution (e.g. $\frac{d}{dx}\sin(3x)$, $\int\cos(3x)\,dx$).
- **`chainRule` / `uSubstitution`** — same techniques when the inner function is **not** linear or the substitution is non-obvious.
- **`definiteIntegral` / `indefiniteIntegral`** — tag exactly one on every integration question; do not use on differentiation.

Do not use `simple` when a compound technique applies, and do not use the full-rule tags when the simple variant applies. `simple` and `polynomial` are stored method tags assigned by humans or LLM importers; they are not derived at runtime.

### Course tagging conventions

See `data/course-tags.md` for full rules. Summary:

- Always include a **content level** (`calc1` / `calc2`) when appropriate.
- For Australian questions, pair **year + stream** from the same state (e.g. `VCE-yr12` + `VCE-methods`).
- For public bank questions, **multi-tag generously** across equivalent curricula so students in different systems can find the same question.
- Tag the **highest** stream a question targets (e.g. HSC Ext 2), plus lower streams it also suits.

---

## Key source files

### `src/lib/questions.ts`

Single source of truth for:

- All tag type unions and const arrays (`COURSE_TAGS`, `METHOD_TAGS`, …)
- `Question`, `QuestionBankEntry`, `TagMap`, `FilterDimension`
- `FILTER_DIMENSIONS` — drives both filtering logic and UI chip groups
- `FILTER_DIMENSION_REGISTRY` — lookup by dimension id

When adding a filter dimension, update this file **and** `scripts/stability-check.ts` (reference impl + `DIMENSION_IDS`). New dimensions also flow into the LLM prompt automatically via the tag registries used by `src/lib/ai/filter-command-prompt.ts`.

### `src/lib/load-questions.ts`

- Parses `data/questions.json`
- Merges `data/solutions/*.md` by `questionId`
- Throws if `tags.topic` is missing
- Exported API: `loadQuestions(): Question[]`

### `src/lib/filters.ts`

Chip filter state + visibility. Do **not** hardcode dimension-specific logic here; it reads from `FILTER_DIMENSIONS`. `getMatchingQuestions` now delegates to the requirement engine via `compileFiltersToRequirement` + `getMatchingByRequirement` (behavior identical, guarded by `scripts/stability-check.ts`).

Exports: `Filters`, `matchesFilters`, `getMatchingQuestions`, `getVisibleValues`, `getVisibleValuesByDimension`, `toggleFilter`, `pruneFilters`.

### `src/lib/requirements.ts`

The flexible, deterministic match engine — the single evaluator behind both paths.

- `Requirement` / `TagCheck` types (`tag` / `and` / `or` / `not`).
- `evaluateRequirement(requirement, question)` — pure recursion over `question.tags`.
- `getMatchingByRequirement(questions, requirement)` — `null` requirement matches everything.
- `validateRequirement(unknown)` — grounds untrusted input (LLM/JSON) against the closed vocabularies; throws on unknown ops/dimensions/tags. This is the trust boundary for the LLM path.
- `compileFiltersToRequirement(filters)` — turns flat chip state into the equivalent restricted requirement (per-dimension `matchMode`, dimensions AND-ed).

### `src/lib/ai/filter-command-prompt.ts` and `src/app/api/filter-command/route.ts`

Prompt builder + POST route for the natural-language filter. The route calls OpenAI in JSON mode (`temperature: 0`), then either returns `{ requirement }` (after `validateRequirement`) or `{ error }` with an appropriate status (400 bad input, 422 unmappable/invalid, 500 missing key, 502 upstream). The prompt is assembled from the tag registries so it never drifts from the vocabularies.

### `src/components/practice-session.tsx`

Client component owning `filters` (`useState<Filters>`) and `customFilter` (`{ query, requirement } | null`). Wires the active path → matching pool → question picker. A chip toggle clears `customFilter`; Enter key triggers next question (except when focus is in an input).

---

## Adding or editing questions

1. Add entry to `data/questions.json` with unique `id`, valid tags from closed vocabularies, LaTeX in prompts/answers (flat or multipart shape).
2. Optionally add `data/solutions/{id}.md` with matching `questionId` frontmatter.
3. Run `npx tsx scripts/stability-check.ts` to verify filter behavior.
4. Confirm new course/method chips appear in the UI only when questions carry those tags.

**ID conventions (informal):** `q1`, `q2`, … for public seed data; use `user-…` prefix for future user imports.

**Origin:** Public bank entries should include `"origin": ["public"]`. User-added entries use `"origin": ["user"]` (see `q11` in the bank as an example).

---

## Scripts

### `scripts/stability-check.ts`

Regression test for the filter engine. Exercises many filter states (single toggles, combos, multi-select, origin filters) and compares:

- Matching question sets
- Visible chip values per dimension
- Pruned filter state after toggles

Run after any change to `filters.ts`, `questions.ts` filter config, or question tagging patterns.

### `scripts/requirements-check.ts`

Fixture checks for the flexible engine: nested AND/OR/NOT, cross-dimension OR, `validateRequirement` grounding (rejects unknown tags/ops), and parity between `compileFiltersToRequirement` + `getMatchingByRequirement` and the chip `getMatchingQuestions`. Run after any change to `requirements.ts` or the compile logic.

### `scripts/prompt-check.ts`

Asserts the LLM system prompt from `filter-command-prompt.ts` names every dimension and includes every canonical tag. Run after changing the prompt builder or adding tags/dimensions.

---

## UI conventions

- Tailwind utility classes; dark mode via `dark:` variants.
- Math: inline `$...$`, display `$$...$$` in markdown strings.
- Filter chips: rounded pills; selected = inverted black/white.
- No routing beyond `/` yet — single-page practice session.

---

## Planned work (context for future changes)

These are **directional** — not all built yet. Prefer designs that keep one structured-data contract for both paths.

| Track | Goal |
| --- | --- |
| **Public bank population** | Curator script/API: bulk raw questions + versioned import spec → validated JSON → git |
| **User import** | Same schema; user prompt → hidden formal tagging instructions → structured entries with `origin: user` |
| **User preferences** | "My courses", collapsed curricula, saved filter presets (localStorage first) — UI flexibility without changing public tagging |
| **Validation** | `scripts/validate-questions.ts` against import spec (strict for public, softer for user) |

**Flexibility boundaries (intended):**

- **Keep rigid:** dimension set, canonical tag enums, and the **chip-path** per-dimension match modes.
- **Keep flexible:** which chips a user sees, default filters, import preview edits, and the **custom-path** boolean structure (arbitrary AND/OR/NOT via `Requirement`).
- **Do not** remove broad course tags from public data to "hide" curricula — use user preferences instead.
- **The LLM never filters.** It only recognizes intent and emits a `Requirement`; matching stays fully deterministic in `evaluateRequirement`. `validateRequirement` is the grounding boundary — extend it, not the evaluator, when tightening trust.

---

## Common pitfalls

- **Missing `tags.topic`** — `loadQuestions()` throws at startup.
- **Unknown tag strings** — won't match filters; may never appear as visible chips.
- **Course AND semantics (chip path)** — selecting `VCE-yr12` + `VCE-methods` requires a question to have **both** tags. The custom path can instead OR them if the user asks.
- **Editing filters without updating checks** — if you add/remove dimensions or change match modes, update `scripts/stability-check.ts`; if you touch `requirements.ts` or the compile logic, run `scripts/requirements-check.ts`.
- **Trusting LLM output** — always pass parsed LLM JSON through `validateRequirement`; never feed raw model output to `evaluateRequirement`.
- **Missing `OPENAI_API_KEY`** — the chatbox route returns a 500 config error; the rest of the app is unaffected.
- **Next.js 16 API drift** — don't assume Next 13/14 patterns; check local docs.

---

## Related files

- `data/course-tags.md` — detailed course tagging reference (human + future import spec input)
