# Agent context

**Primary audience:** agents and contributors who need fast, accurate context before editing code or data.

Stack: **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **KaTeX** (via `remark-math` / `rehype-katex`).

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
npx tsx scripts/stability-check.ts   # filter engine regression check
```

---

## Architecture (high level)

```
data/questions.json          ─┐
data/solutions/*.md          ─┼─► loadQuestions() ─► Question[] ─► PracticeSession
data/course-tags.md (docs)   ─┘         ▲
                                        │
                              src/lib/questions.ts  (types, tag vocab, filter dimensions)
                              src/lib/filters.ts    (generic filter engine)
                              src/lib/session.ts    (random question pick)
```

**Runtime flow**

1. `src/app/page.tsx` calls `loadQuestions()` at build/render time.
2. `PracticeSession` holds filter state and derives matching questions via `getMatchingQuestions`.
3. Filter chips show only **values that still have matches** (`getVisibleValues`) — empty tags never appear in the UI.
4. User presses Enter or clicks **Start practice** / **Next question** → `pickNextQuestion` picks randomly from the matching pool.

**Not yet implemented (planned direction)**

- User-imported questions stored client-side (merged at runtime with public bank).
- Curator import pipeline (LLM + schema → validated JSON → git).
- User preferences (default courses, collapsed curricula, saved filter presets).

---

## Directory map

| Path | Purpose |
| --- | --- |
| `data/questions.json` | Question bank: flat or multipart entries, tags, optional difficulty/source |
| `data/solutions/` | Optional markdown solutions keyed by `questionId` in frontmatter |
| `data/course-tags.md` | Human guide for **course** tagging (curricula, examples) |
| `src/lib/questions.ts` | Types, tag enums, `FILTER_DIMENSIONS` registry |
| `src/lib/load-questions.ts` | Reads JSON + solution markdown, normalizes to `Question` |
| `src/lib/filters.ts` | Generic multi-dimension filter engine |
| `src/lib/session.ts` | Question selection logic |
| `src/components/practice-session.tsx` | Main client UI: filters + question loop |
| `src/components/filter-controls.tsx` | Renders filter chip groups per dimension |
| `src/components/question-card.tsx` | Stem, parts, answer, solution display |
| `src/components/markdown-math.tsx` | Markdown + LaTeX rendering |
| `scripts/stability-check.ts` | Compares filter engine vs hardcoded reference impl |

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

**Match semantics:** When a dimension has selected chips, a question must satisfy that dimension's match mode. Across dimensions, requirements are **AND**ed together.

**Visibility:** A chip appears only if at least one question matches *all other active filters* and carries that tag. Unpopulated tags are auto-hidden — no separate "hide empty courses" config needed.

### Closed vocabularies (defined in `src/lib/questions.ts`)

- **Topics:** `differentiation`, `integration`
- **Methods:** `powerRule`, `simpleChainRule`, `chainRule`, `productRule`, `quotientRule`, `simpleUSub`, `uSubstitution`, `integrationByParts`, `partialFractions`, `trigIdentity`, `other`
- **Origin:** `public`, `user`
- **Course tags:** content levels (`calc1`, `calc2`), Australian year/stream tags, IB tags, US AP tags — full lists in `COURSE_TAGS` and documented in `data/course-tags.md`

Adding a **new canonical tag** requires updating `src/lib/questions.ts` (and usually `data/course-tags.md`). The TypeScript unions are intentionally closed for data quality.

### Method tagging conventions

Full tagging guide for importers: `data/import-specv2.md` § Method tagging conventions. Summary:

- **`simpleChainRule` / `simpleUSub`** — inner function is linear ($g(x)=ax+b$). Often taught without naming substitution (e.g. $\frac{d}{dx}\sin(3x)$, $\int\cos(3x)\,dx$).
- **`chainRule` / `uSubstitution`** — same techniques when the inner function is **not** linear or the substitution is non-obvious.
- **`other`** — standard derivative/antiderivative recall (sin, cos, exp, log, etc.); pair with the appropriate `topic`. Prefer over an empty `method` array.

Do not use the full-rule tags when the simple variant applies.

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

When adding a filter dimension, update this file **and** `scripts/stability-check.ts` (reference impl + `DIMENSION_IDS`).

### `src/lib/load-questions.ts`

- Parses `data/questions.json`
- Merges `data/solutions/*.md` by `questionId`
- Throws if `tags.topic` is missing
- Exported API: `loadQuestions(): Question[]`

### `src/lib/filters.ts`

Generic engine — do **not** hardcode dimension-specific logic here; it reads from `FILTER_DIMENSIONS`.

Exports: `Filters`, `matchesFilters`, `getMatchingQuestions`, `getVisibleValues`, `getVisibleValuesByDimension`, `toggleFilter`, `pruneFilters`.

### `src/components/practice-session.tsx`

Client component owning filter state (`useState<Filters>`). Wires filters → matching pool → question picker. Enter key triggers next question (except when focus is in an input).

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

- **Keep rigid:** dimension set, canonical tag enums, filter match modes.
- **Keep flexible:** which chips a user sees, default filters, import preview edits.
- **Do not** remove broad course tags from public data to "hide" curricula — use user preferences instead.

---

## Common pitfalls

- **Missing `tags.topic`** — `loadQuestions()` throws at startup.
- **Unknown tag strings** — won't match filters; may never appear as visible chips.
- **Course AND semantics** — selecting `VCE-yr12` + `VCE-methods` requires a question to have **both** tags.
- **Editing filters without updating stability check** — if you add/remove dimensions or change match modes, update `scripts/stability-check.ts`.
- **Next.js 16 API drift** — don't assume Next 13/14 patterns; check local docs.

---

## Related files

- `data/course-tags.md` — detailed course tagging reference (human + future import spec input)
