# Question Bank Import Specification

**specVersion: 2**

This document defines the canonical import workflow for populating `data/questions.json` using a **manual-tagged** process.

Primary goal: preserve reliable ground-truth labels for future expansion of taxonomy/classes.

Phase 1 scope: differentiation and integration **techniques** only. No applications, differential equations, or Maclaurin/Taylor series.

---

## Design principles

1. **Manual tags are authoritative.**
   All classification tags (`course`, `topic`, `method`) are provided by a human.
2. **No model-based tag prediction.**
   LLMs are not used to infer or suggest tags.
3. **Canonical output remains stable.**
   Published records in `data/questions.json` keep the existing runtime shape expected by `loadQuestions()`.
4. **Import and publish contracts are explicit.**
   Staging format is for curation; published format is the app contract.

---

## Import pipeline stages

1. **Extract** raw question content (e.g., textbook, past exam, teacher notes).
2. **Structure** into flat/multipart candidate shape.
3. **Assign manual tags** (`course`, `topic`, `method`) in correct ownership locations.
4. **Validate** shape, ownership, and vocabulary rules.
5. **Publish** canonical entries to `data/questions.json`.

---

## Data contracts

There are two contracts:

1. **Import Candidate** (staging/review format)
2. **Canonical Question Bank Entry** (published format in `data/questions.json`)

### 1) Import Candidate (staging format)

Each candidate is either `flat` or `multipart`.

#### Flat candidate

```json
{
  "id": "candidate-001",
  "shape": "flat",
  "content": {
    "prompt": "Differentiate $f(x)=x^3$.",
    "answer": "$3x^2$"
  },
  "manualTags": {
    "topic": ["differentiation"],
    "course": ["calc1", "VCE-yr11", "VCE-methods"],
    "method": ["powerRule"]
  },
  "meta": {
    "origin": "public",
    "source": "Stewart Calculus 8e, Ch 3",
    "difficulty": 1
  }
}
```

#### Multipart candidate

```json
{
  "id": "candidate-014",
  "shape": "multipart",
  "content": {
    "stem": "Let $f(x)=x^2e^x$.",
    "parts": [
      {
        "id": "a",
        "prompt": "Find $f'(x)$.",
        "answer": "$e^x(x^2+2x)$",
        "manualTags": {
          "topic": ["differentiation"],
          "method": ["productRule"]
        }
      },
      {
        "id": "b",
        "prompt": "Hence evaluate $\\int_0^1 f'(x)\\,dx$.",
        "answer": "$e-1$",
        "manualTags": {
          "topic": ["integration"],
          "method": ["uSubstitution"]
        }
      }
    ]
  },
  "manualTags": {
    "course": ["calc2", "HSC-yr12", "HSC-ext1", "IB-AA-HL-yr12"]
  },
  "meta": {
    "origin": "public",
    "source": "Teacher handout",
    "difficulty": 2
  }
}
```

### 2) Canonical output (published format)

After validation, publish into the existing app shape.

#### Flat question (published)

```json
{
  "id": "q1",
  "prompt": "Differentiate $f(x) = x^3$ using the power rule.",
  "answer": "$f'(x) = 3x^2$",
  "difficulty": 1,
  "source": "optional provenance string",
  "tags": {
    "topic": ["differentiation"],
    "course": ["calc1", "VCE-yr11", "VCE-methods"],
    "method": ["powerRule"],
    "origin": ["public"]
  }
}
```

#### Multipart question (published)

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
      "answer": "$e - 1$",
      "tags": { "topic": ["integration"], "method": ["uSubstitution"] }
    }
  ],
  "tags": {
    "course": ["calc2", "HSC-yr12", "HSC-ext1"],
    "origin": ["public"]
  }
}
```

---

## Manual tag requirements

### Flat candidates

Required:
- `manualTags.topic` exactly one value
- `manualTags.course` one or more values
- `manualTags.method` present (may be an empty array if intentionally no named method)
- `meta.origin` (`public` or `user`)

### Multipart candidates

Required:
- parent `manualTags.course` one or more values
- each part has `manualTags.topic` exactly one value
- each part has `manualTags.method` present (may be empty)
- `meta.origin` (`public` or `user`)

---

## Tag ownership

| Dimension | Flat entry | Multipart parent | Multipart part |
|-----------|-----------|-----------------|----------------|
| `course` | on entry | on parent | — |
| `origin` | on entry | on parent | — |
| `topic` | on entry (exactly 1) | **forbidden** | on each part (exactly 1) |
| `method` | on entry (>= 0) | **forbidden** | on each part (>= 0) |

---

## LLM usage boundary

LLMs may be used for formatting or structuring assistance only.

Allowed:
- convert source text to structured prompt/answer/parts JSON
- normalize formatting and LaTeX escaping
- draft optional human-facing notes

Forbidden:
- assigning, suggesting, or editing `course`, `topic`, or `method`
- changing shape decisions (`flat` vs `multipart`) after manual curation

---

## Closed vocabularies

Use only canonical tags from `src/lib/questions.ts`:

- **topic:** `differentiation`, `integration`
- **method:** `powerRule`, `chainRule`, `productRule`, `quotientRule`, `uSubstitution`, `integrationByParts`, `partialFractions`, `trigIdentity`
- **origin:** `public`, `user`
- **course:** values from `COURSE_TAGS` and policy in `data/course-tags.md`

Do not invent new tag strings in import or publish output.

---

## Phase 1 curriculum scope

Only assign these course tags in Phase 1 population:

- **Content levels:** `calc1`, `calc2`
- **VCE:** `VCE-yr11`, `VCE-yr12`, `VCE-methods`, `VCE-specialist`
- **HSC:** `HSC-yr11`, `HSC-yr12`, `HSC-advanced`, `HSC-ext1`, `HSC-ext2`
- **IB:** `IB-AA-SL-yr11`, `IB-AA-SL-yr12`, `IB-AA-HL-yr11`, `IB-AA-HL-yr12`, `IB-AI-SL-yr11`, `IB-AI-SL-yr12`, `IB-AI-HL-yr11`, `IB-AI-HL-yr12`

Deferred tags in enum should remain unassigned during Phase 1.

---

## Validation rules

Validation occurs before publish.

Hard failures:
- both flat fields (`prompt`/`answer`) and `parts` present
- neither flat fields nor `parts` present
- flat missing `manualTags.topic`, `manualTags.course`, or `manualTags.method`
- flat `manualTags.topic` has more than one value
- multipart parent contains `topic` or `method`
- multipart parent missing `manualTags.course`
- multipart part missing `manualTags.topic` or `manualTags.method`
- multipart part `manualTags.topic` has more than one value
- duplicate part IDs within one question
- empty parts array
- unknown tag strings outside closed vocabularies

---

## Filter semantics reminder (for taggers)

- Across dimensions, matching is AND.
- `course` and `method` are AND within their dimension.
- `topic` is OR within its dimension.
- Multipart effective topic/method tags are unioned across parts at load time.

Tag conservatively but completely so users can discover questions through realistic chip combinations.

---

## Solution files

Each question may have a corresponding solution at `data/solutions/{id}.md`.

Frontmatter:

```yaml
---
questionId: q14
source: manual
exemplar: true
locked: true
templateVersion: 1
---
```

Body uses markdown + `$...$` / `$$...$$` LaTeX.
Multipart solutions should use per-part headings (`## Part (a)`, `## Part (b)`).

---

## Checklist for import review

Before merging a batch:

- [ ] Every entry has unique `id`
- [ ] Flat candidates have manual `course`, `topic`, and `method`
- [ ] Multipart parent has manual `course` only (no `topic`/`method` on parent)
- [ ] Every multipart part has manual `topic` and `method`
- [ ] All tags are in closed vocabularies
- [ ] `origin` is set on every entry
- [ ] `calc1` or `calc2` is present where appropriate
- [ ] Year + stream are correctly paired within systems
- [ ] No deferred Phase 1 course tags are assigned
- [ ] LaTeX is valid (`\\int`, `\\frac`, etc. escaped in JSON)
- [ ] No out-of-scope content (applications, DEs, Maclaurin/Taylor)