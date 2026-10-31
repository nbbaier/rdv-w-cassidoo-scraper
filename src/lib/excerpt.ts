/**
 * Strips basic markdown syntax and collapses whitespace into a single
 * plain-text line, suitable for excerpts and full-text search matching.
 */
const MARKDOWN_CHARS = /[#*`[\]()]/gu;

export function plainText(body: string): string {
  return body.replace(MARKDOWN_CHARS, "").replace(/\n+/gu, " ").trim();
}
