# Question Bank Import Specification

**specVersion: 1**

This document defines the canonical format for importing questions into `data/questions.json`. It is the source of truth for LLM-assisted question population, curator workflows, and validation scripts.

Phase 1 scope: differentiation and integration **techniques** only. No applications, differential equations, or Maclaurin/Taylor series.

---

## Question shapes

Each entry in `data/questions.json` is **either flat or multipart** — never both.

### Flat question

A single prompt with a single answer. Use for standalone technique questions.

```json
{
  "id": "q1",
  "prompt": "Differentiate $f(x) = x^3$ using the power rule.",
  "answer": "$f'(x) = 3x^2$",
  "difficulty": 1,
  "source": "optional provenance string",
  "tags": {
    "topic": ["differentiation"],
    "course": ["calc1", "VCE-yr11", "VCE-methods", "HSC-yr11", "HSC-advanced", "IB-AA-SL-yr11"],
    "method": ["polynomial", "powerRule", "simple"],
    "origin": ["public"]
  }
}
```

**Required fields:** `id`, `prompt`, `answer`, `tags.topic` (exactly one value), `tags.origin`.

**Optional fields:** `difficulty` (1 | 2 | 3), `source` (provenance string), `tags.course`, `tags.method`.

### Multipart question

A shared stem with labeled parts, each having its own topic and method tags. Use when parts build on each other or share context.

```json
{
  "id": "q14",
  "stem": "Let $f(x) = x^2 e^x$.",
  "parts": [
    {
      "id": "a",
      "prompt": "Find $f'(x)$.",
      "answer": "$f'(x) = e^x(x^2 + 2x)$",
      "tags": { "topic": ["differentiation"], "method": ["powerRule", "exp", "productRule"] }
    },
    {
      "id": "b",
      "prompt": "Hence evaluate $\\int_0^1 f'(x)\\,dx$.",
      "answer": "$e - 1$",
      "tags": { "topic": ["integration"], "method": ["powerRule", "exp", "uSubstitution"] }
    }
  ],
  "tags": {
    "course": ["calc2", "VCE-yr12", "VCE-specialist", "HSC-yr12", "HSC-ext1", "IB-AA-HL-yr12"],
    "origin": ["public"]
  }
}
```

**Required fields:** `id`, `parts` (length ≥ 1), `tags.origin`. Each part requires `id`, `prompt`, `answer`, `tags.topic` (exactly one value).

**Forbidden on multipart parent:** `prompt`, `answer`, `tags.topic`, `tags.method`. These belong on parts.

**Optional fields:** `stem` (shared context shown above all parts), `difficulty`, `source`.

---

## Tag ownership

| Dimension | Flat entry | Multipart parent | Multipart part |
|-----------|-----------|-----------------|----------------|
| `course` | on entry | on parent | — |
| `origin` | on entry | on parent | — |
| `topic` | on entry (exactly 1) | **forbidden** | on each part (exactly 1) |
| `method` | on entry (≥ 0) | **forbidden** | on each part (≥ 0) |

---

## Tagging algorithm

### Step 1 — Choose shape

Is the question a single self-contained technique exercise?
→ **Flat.** Assign `tags.topic` (exactly one) and `tags.method` (zero or more) directly on the entry.

Does the question have labeled parts that build on each other or share a stem?
→ **Multipart.** Assign `tags.topic` and `tags.method` on each part separately.

### Step 2 — Assign topic

`topic` must be exactly one of: `differentiation` | `integration`.

For a flat question, the topic is the dominant operation required to answer it. If the question involves differentiating an integral or integrating a derivative in a way that the primary skill being tested is one operation, use that.

For multipart questions, each part gets its own topic independently.

### Step 3 — Assign method tags

Choose from the closed vocabulary:

| Tag | When to use |
|-----|-------------|
| `simple` | Direct recall or a single standard form; no composition, product, quotient, substitution, or multi-term structure required |
| `polynomial` | The whole expression being differentiated or integrated is a polynomial |
| `powerRule` | Powers $x^n$ and power-form antiderivatives, including negative and fractional powers |
| `exp` | Exponential functions such as $e^x$ or $e^{g(x)}$ |
| `log` | Logarithmic forms, including $\ln x$, $\frac{1}{x}$, and $\ln|f(x)|$ |
| `trig` | Trigonometric functions such as $\sin x$, $\cos x$, $\tan x$ |
| `inverseTrig` | Inverse trig derivatives or integrals |
| `linearity` | Two or more terms handled term-by-term |
| `simpleChainRule` | Differentiating $f(g(x))$ where inner $g(x)=ax+b$ is linear |
| `chainRule` | Differentiating a composition with a non-linear inner function |
| `productRule` | Differentiating a product $u \cdot v$ |
| `quotientRule` | Differentiating a quotient $u/v$ |
| `simpleUSub` | Integrating $f(ax+b)$ with a straightforward $\frac{1}{a}$ adjustment |
| `uSubstitution` | Integration by non-linear or non-obvious substitution |
| `integrationByParts` | $\int u\,dv = uv - \int v\,du$ |
| `partialFractions` | Decomposing rational functions before integrating |
| `trigIdentity` | Using trig identities (Pythagorean, double angle, etc.) to simplify before integrating |

A question may require multiple methods. Tag all that apply, including family tags. Use `simple` for direct standard-form recall such as $\frac{d}{dx}\ln x$, $\int\sin x\,dx$, or $\frac{d}{dx}[x^3]$; do not use `simple` when a compound technique such as `linearity`, `simpleChainRule`, `productRule`, or substitution applies.

Use `polynomial` only when the whole expression is a polynomial. A single monomial $cx^n$ usually carries `polynomial`, `powerRule`, and `simple`; a multi-term polynomial carries `polynomial`, `powerRule`, and `linearity`.

Do not invent tags outside this vocabulary. If a technique is not captured, omit the method tag and note it in the `source` field.

### Step 4 — Assign course tags

See `course-tags.md` for full rules. Summary:

1. Always include `calc1` or `calc2` (or both if the question bridges levels, which is unusual).
2. Add all curriculum tags for which the technique is in scope (see cross-curriculum equivalence table in `course-tags.md`).
3. Pair year + stream from the same system (e.g. `VCE-yr12` + `VCE-methods`).
4. **Do not assign deferred curriculum tags** (`QCE-*`, `SACE-*`, `WACE-*`, `TCE-*`, `ACT-*`, `AP-AB`, `AP-BC`) in Phase 1 imports.

### Step 5 — Assign origin

Public bank questions: `"origin": ["public"]`.
User-imported questions: `"origin": ["user"]`.

If `origin` is omitted, the loader defaults to `["public"]`.

---

## Phase 1 curriculum scope

Only assign these course tags in Phase 1 population:

**Content levels:** `calc1`, `calc2`

**VCE:** `VCE-yr11`, `VCE-yr12`, `VCE-methods`, `VCE-specialist`

**HSC:** `HSC-yr11`, `HSC-yr12`, `HSC-advanced`, `HSC-ext1`, `HSC-ext2`

**IB:** `IB-AA-SL-yr11`, `IB-AA-SL-yr12`, `IB-AA-HL-yr11`, `IB-AA-HL-yr12`, `IB-AI-SL-yr11`, `IB-AI-SL-yr12`, `IB-AI-HL-yr11`, `IB-AI-HL-yr12`

All other tags in `COURSE_TAGS` remain in the enum but should be left unassigned in Phase 1 imports.

---

## Filter semantics (for authors)

Understanding how filters work helps you tag accurately.

**Course filter (AND):** If a student selects `VCE-yr12` + `VCE-methods`, a question must carry **both** tags to appear. Tag both or the question is invisible to that filter combination.

**Topic filter (OR):** If a student selects `differentiation`, any question with `differentiation` anywhere in its effective tags matches. For multipart questions, a question matches if **any part** has the selected topic.

**Method filter (AND):** Selected methods must **all** appear in the question's effective method tags. For multipart, the union of all parts' method tags is checked.

**Effective tags for multipart:** at load time, `topic` and `method` are merged across all parts into `question.tags`. The parent's `course` and `origin` tags are preserved. Authors should ensure the parent course tags reflect the question as a whole.

---

## Validation rules (loader enforces)

The loader (`src/lib/load-questions.ts`) throws on these violations at startup:

| Rule | Error condition |
|------|----------------|
| Shape exclusivity | Both `prompt`+`answer` and `parts` present |
| Shape completeness | Neither `prompt`+`answer` nor `parts` present |
| Flat topic required | `tags.topic` missing or empty on flat entry |
| Flat topic singular | `tags.topic` has more than one value on flat entry |
| Multipart topic forbidden on parent | `tags.topic` present on multipart parent |
| Multipart method forbidden on parent | `tags.method` present on multipart parent |
| Part topic required | `tags.topic` missing on a part |
| Part topic singular | `tags.topic` has more than one value on a part |
| Part id unique | Duplicate `id` values within a question's `parts` |
| Parts non-empty | `parts` array has length 0 |

Additional checks enforced by TypeScript (compile-time, not runtime): tag values must be members of the closed `CourseTag`, `MethodTag`, `Topic` unions.

---

## Golden examples

### Example 1 — Flat, calc1, multi-curriculum

Power rule question suitable for introductory students across all in-scope curricula.

```json
{
  "id": "q-ex1",
  "prompt": "Differentiate $g(x) = 4x^5 - 3x^2 + 7$.",
  "answer": "$g'(x) = 20x^4 - 6x$",
  "difficulty": 1,
  "tags": {
    "topic": ["differentiation"],
    "course": [
      "calc1",
      "VCE-yr11", "VCE-methods",
      "HSC-yr11", "HSC-advanced",
      "IB-AA-SL-yr11", "IB-AI-SL-yr11"
    ],
    "method": ["polynomial", "powerRule", "linearity"],
    "origin": ["public"]
  }
}
```

### Example 2 — Flat, calc2, Specialist/Ext1/AA-HL

Integration by parts — above Methods/Advanced/SL level.

```json
{
  "id": "q-ex2",
  "prompt": "Find $\\int x e^x\\,dx$.",
  "answer": "$xe^x - e^x + C$",
  "difficulty": 2,
  "tags": {
    "topic": ["integration"],
    "course": [
      "calc2",
      "VCE-yr12", "VCE-specialist",
      "HSC-yr12", "HSC-ext1",
      "IB-AA-HL-yr12"
    ],
    "method": ["exp", "integrationByParts"],
    "origin": ["public"]
  }
}
```

### Example 3 — Flat, user origin

A question a user has added from their own study notes. Fewer course tags; origin is `user`.

```json
{
  "id": "user-001",
  "prompt": "Differentiate $h(x) = \\ln(\\sin x)$.",
  "answer": "$h'(x) = \\cot x$",
  "difficulty": 2,
  "tags": {
    "topic": ["differentiation"],
    "course": ["calc2", "VCE-yr12", "VCE-methods"],
    "method": ["log", "trig", "chainRule"],
    "origin": ["user"]
  }
}
```

### Example 4 — Multipart, mixed topics, calc2

A question where part (a) is differentiation and part (b) uses that result to set up an integral — classic Specialist / Ext 1 / AA HL structure.

```json
{
  "id": "q-ex4",
  "stem": "Let $f(x) = x^2 e^x$.",
  "parts": [
    {
      "id": "a",
      "prompt": "Find $f'(x)$.",
      "answer": "$f'(x) = e^x(x^2 + 2x)$",
      "tags": { "topic": ["differentiation"], "method": ["powerRule", "exp", "productRule"] }
    },
    {
      "id": "b",
      "prompt": "Hence evaluate $\\int_0^1 e^x(x^2 + 2x)\\,dx$.",
      "answer": "$e - 1$",
      "tags": { "topic": ["integration"], "method": ["powerRule", "exp", "uSubstitution"] }
    }
  ],
  "difficulty": 2,
  "tags": {
    "course": [
      "calc2",
      "VCE-yr12", "VCE-specialist",
      "HSC-yr12", "HSC-ext1",
      "IB-AA-HL-yr12"
    ],
    "origin": ["public"]
  }
}
```

### Example 5 — Multipart, same topic across parts, progressive difficulty

Both parts are integration, but the second part extends the technique.

```json
{
  "id": "q-ex5",
  "stem": "Consider $I = \\int \\frac{2x+1}{x^2+x-2}\\,dx$.",
  "parts": [
    {
      "id": "a",
      "prompt": "Express $\\frac{2x+1}{x^2+x-2}$ in partial fractions.",
      "answer": "$\\frac{2x+1}{(x+2)(x-1)} = \\frac{1}{x+2} + \\frac{1}{x-1}$",
      "tags": { "topic": ["integration"], "method": ["partialFractions"] }
    },
    {
      "id": "b",
      "prompt": "Hence find $I$.",
      "answer": "$\\ln|x+2| + \\ln|x-1| + C$",
      "tags": { "topic": ["integration"], "method": ["log", "partialFractions"] }
    }
  ],
  "difficulty": 3,
  "tags": {
    "course": [
      "calc2",
      "VCE-yr12", "VCE-specialist",
      "HSC-yr12", "HSC-ext2",
      "IB-AA-HL-yr12"
    ],
    "origin": ["public"]
  }
}
```

---

## Invalid examples

### ❌ Both `prompt`+`answer` and `parts` on same entry

```json
{
  "id": "q-bad1",
  "prompt": "Find $f'(x)$ where $f(x) = x^2$.",
  "answer": "$2x$",
  "parts": [{ "id": "a", "prompt": "...", "answer": "...", "tags": { "topic": ["differentiation"] } }],
  "tags": { "topic": ["differentiation"], "origin": ["public"] }
}
```
**Error:** shape exclusivity violated — provide either flat or multipart, not both.

### ❌ `topic` or `method` on multipart parent

```json
{
  "id": "q-bad2",
  "parts": [
    { "id": "a", "prompt": "...", "answer": "...", "tags": { "topic": ["differentiation"] } }
  ],
  "tags": {
    "topic": ["differentiation"],
    "method": ["trig", "chainRule"],
    "origin": ["public"]
  }
}
```
**Error:** `topic` and `method` must not appear on a multipart parent — put them on each part.

### ❌ Flat entry missing `topic`

```json
{
  "id": "q-bad3",
  "prompt": "Integrate $\\int x^2\\,dx$.",
  "answer": "$\\frac{x^3}{3} + C$",
  "tags": { "course": ["calc1"], "origin": ["public"] }
}
```
**Error:** `tags.topic` required on flat entry.

### ❌ Deferred curriculum tag in Phase 1

```json
{
  "id": "q-bad4",
  "prompt": "Differentiate $f(x) = x^3$.",
  "answer": "$3x^2$",
  "tags": {
    "topic": ["differentiation"],
    "course": ["calc1", "AP-AB", "QCE-yr11", "QCE-methods"],
    "method": ["polynomial", "powerRule", "simple"],
    "origin": ["public"]
  }
}
```
**Error:** `AP-AB`, `QCE-yr11`, `QCE-methods` are deferred tags — do not assign in Phase 1 imports.

---

## Schema (informal `oneOf`)

A formal JSON Schema will be added in Phase 2. For now, treat this as the normative description.

**FlatQuestion:**
```
required: id, prompt, answer, tags
tags.required: topic (array, exactly 1 value), origin
tags.optional: course (array of CourseTag), method (array of MethodTag)
optional: stem (ignored), difficulty (1|2|3), source (string)
forbidden in tags: none
```

**MultipartQuestion:**
```
required: id, parts (array, length ≥ 1), tags
tags.required: origin
tags.optional: course (array of CourseTag)
tags.forbidden: topic, method
parts[i].required: id (string, unique within question), prompt, answer, tags
parts[i].tags.required: topic (array, exactly 1 value)
parts[i].tags.optional: method (array of MethodTag)
optional: stem (string), difficulty (1|2|3), source (string)
```

---

## Solution files

Each question may have a corresponding solution at `data/solutions/{id}.md`.

Frontmatter:
```yaml
---
questionId: q-ex4
source: manual          # "manual" | "ai"
exemplar: true          # optional — marks as a model solution
locked: true            # optional — prevents automated overwrite
templateVersion: 1
---
```

Body: standard markdown with `$...$` / `$$...$$` LaTeX.

For multipart questions, use per-part headings:
```markdown
## Part (a)
...working...

## Part (b)
...working...
```

---

## Checklist for human review

Before merging a batch of imported questions:

- [ ] Every entry has a unique `id` with no collisions against existing bank
- [ ] Every flat entry has exactly one `tags.topic` value
- [ ] Every multipart parent has no `tags.topic` or `tags.method`
- [ ] Every part has exactly one `tags.topic` value
- [ ] All `course` tags are from the Phase 1 in-scope list (no deferred tags)
- [ ] Year + stream are paired from the same system on every entry
- [ ] `calc1` or `calc2` is present on every entry
- [ ] Golden examples include at least one multipart entry with mixed topics across parts
- [ ] `origin` is set on every entry
- [ ] LaTeX renders correctly (check `$` delimiters; escape backslashes in JSON: `\\int`, `\\frac`)
- [ ] No applications, differential equations, or Maclaurin content has been included
