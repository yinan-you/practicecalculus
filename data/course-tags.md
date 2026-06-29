# Course Tagging Reference

**specVersion: 1**

This document is the authoritative guide for assigning `course` tags to questions in the public bank. It covers Phase 1 in-scope curricula in full detail; deferred curricula are stubbed at the bottom.

**Scope:** differentiation and integration *techniques* only. Applications (optimisation, related rates, kinematics, area/volume), differential equations, and Maclaurin/Taylor series are out of scope for Phase 1 question population even where they appear in the syllabus.

---

## How course tags work

Course tags live on `tags.course` and use `matchMode: "all"` (AND semantics). A student filtering on `["VCE-yr12", "VCE-methods"]` will only see questions carrying **both** tags.

**Always pair year + stream** from the same system. A question tagged `VCE-yr12` alone is not useful — it should also carry `VCE-methods` or `VCE-specialist` (or both if appropriate).

**Always include a content level** (`calc1` or `calc2`) alongside curriculum tags. This lets students without a specific curriculum context still filter meaningfully.

**Multi-tag generously across equivalent curricula.** A standard chain rule question suits VCE Methods, HSC Advanced, IB AA SL, and calc1 simultaneously — tag all of them. Students in different systems find the same question; no duplication needed.

**Tag the highest stream the question targets, then add lower streams it also suits.** A question requiring integration by parts (HSC Ext 1 / IB AA HL) should carry `HSC-ext1` but not `HSC-advanced` unless it genuinely suits Advanced students too.

---

## Method tags

Method tags live on `tags.method` (flat entry or each multipart part). They are independent of `course` tags — assign both dimensions. Method filter uses AND semantics within the dimension; across dimensions, filters are ANDed with `topic`, `course`, etc.

**Full tagging rules:** `data/import-specv2.md` § Method tagging conventions.

### Canonical method vocabulary

| Tag | Topic | Meaning |
|-----|-------|---------|
| `powerRule` | differentiation | polynomials, $x^n$ |
| `simpleChainRule` | differentiation | $f(g(x))$ where inner $g(x)=ax+b$ (linear) |
| `chainRule` | differentiation | chain rule with **non-linear** inner function |
| `productRule` | differentiation | product of two functions |
| `quotientRule` | differentiation | quotient of two functions |
| `simpleUSub` | integration | $f(ax+b)$ or $u=ax+b$ with straightforward $\frac{1}{a}$ adjustment |
| `uSubstitution` | integration | non-obvious substitution or derivative-factor spotting |
| `integrationByParts` | integration | $\int u\,dv$ |
| `partialFractions` | integration | rational functions via partial fractions |
| `trigIdentity` | integration | trig identity rewrite before integrating |
| `other` | both | standard derivative/antiderivative recall (sin, cos, exp, log, etc.) |

**Simple vs full:** *Simple* chain rule and u-sub mean the inner function is linear ($g(x)=ax+b$). Use `simpleChainRule` / `simpleUSub` for these — not `chainRule` / `uSubstitution`. Examples: $\frac{d}{dx}\sin(3x)$ → `simpleChainRule`; $\frac{d}{dx}\sin(x^2)$ → `chainRule`; $\int\cos(3x)\,dx$ → `simpleUSub`; $\int 2x\cos(x^2)\,dx$ → `uSubstitution`.

**`other`:** Use when the student solves the problem primarily from memory of standard forms (e.g. $\frac{d}{dx}e^x$, $\int\sin x\,dx$). Pair with the appropriate `topic` tag.

---

## Content levels

### `calc1` — Introductory calculus

Questions at this level assume only basic polynomial, exponential, and simple trigonometric differentiation and integration. The student knows the power rule, chain rule with linear inner functions (`simpleChainRule`, `simpleUSub`), and standard derivatives/integrals (`other`).

**Differentiation techniques in scope at calc1:**
- Power rule: $\frac{d}{dx}[x^n] = nx^{n-1}$
- Sum/difference rule
- Constant multiple rule
- Chain rule with linear inner function: $\frac{d}{dx}[(ax+b)^n]$
- Derivatives of $e^x$, $\ln x$, $\sin x$, $\cos x$, $\tan x$ (standard results, no proof required)
- Product rule (straightforward cases)
- Quotient rule (straightforward cases)

**Integration techniques in scope at calc1:**
- Reverse power rule
- Standard integrals: $\int e^x\,dx$, $\int \frac{1}{x}\,dx$, $\int \sin x\,dx$, $\int \cos x\,dx$
- Integration of $(ax+b)^n$ by inspection / linear substitution
- Simple definite integrals

**Not at calc1:** u-substitution with non-linear substitutions (`uSubstitution`), integration by parts, partial fractions, trig identities in integration, inverse trig integrals.

---

### `calc2` — Intermediate/advanced calculus

Questions at this level require techniques beyond calc1. Use `calc2` for questions involving `chainRule`, `uSubstitution`, `integrationByParts`, `partialFractions`, `trigIdentity`, or inverse trig integrals.

**Additional differentiation techniques at calc2:**
- Chain rule with non-linear compositions: $\frac{d}{dx}[f(g(x))]$ where $g$ is non-linear
- Product rule with exponential/trig/log combinations
- Quotient rule in complex settings
- Implicit differentiation
- Derivatives of inverse trig functions: $\frac{d}{dx}[\arcsin x]$, $\frac{d}{dx}[\arctan x]$

**Additional integration techniques at calc2:**
- u-substitution with non-linear substitutions
- Integration by parts: $\int u\,dv = uv - \int v\,du$
- Partial fractions
- Trig identity integrals: using $\sin^2 x + \cos^2 x = 1$, double angle formulas
- Integrals of the form $\int \frac{1}{a^2+x^2}\,dx = \frac{1}{a}\arctan\frac{x}{a} + C$
- Integrals of the form $\int \frac{1}{\sqrt{a^2-x^2}}\,dx = \arcsin\frac{x}{a} + C$
- Reduction formulae (Specialist / Ext 2 / IB AA HL)

---

## Australia — Phase 1 in-scope curricula

### Victoria (VCE)

VCE Mathematics splits into two subjects: **Mathematical Methods** and **Specialist Mathematics**. Both span Units 1–4 across Year 11 (Units 1 & 2) and Year 12 (Units 3 & 4). Most students taking Specialist also take Methods concurrently; Specialist assumes Methods knowledge.

#### Tag pairing rules

| Year | Subject | Tags to apply |
|------|---------|---------------|
| Year 11 | Methods Units 1 & 2 | `VCE-yr11` + `VCE-methods` |
| Year 12 | Methods Units 3 & 4 | `VCE-yr12` + `VCE-methods` |
| Year 11 | Specialist Units 1 & 2 | `VCE-yr11` + `VCE-specialist` |
| Year 12 | Specialist Units 3 & 4 | `VCE-yr12` + `VCE-specialist` |

A question suitable for both Methods and Specialist in Year 12 should carry all four: `VCE-yr12`, `VCE-methods`, `VCE-specialist` (and `calc1` or `calc2`).

#### VCE Mathematical Methods — calculus techniques scope

**Units 1 & 2 (Year 11) — `VCE-yr11` + `VCE-methods`:**
- Power rule, sum rule, constant multiple
- Chain rule: polynomial and simple exponential inner functions
- Product and quotient rule (introduced)
- Derivatives of $e^x$, $\ln x$, $\sin x$, $\cos x$, $\tan x$
- Antidifferentiation by recognition (reverse chain rule with linear inner function)
- Standard integrals as above

**Units 3 & 4 (Year 12) — `VCE-yr12` + `VCE-methods`:**
All of the above, plus:
- Chain rule in more complex compositions
- Product and quotient rule fluency
- $\int \frac{f'(x)}{f(x)}\,dx = \ln|f(x)| + C$ by recognition
- Definite integrals (technique, not application)

*Out of scope for Methods:* integration by parts, partial fractions, trig identity integration, inverse trig derivatives/integrals — these belong to Specialist.

#### VCE Specialist Mathematics — calculus techniques scope

Specialist Mathematics Units 1 & 2 (Year 11) do **not** include calculus — calculus first appears in Specialist Units 3 & 4. However, students will have concurrent Methods Units 3 & 4 content.

**Units 3 & 4 (Year 12) — `VCE-yr12` + `VCE-specialist`:**
All Methods content, plus:
- Derivatives of $\arcsin x$, $\arccos x$, $\arctan x$
- Integration by parts
- Partial fractions (linear and irreducible quadratic denominators)
- Trig identity integration: $\sin^2 x$, $\cos^2 x$ via double angle; $\sec^2 x$
- Integrals of the form $\int \frac{1}{a^2+x^2}\,dx$, $\int \frac{1}{\sqrt{a^2-x^2}}\,dx$
- Reduction formulae (e.g. $\int \sin^n x\,dx$ — may appear in Logic & Proof context)
- Implicit differentiation

**Note:** The VCAA study design explicitly lists trigonometric identities (including Pythagorean, double angle) as required for integration in Specialist Units 3 & 4.

#### VCE content level mapping

| Technique | calc level | VCE tags |
|-----------|-----------|----------|
| `powerRule`, `simpleChainRule` | calc1 | `VCE-yr11` + `VCE-methods` |
| `productRule`, `quotientRule`, `other` | calc1 | `VCE-yr11` + `VCE-methods` or `VCE-yr12` + `VCE-methods` |
| `chainRule`, `simpleUSub`, $\ln|f(x)|$ recognition | calc1–calc2 | `VCE-yr12` + `VCE-methods` |
| Integration by parts | calc2 | `VCE-yr12` + `VCE-specialist` |
| Partial fractions | calc2 | `VCE-yr12` + `VCE-specialist` |
| Trig identity integrals | calc2 | `VCE-yr12` + `VCE-specialist` |
| Inverse trig derivatives/integrals | calc2 | `VCE-yr12` + `VCE-specialist` |

---

### New South Wales (HSC)

NSW HSC Mathematics has three calculus-relevant streams: **Advanced**, **Extension 1**, and **Extension 2**. Each is a separate subject. Extension 1 assumes Advanced; Extension 2 assumes Extension 1.

The HSC is Year 12 only. Year 11 content (Preliminary) uses the same stream structure but is tagged `HSC-yr11`.

#### Tag pairing rules

| Year | Stream | Tags to apply |
|------|--------|---------------|
| Year 11 (Preliminary) | Advanced | `HSC-yr11` + `HSC-advanced` |
| Year 12 | Advanced | `HSC-yr12` + `HSC-advanced` |
| Year 11 (Preliminary) | Extension 1 | `HSC-yr11` + `HSC-ext1` |
| Year 12 | Extension 1 | `HSC-yr12` + `HSC-ext1` |
| Year 12 only | Extension 2 | `HSC-yr12` + `HSC-ext2` |

Extension 2 is Year 12 only (no Preliminary equivalent). When tagging an Ext 2 question, also add `HSC-ext1` and `HSC-advanced` if the technique is also accessible at those levels. Usually it isn't — Ext 2 techniques are genuinely beyond Ext 1.

#### HSC Advanced — calculus techniques scope

**Year 11 / Preliminary (`HSC-yr11` + `HSC-advanced`):**
- Derivatives of polynomials, $e^x$, $\ln x$, $\sin x$, $\cos x$, $\tan x$
- Chain, product, quotient rules
- Antidifferentiation by recognition; standard integrals
- Definite integrals

**Year 12 (`HSC-yr12` + `HSC-advanced`):**
All Year 11 content plus:
- Derivatives of $e^{f(x)}$, $\ln(f(x))$, $\sin(f(x))$ etc. via chain rule
- $\int f'(x)e^{f(x)}\,dx$, $\int \frac{f'(x)}{f(x)}\,dx$ by reverse chain rule

*Out of scope for Advanced:* integration by substitution (non-trivial), integration by parts, partial fractions, inverse trig — these are Ext 1 or Ext 2.

#### HSC Extension 1 — calculus techniques scope

Extension 1 adds to Advanced content:

**Year 11 (`HSC-yr11` + `HSC-ext1`):**
- All Advanced Year 11 content
- Introduction to inverse trig functions and their derivatives: $\frac{d}{dx}[\sin^{-1}(x/a)]$, $\frac{d}{dx}[\tan^{-1}(x/a)]$
- Integrals of the form $\int \frac{1}{\sqrt{a^2-x^2}}\,dx$, $\int \frac{1}{a^2+x^2}\,dx$

**Year 12 (`HSC-yr12` + `HSC-ext1`):**
All Year 11 Ext 1 content plus:
- Integration by substitution (u-substitution, non-trivial)
- Trig identity integrals using $\cos 2x$ double angle identity for $\sin^2 x$, $\cos^2 x$
- Integration by parts (introduced at Ext 1 level in current NESA syllabus)

#### HSC Extension 2 — calculus techniques scope

Extension 2 is Year 12 only. The calculus content (MEX-C topic) includes:

- Integration by parts (advanced cases, including reduction formulae)
- Partial fractions (including irreducible quadratics in denominator)
- Trig substitution
- Further substitution techniques
- Integrals reducible to standard forms via completing the square

Extension 2 also involves proof by induction applied to calculus results (e.g. proving $\frac{d}{dx}[x^n] = nx^{n-1}$) — these are technique questions in scope if phrased as differentiation exercises.

#### HSC content level mapping

| Technique | calc level | HSC tags |
|-----------|-----------|----------|
| `powerRule`, `simpleChainRule`, `productRule`, `quotientRule` | calc1 | `HSC-yr11` + `HSC-advanced` |
| `other`, `simpleUSub` (recognition / standard integrals) | calc1 | `HSC-yr11` + `HSC-advanced` |
| `chainRule`, $\ln|f|$ recognition | calc1–calc2 | `HSC-yr12` + `HSC-advanced` |
| Inverse trig derivatives/integrals | calc2 | `HSC-yr11` + `HSC-ext1` |
| `uSubstitution` | calc2 | `HSC-yr12` + `HSC-ext1` |
| Trig identity integrals | calc2 | `HSC-yr12` + `HSC-ext1` |
| Integration by parts (standard) | calc2 | `HSC-yr12` + `HSC-ext1` |
| Integration by parts (advanced/reduction) | calc2 | `HSC-yr12` + `HSC-ext2` |
| Partial fractions | calc2 | `HSC-yr12` + `HSC-ext2` |
| Trig substitution | calc2 | `HSC-yr12` + `HSC-ext2` |

---

## IB Diploma Programme

IB DP Mathematics has two courses: **Analysis & Approaches (AA)** and **Applications & Interpretation (AI)**, each at **Standard Level (SL)** or **Higher Level (HL)**. Both span two years (Year 11 = Year 1, Year 12 = Year 2).

### Tags

| Course | Year | Tags |
|--------|------|------|
| AA SL | Year 11 | `IB-AA-SL-yr11` |
| AA SL | Year 12 | `IB-AA-SL-yr12` |
| AA HL | Year 11 | `IB-AA-HL-yr11` |
| AA HL | Year 12 | `IB-AA-HL-yr12` |
| AI SL | Year 11 | `IB-AI-SL-yr11` |
| AI SL | Year 12 | `IB-AI-SL-yr12` |
| AI HL | Year 11 | `IB-AI-HL-yr11` |
| AI HL | Year 12 | `IB-AI-HL-yr12` |

### AA vs AI calculus emphasis

**AA** is the more algebraic/theoretical course and covers integration and differentiation techniques in depth. **AI** emphasises modelling and technology; its calculus is shallower — techniques are introduced but the focus is on interpretation, not symbolic manipulation. For Phase 1 technique questions, AI tags will rarely appear alone; most technique questions suit AA first.

**HL vs SL:** HL extends SL content with additional techniques (integration by parts, further substitution, inverse trig, reduction formulae). SL students are not expected to know integration by parts.

### IB AA — calculus techniques scope

#### AA SL — Year 1 (`IB-AA-SL-yr11`)
- Derivatives of $x^n$, $\sin x$, $\cos x$, $e^x$, $\ln x$
- Chain rule, product rule, quotient rule (introduced)
- Antidifferentiation: $\int x^n\,dx$, $\int \sin x\,dx$, $\int \cos x\,dx$, $\int e^x\,dx$, $\int \frac{1}{x}\,dx$
- Integration of $(ax+b)^n$ and similar by inspection

#### AA SL — Year 2 (`IB-AA-SL-yr12`)
All Year 1 content plus:
- Chain rule fluency across exponential, trig, log compositions
- $\int \frac{f'(x)}{f(x)}\,dx$, $\int f'(x)e^{f(x)}\,dx$ by inspection / reverse chain rule
- Simple u-substitution

#### AA HL — Year 1 (`IB-AA-HL-yr11`)
All AA SL Year 1 content plus:
- Implicit differentiation
- Derivatives of inverse trig: $\arcsin x$, $\arctan x$
- Integrals of $\frac{1}{a^2+x^2}$, $\frac{1}{\sqrt{a^2-x^2}}$

#### AA HL — Year 2 (`IB-AA-HL-yr12`)
All AA HL Year 1 content plus:
- Integration by parts
- Further u-substitution (non-linear, definite integrals with change of limits)
- Trig identity integrals: using $\cos 2x$ for $\sin^2 x$, $\cos^2 x$; $\tan^2 x = \sec^2 x - 1$
- Mixed quotient integrals via inverse trig forms
- Reduction formulae

The IB AA HL bootcamp (Revision Village) explicitly identifies these sub-topics within the HL integration syllabus: mixed quotients (inverse trig forms), trig integrals (substitution + identities), integration by parts, substitution with definite integrals.

### IB AI — calculus techniques scope

AI SL and AI HL include calculus, but the emphasis is on GDC-assisted evaluation and interpretation. Symbolic technique questions at AI level are limited.

#### AI SL (`IB-AI-SL-yr11`, `IB-AI-SL-yr12`)
- Power rule differentiation; derivatives of $e^x$, $\ln x$, $\sin x$, $\cos x$
- Simple antidifferentiation; definite integrals (mainly GDC in exams)
- Chain rule (simple cases)

#### AI HL (`IB-AI-HL-yr11`, `IB-AI-HL-yr12`)
All AI SL content plus:
- Product and quotient rule
- Integration by substitution (basic)
- No integration by parts at AI HL

*AI questions should only be tagged if the technique is genuinely within AI scope without a GDC. If the question requires a symbolic technique beyond AI's by-hand expectation, do not tag AI.*

### IB content level mapping

| Technique | calc level | IB tags |
|-----------|-----------|---------|
| `powerRule`, standard derivatives (`other`) | calc1 | `IB-AA-SL-yr11`, `IB-AI-SL-yr11` |
| `simpleChainRule`, `productRule`, `quotientRule` | calc1 | `IB-AA-SL-yr11` |
| Standard antidifferentiation (`other`, `simpleUSub`) | calc1 | `IB-AA-SL-yr11`, `IB-AI-SL-yr11` |
| Reverse chain rule / $f'/f$ integrals (`simpleUSub`) | calc1–calc2 | `IB-AA-SL-yr12` |
| Inverse trig derivatives/integrals | calc2 | `IB-AA-HL-yr11` |
| `uSubstitution` | calc2 | `IB-AA-SL-yr12`, `IB-AA-HL-yr12` |
| Integration by parts | calc2 | `IB-AA-HL-yr12` |
| Trig identity integrals | calc2 | `IB-AA-HL-yr12` |
| Reduction formulae | calc2 | `IB-AA-HL-yr12` |
| Mixed quotient / inverse trig integrals | calc2 | `IB-AA-HL-yr12` |

---

## Cross-curriculum equivalence table

For technique questions, the following curriculum levels are broadly equivalent and should be multi-tagged. Rows use canonical `method` tag names from `src/lib/questions.ts`.

| Method tag | VCE | HSC | IB | calc |
|------------|-----|-----|----|------|
| `powerRule` | Meth yr11 | Adv yr11 | AA-SL-yr11, AI-SL-yr11 | calc1 |
| `simpleChainRule` | Meth yr11 | Adv yr11 | AA-SL-yr11 | calc1 |
| `productRule`, `quotientRule` | Meth yr11 | Adv yr11 | AA-SL-yr11 | calc1 |
| `other` (standard derivatives/integrals) | Meth yr11 | Adv yr11 | AA-SL-yr11, AI-SL-yr11 | calc1 |
| `simpleUSub` (linear argument / recognition) | Meth yr11–12 | Adv yr11–12 | AA-SL-yr11–12 | calc1 |
| `chainRule` (non-linear inner) | Meth yr12 | Adv yr12 | AA-SL-yr12 | calc1–2 |
| `uSubstitution` | Spec yr12 | Ext1 yr12 | AA-SL-yr12, AA-HL-yr12 | calc2 |
| Inverse trig derivatives | Spec yr12 | Ext1 yr11 | AA-HL-yr11 | calc2 |
| Inverse trig integrals | Spec yr12 | Ext1 yr11 | AA-HL-yr11 | calc2 |
| `trigIdentity` | Spec yr12 | Ext1 yr12 | AA-HL-yr12 | calc2 |
| `integrationByParts` | Spec yr12 | Ext1 yr12 | AA-HL-yr12 | calc2 |
| `partialFractions` | Spec yr12 | Ext2 yr12 | AA-HL-yr12 | calc2 |
| Reduction formulae | Spec yr12 | Ext2 yr12 | AA-HL-yr12 | calc2 |

---

## Deferred curricula (specVersion 1 stubs)

The following course tags exist in the `COURSE_TAGS` enum and **must not be removed**, but have not been researched for Phase 1. Do not assign these tags in Phase 1 imports. Do not make syllabus claims about them in this document.

### QCE (Queensland)
Tags: `QCE-yr11`, `QCE-yr12`, `QCE-methods`, `QCE-specialist`
Not researched in specVersion 1.

### SACE / NT (South Australia / Northern Territory)
Tags: `SACE-yr11`, `SACE-yr12`, `SACE-methods`, `SACE-specialist`
Not researched in specVersion 1.

### WACE (Western Australia)
Tags: `WACE-yr11`, `WACE-yr12`, `WACE-methods`, `WACE-specialist`
Not researched in specVersion 1.

### TCE (Tasmania)
Tags: `TCE-yr11`, `TCE-yr12`, `TCE-methods`, `TCE-specialised`
Not researched in specVersion 1.

### ACT
Tags: `ACT-yr11`, `ACT-yr12`, `ACT-methods`, `ACT-specialist`
Not researched in specVersion 1.

### US AP Calculus
Tags: `AP-AB`, `AP-BC`
Not researched in specVersion 1. Existing seed questions (q1–q13) may carry these tags as early placeholders; treat them as approximate only.

---

## Human review checklist

Before approving `course-tags.md`:

- [ ] Every **in-scope** tag (`calc1`, `calc2`, `VCE-yr11`, `VCE-yr12`, `VCE-methods`, `VCE-specialist`, `HSC-yr11`, `HSC-yr12`, `HSC-advanced`, `HSC-ext1`, `HSC-ext2`, all 8 `IB-*` tags) has a full calculus techniques description
- [ ] Every **deferred** tag has an honest stub — no invented syllabus detail
- [ ] The cross-curriculum equivalence table covers all 11 method tags: `powerRule`, `simpleChainRule`, `chainRule`, `productRule`, `quotientRule`, `simpleUSub`, `uSubstitution`, `integrationByParts`, `partialFractions`, `trigIdentity`, `other`
- [ ] No applications, differential equations, or kinematics content has crept into technique descriptions
- [ ] Primary sources (VCAA study design, NESA syllabus, IB subject guide) are consistent with the technique scope described
