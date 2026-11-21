import { parseDocument } from "yaml";

// Keep the original YAML and every byte after its closing delimiter. Re-serializing
// the document would change dates, comments, quoting, examples, or whitespace.
const FRONTMATTER =
  /^(?<opening>---\r?\n)(?<yaml>[\s\S]*?)(?:\r?\n---(?:\r?\n|$))/u;

const UNSAFE_YAML = /^\s*(?:\{|\[|\.\.\.|&|\*)/mu;

export interface Document {
  body: string;
  data: Record<string, unknown>;
  insertAt: number;
  newline: string;
  raw: string;
}

export function readDocument(raw: string): Document {
  const match = FRONTMATTER.exec(raw);
  if (!match) {
    throw new Error("Missing complete frontmatter");
  }
  const yaml = parseDocument(match[2], { uniqueKeys: true });
  if (yaml.errors.length > 0) {
    throw new Error("Invalid or duplicate frontmatter keys");
  }
  const data: unknown = yaml.toJS({ maxAliasCount: 0 });
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Frontmatter must be a mapping");
  }
  // YAML flow mappings, aliases, and explicit document terminators cannot safely
  // be extended by appending block keys. Leave unusual documents for review.
  if (UNSAFE_YAML.test(match[2])) {
    throw new Error("Frontmatter requires manual review before extension");
  }
  return {
    body: raw.slice(match[0].length),
    data: data as Record<string, unknown>,
    insertAt: match[1].length + match[2].length,
    newline: match[1].includes("\r") ? "\r\n" : "\n",
    raw,
  };
}

export function addMetadata(
  document: Document,
  additions: { title?: string; topics?: string[] }
): string {
  const lines = Object.entries(additions).map(([key, value]) => {
    if (Object.hasOwn(document.data, key)) {
      throw new Error(`Refusing to replace existing ${key}`);
    }
    return `${key}: ${JSON.stringify(value)}`;
  });
  if (lines.length === 0) {
    return document.raw;
  }
  const next =
    document.raw.slice(0, document.insertAt) +
    document.newline +
    lines.join(document.newline) +
    document.raw.slice(document.insertAt);
  const parsed = readDocument(next);
  if (parsed.body !== document.body) {
    throw new Error("Body preservation check failed");
  }
  for (const [key, value] of Object.entries(document.data)) {
    if (JSON.stringify(parsed.data[key]) !== JSON.stringify(value)) {
      throw new Error(`Existing frontmatter changed: ${key}`);
    }
  }
  for (const [key, value] of Object.entries(additions)) {
    if (JSON.stringify(parsed.data[key]) !== JSON.stringify(value)) {
      throw new Error(`Could not safely append ${key}`);
    }
  }
  return next;
}
