import * as XLSX from 'xlsx'
import { typeOverrides, skipColumns } from '../config.js'

// Detection thresholds (tunable). The auto-detector errs toward "choice" only
// when answers clearly repeat; otherwise it falls back to a text list.
const MAX_CHOICE_OPTIONS = 15 // more distinct answers than this → treat as text
const PIE_DISTINCT_RATIO = 0.7 // distinct/total must be below this for a chart
const MULTI_REPEAT_RATIO = 0.5 // share of tokens that recur → multi-select
const MULTI_COMMA_RATIO = 0.1 // share of cells with a comma → multi-select

const norm = (s) => String(s ?? '').trim()
const lower = (s) => norm(s).toLowerCase()

function matchKey(header, keys) {
  const h = lower(header)
  for (const k of Object.keys(keys)) {
    const key = lower(k)
    if (h === key || h.startsWith(key)) return keys[k]
  }
  return null
}

function isSkipped(header) {
  const h = lower(header)
  return skipColumns.some((k) => {
    const key = lower(k)
    return h === key || h.startsWith(key)
  })
}

// Read an ArrayBuffer of an .xlsx into { questions, responseCount }.
export function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  // rows as arrays, blank cells preserved as ''
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false })
  if (!rows.length) return { questions: [], responseCount: 0 }

  const headers = rows[0].map(norm)
  const body = rows.slice(1).filter((r) => r.some((c) => norm(c) !== ''))

  const questions = []
  for (let col = 0; col < headers.length; col++) {
    const title = headers[col]
    if (!title || isSkipped(title)) continue

    const values = body.map((r) => norm(r[col])).filter((v) => v !== '')
    const override = matchKey(title, typeOverrides)
    if (override === 'hide') continue
    if (values.length === 0) continue // empty column → skip

    const q = buildQuestion(title, values, override)
    questions.push(q)
  }

  return { questions, responseCount: body.length }
}

function buildQuestion(title, values, override) {
  const total = values.length
  const type = override || detectType(values)

  if (type === 'multi') {
    return { title, type: 'multi', responses: total, options: tallyTokens(values) }
  }
  if (type === 'pie' || type === 'bar') {
    return { title, type, responses: total, options: tallyValues(values) }
  }
  // text list
  return { title, type: 'list', responses: total, answers: values }
}

function detectType(values) {
  const total = values.length
  if (total === 0) return 'list'

  const distinct = Object.keys(countBy(values)).length
  const commaCells = values.filter((v) => v.includes(',')).length
  const commaRatio = commaCells / total

  const distinctTokens = Object.keys(countBy(values.flatMap(splitTokens))).length

  // ── Case A: small, closed set of whole answers ──────────────────────────
  // Either single-choice (incl. options whose text contains commas) or a
  // checkbox question with few selected combinations. We tell them apart by
  // whether comma-splitting *reduces* the variety: a real checkbox's combos
  // are unions of a smaller option set (distinctTokens < distinct), whereas a
  // single-choice sentence with an internal comma splits into MORE fragments.
  if (distinct <= MAX_CHOICE_OPTIONS && distinct / total <= PIE_DISTINCT_RATIO) {
    if (commaRatio >= MULTI_COMMA_RATIO && distinctTokens < distinct) return 'multi'
    return 'pie'
  }

  // ── Case B: many distinct whole answers ─────────────────────────────────
  // Still a checkbox if the *tokens* form a small, recurring set (many combos,
  // few underlying options). Otherwise it's free text.
  const tokenCounts = countBy(values.flatMap(splitTokens))
  const repeatedTokens = Object.values(tokenCounts).filter((n) => n >= 2).length
  if (
    distinctTokens > 0 &&
    distinctTokens <= MAX_CHOICE_OPTIONS &&
    commaRatio >= MULTI_COMMA_RATIO &&
    repeatedTokens / distinctTokens >= MULTI_REPEAT_RATIO
  ) {
    return 'multi'
  }

  return 'list'
}

function splitTokens(value) {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t !== '')
}

function countBy(arr) {
  const m = Object.create(null)
  for (const v of arr) m[v] = (m[v] || 0) + 1
  return m
}

// Whole-answer tally → options sorted by count desc.
function tallyValues(values) {
  const counts = countBy(values)
  const total = values.length
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count, pct: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count)
}

// Token tally for multi-select. pct is relative to number of respondents,
// so it can sum to >100% — matching Google Forms checkbox behaviour.
function tallyTokens(values) {
  const tokens = values.flatMap(splitTokens)
  const counts = countBy(tokens)
  const respondents = values.length
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count, pct: respondents ? (count / respondents) * 100 : 0 }))
    .sort((a, b) => b.count - a.count)
}
