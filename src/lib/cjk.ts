// ─────────────────────────────────────────────────────────────────────────
// Shared CJK-aware helpers.
//
// Used across renderers (Short, Fill, Ordering, Reading, …) and scoring
// plugins (short, fill, cloze) so the definition of "what counts as
// Chinese input" stays in one place. Any renderer that shows or counts
// user-written text should import from here — never re-invent the regex.
//
// Codepoint coverage — everything Simplified/Traditional Chinese, Japanese
// kanji + kana, and Korean hanja typed by a Standard-1-through-6 student
// could realistically produce:
//   U+3400–U+4DBF  CJK Extension A                 (rarer characters, place-names)
//   U+4E00–U+9FFF  CJK Unified Ideographs (main)   (99% of daily use)
//   U+F900–U+FAFF  CJK Compatibility Ideographs    (dupes of common chars, still typed)
//   U+3040–U+309F  Hiragana                        (Japanese-tinged content)
//   U+30A0–U+30FF  Katakana                        (loanwords / stylised)
//   U+3000–U+303F  CJK Symbols & Punctuation       (「」、。 etc.)
//   U+FF00–U+FFEF  Fullwidth ASCII                 (，．！ typed on Chinese IMEs)
//
// Uses Unicode property escapes (`\p{Script=Han}`) is *possible* but not
// yet universally supported across every browser/runtime + it wouldn't
// pick up kana. The explicit ranges below are safe on every modern JS
// engine and match the code-point set students actually type.
// ─────────────────────────────────────────────────────────────────────────

// Any CJK ideograph or kana (excludes CJK punctuation — punctuation
// alone shouldn't flip a text to CJK mode).
const CJK_CHAR_RANGES = "㐀-䶿一-鿿豈-﫿぀-ゟ゠-ヿ";

// CJK punctuation + fullwidth ASCII (stripped before counting so「，。」etc.
// don't inflate 字-count).
const CJK_PUNCT_RANGES = "　-〿＀-￯";

const CJK_ANY_RE = new RegExp(`[${CJK_CHAR_RANGES}]`);
const CJK_ANY_GLOBAL = new RegExp(`[${CJK_CHAR_RANGES}]`, "g");
const CJK_PUNCT_GLOBAL = new RegExp(`[${CJK_PUNCT_RANGES}]`, "g");

/** Does the text contain any CJK ideograph or kana? */
export function hasCJK(text: string | null | undefined): boolean {
  if (!text) return false;
  return CJK_ANY_RE.test(text);
}

/**
 * CJK-aware "word/字" count. Chinese has no spaces between words, so each
 * CJK codepoint is one unit. Latin runs are counted as whitespace-
 * separated chunks. Mixed text is supported.
 *
 * Examples:
 *   countWordsSmart("汉咯")                    →  2
 *   countWordsSmart("我喜欢吃苹果，因为它很甜。")→ 11
 *   countWordsSmart("hello world")             →  2
 *   countWordsSmart("我喜欢 apple pie")        →  5  (3 CJK + 2 latin chunks)
 *   countWordsSmart("，。！？")                 →  0  (punctuation is not a 字)
 *   countWordsSmart("")                         →  0
 */
export function countWordsSmart(text: string | null | undefined): number {
  const t = String(text ?? "").trim();
  if (t === "") return 0;
  // Strip Chinese/full-width punctuation before deciding between Chinese
  // and whitespace counting. Otherwise input such as "，。！？" contains no
  // Han character and incorrectly falls through as one Latin "word".
  const countable = t.replace(CJK_PUNCT_GLOBAL, " ").trim();
  if (countable === "") return 0;
  if (!CJK_ANY_RE.test(countable)) return countable.split(/\s+/).length;
  const cjkChars = (countable.match(CJK_ANY_GLOBAL) ?? []).length;
  const latin = countable.replace(CJK_ANY_GLOBAL, " ").trim();
  const latinChunks = latin === "" ? 0 : latin.split(/\s+/).length;
  return cjkChars + latinChunks;
}

/**
 * Whitespace-normalising comparator for fill/cloze answers.
 *
 * English answers collapse internal whitespace ("  hello   world " →
 * "hello world"), so student spacing doesn't blow the compare.
 * Chinese answers strip ALL whitespace (including single spaces), because
 * a student who types "我 是 学 生" separating each 字 with a space still
 * means "我是学生" — the canonical form has no spaces at all.
 */
export function normaliseAnswer(text: string): string {
  const s = String(text ?? "").trim();
  if (s === "") return "";
  if (CJK_ANY_RE.test(s)) {
    // Chinese: strip all whitespace + drop fullwidth spaces.
    return s.replace(/\s+/g, "").replace(/[　]/g, "");
  }
  return s.replace(/\s+/g, " ");
}

/**
 * Space-safe join for ordering/word-reorder renderers. In Chinese there
 * is no space between tokens (每个字紧挨着写); in English tokens get an
 * ASCII space.
 */
export function joinTokensSmart(tokens: string[]): string {
  if (tokens.length === 0) return "";
  const anyCJK = tokens.some((t) => CJK_ANY_RE.test(t));
  return tokens.join(anyCJK ? "" : " ");
}
