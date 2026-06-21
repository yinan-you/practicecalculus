# Course tags

Tags describe **who** a question is for. A question can carry multiple tags.

Use **content tags** (`calc1`, `calc2`) for topic depth that cuts across curricula. Add **year** and **stream** tags when a question matches a specific certificate and subject.

## Content level (generic)

| Tag | Meaning |
| --- | --- |
| `calc1` | First-semester calculus: limits, derivatives, basic integrals |
| `calc2` | Second-semester calculus: advanced integration, series, parametric/polar |

These align loosely with university Calculus I / II and are useful when a question fits many programs.

## Australia — year tags

| State / territory | Certificate | Year 11 tag | Year 12 tag | Notes |
| --- | --- | --- | --- | --- |
| Victoria | VCE | `VCE-yr11` | `VCE-yr12` | Units 1–2 ≈ yr11, Units 3–4 ≈ yr12 |
| New South Wales | HSC | `HSC-yr11` | `HSC-yr12` | Preliminary vs HSC year |
| Queensland | QCE | `QCE-yr11` | `QCE-yr12` | General (ATAR) subjects |
| South Australia | SACE | `SACE-yr11` | `SACE-yr12` | Stage 1 / Stage 2 |
| Northern Territory | NTCET | `SACE-yr11` | `SACE-yr12` | Same structure as SACE |
| Western Australia | WACE | `WACE-yr11` | `WACE-yr12` | ATAR maths courses |
| Tasmania | TCE | `TCE-yr11` | `TCE-yr12` | TASC administers TCE |
| ACT | BSSS / ACT SSC | `ACT-yr11` | `ACT-yr12` | ACT senior secondary certificate |

## Australia — subject stream tags

Stream tags name the **calculus-relevant** maths subject. Pair them with a year tag from the same state (e.g. `VCE-yr12` + `VCE-methods`).

Elementary streams (General Mathematics, HSC Standard, Mathematical Applications) are omitted — they contain little or no calculus.

### Cross-state equivalence

| Stream tag | Official subject name | Rough equivalent |
| --- | --- | --- |
| `VCE-methods` | Mathematical Methods | HSC Advanced, QCE/SACE/WACE/ACT Methods |
| `VCE-specialist` | Specialist Mathematics | HSC Ext 1 + Ext 2 combined |
| `HSC-advanced` | Mathematics Advanced | VCE Methods |
| `HSC-ext1` | Mathematics Extension 1 | Part of VCE Specialist; requires Advanced |
| `HSC-ext2` | Mathematics Extension 2 | Top tier; requires Ext 1 + Advanced |
| `QCE-methods` | Mathematical Methods | VCE Methods |
| `QCE-specialist` | Specialist Mathematics | VCE Specialist |
| `SACE-methods` | Mathematical Methods | VCE Methods |
| `SACE-specialist` | Specialist Mathematics | VCE Specialist |
| `WACE-methods` | Mathematics Methods ATAR | VCE Methods |
| `WACE-specialist` | Mathematics Specialist ATAR | VCE Specialist |
| `TCE-methods` | Mathematics Methods | VCE Methods |
| `TCE-specialised` | Mathematics Specialised | VCE Specialist (Tasmania spells it "Specialised") |
| `ACT-methods` | Mathematical Methods | VCE Methods |
| `ACT-specialist` | Specialist Mathematics | VCE Specialist |

### HSC prerequisite chain

```
HSC-advanced  →  HSC-ext1  →  HSC-ext2
```

Extension 1 requires Advanced; Extension 2 requires both. Tag the **highest** stream a question is aimed at, plus any lower streams it also suits.

### VCE / QCE / SACE / WACE specialist note

Specialist Mathematics (or equivalent) is taken **alongside** Methods, not instead of it. A Specialist question often also suits Methods students in yr12.

## IB Diploma Programme

IB maths is a **two-year** course (typically grades 11–12). There are two subjects, each at **SL** or **HL**:

- **AA** — Analysis & Approaches (primary calculus pathway; use for most questions here)
- **AI** — Applications & Interpretation (less calculus, especially at SL)

| Tag | Typical cohort |
| --- | --- |
| `IB-AA-SL-yr11` | Math AA SL, first year |
| `IB-AA-SL-yr12` | Math AA SL, second year / exam year |
| `IB-AA-HL-yr11` | Math AA HL, first year |
| `IB-AA-HL-yr12` | Math AA HL, second year / exam year |
| `IB-AI-SL-yr11` | Math AI SL, first year |
| `IB-AI-SL-yr12` | Math AI SL, second year |
| `IB-AI-HL-yr11` | Math AI HL, first year |
| `IB-AI-HL-yr12` | Math AI HL, second year |

HL covers more calculus depth (e.g. integration by parts, series) than SL.

## United States

There is **no national** high-school calculus syllabus. Most calculus-aligned students take **College Board AP** courses:

| Tag | Meaning |
| --- | --- |
| `AP-AB` | AP Calculus AB — ~one semester of college calculus (`calc1` content) |
| `AP-BC` | AP Calculus BC — AB content **plus** series, parametric/polar, etc. (`calc1` + `calc2`) |

**AP Calculus AB and BC are parallel one-year courses**, not a sequence — students pick one. BC contains all AB topics.

Other US paths (not separate tags yet, but useful context):

- **AP Precalculus** — functions and modelling; little or no calculus
- **Honors / regular Calculus** — school-specific; often tracks AB or BC
- **Dual enrollment** — college calc at a high school; content usually matches `calc1` / `calc2`

US year labels are inconsistent (9th–12th grade); we use content tags (`calc1`, `AP-AB`) rather than `yr11`/`yr12` for America.

## Tagging examples

Introductory derivative, Methods / Advanced yr11:

```json
{ "tags": { "course": ["calc1", "VCE-yr11", "VCE-methods", "HSC-yr11", "HSC-advanced"] } }
```

Harder integral, Specialist / Ext 2 yr12:

```json
{ "tags": { "course": ["calc2", "VCE-yr12", "VCE-specialist", "HSC-yr12", "HSC-ext2", "AP-BC"] } }
```

IB HL integration by parts:

```json
{ "tags": { "course": ["calc2", "IB-AA-HL-yr12", "VCE-yr12", "VCE-specialist"] } }
```

Prefer **specific** curriculum tags when you know the audience; add **content** tags when the maths level is the main signal.
