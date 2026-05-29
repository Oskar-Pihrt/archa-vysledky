# ARCHA+ — Výsledky dotazníku

A Vue 3 + Vite app that reads a Google Forms `.xlsx` response export and renders
it as a Forms-style results page: pie charts for single-choice questions,
horizontal bars for rating scales and checkbox (multi-select) questions, and
lists for free-text answers.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

The page loads `public/sheet.xlsx` by default. You can also click **“Nahrát jiný
soubor (.xlsx)”** to preview any other export in the browser.

## How question types are decided

Each column is auto-detected (single-choice → pie, checkbox → bars, rating →
bars, free text → list). You can override any column in [`src/config.js`](src/config.js):

- `typeOverrides` — force a column to `'pie'`, `'bar'`, `'multi'`, `'list'`, or
  `'hide'`. Keys match the question text case-insensitively and by prefix, so a
  short prefix covers a whole grid of related columns.
- `skipColumns` — metadata columns to ignore (timestamp, email, …).

Email column is hidden by default so personal data stays off a public page.

## Update the data

Replace `public/sheet.xlsx` with a new export and rebuild. Empty columns and
columns with zero responses are skipped automatically.

## Deploy to GitHub Pages

The Vite `base` is configurable for project pages:

```bash
VITE_BASE=/<repo-name>/ npm run build
```

This produces `dist/`. A GitHub Actions workflow can publish it on every push
(added during deployment setup).
