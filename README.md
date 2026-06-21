# Practice Calculus

Practice calculus problems filtered by curriculum, topic, and technique. Pick your filters, work through randomly selected questions, and reveal step-by-step solutions when you need them.

## Features

- **Filter by what you're studying** — course (VCE, HSC, AP, IB, and more), topic (differentiation / integration), and method (power rule, chain rule, u-substitution, etc.)
- **Smart filter chips** — only tags that match your current selection appear, so you never see empty options
- **Random practice loop** — start a session and press Enter or click for the next question from your filtered pool
- **LaTeX rendering** — questions and answers use standard `$...$` and `$$...$$` math notation
- **Optional worked solutions** — step-by-step markdown solutions for many questions

## Quick start

```bash
npm install
npm run dev    # http://localhost:3000
```

Other useful commands:

```bash
npm run build
npm run lint
```

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **KaTeX**.

## Project layout (brief)

| Path | What it is |
| --- | --- |
| `data/questions.json` | Question bank |
| `data/solutions/` | Optional worked solutions (markdown) |
| `src/app/` | Next.js app entry |
| `src/components/` | Practice UI |

## Contributing

If you're editing code, question data, or tags, read **`AGENTS.md`** first. It covers architecture, the tag system, data formats, common pitfalls, and planned work.

For course-tagging rules when adding questions, see **`data/course-tags.md`**.
