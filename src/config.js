// ── Manual configuration ──────────────────────────────────────────────
// The app auto-detects each question's type, but you can override any of it here.
//
// Keys are matched against the question text (the column header in the sheet),
// trimmed. Matching is case-insensitive and also matches if the header *starts
// with* the key, so you don't have to paste the whole long question.
//
// Allowed values:
//   'pie'   → single-choice pie chart
//   'bar'   → single-choice horizontal bar chart
//   'multi' → checkbox / multi-select (comma-separated), horizontal bars
//   'list'  → list of free-text answers
//   'hide'  → don't show this column at all
export const typeOverrides = {
  // 1–5 rating scales → Google Forms shows these as bar charts.
  'Na stupnici 1–5 vyplň': 'bar',
  // Social-media frequency grid → bars read better than 8 separate pies.
  'Na jakých sociálních sítích jsi a kolik času tam trávíš': 'bar',
  // Single-choice statement whose options contain internal commas.
  'Které z následujících tvrzení nejlépe popisuje': 'pie',
  // Real checkbox questions → multi-select bars.
  'Zaškrtni, o co máš zájem': 'multi',
  // Price scales (choice + free "Other") → aggregate as bars instead of a list.
  'Cena 390 Kč za koncert': 'bar',
  'Cena 390 Kč za divadelní': 'bar',
  // Contains email addresses → keep off a public page.
  'Tvůj email': 'hide',
}

// Columns to always ignore (metadata added by Google Forms). Matched the same
// way as above (case-insensitive, prefix match).
export const skipColumns = [
  'Timestamp',
  'Časová značka',
  'Email Address',
  'Email address',
  'E-mailová adresa',
  'Jméno',
  'Username',
  'ID',
]

// Page heading shown at the top.
export const pageTitle = 'ARCHA+'
export const pageSubtitle = 'Výsledky dotazníku'

// Path (relative to the site base) of the encrypted data file bundled with the
// app. Created by `node encrypt.mjs`. The plain .xlsx is never shipped.
export const encryptedUrl = 'data.enc'
