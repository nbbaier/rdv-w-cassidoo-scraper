export interface SampleCase {
  date: string;
  expectedTopics: string[];
  forbiddenTopics: string[];
  notes: string;
  split: "calibration" | "evaluation";
}

export interface Study {
  cases: SampleCase[];
  referenceStatus: string;
  revision: string;
  titleModel: string;
  topicModel: string;
  topics: Record<string, string>;
}

export interface Question extends SampleCase {
  body: string;
  sha256: string;
}

export interface Metadata {
  title: string;
  topics: string[];
}

export interface Metrics {
  count: number;
  f1: number;
  falseNegatives: number;
  falsePositives: number;
  forbiddenSelections: number;
  precision: number;
  recall: number;
  truePositives: number;
}

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u;

export function questionBody(raw: string): string {
  const match = FRONTMATTER.exec(raw);
  if (!match) {
    throw new Error("Question has no complete frontmatter block");
  }
  return raw.slice(match[0].length);
}

export function validateStudy(study: Study): void {
  const vocabulary = new Set(Object.keys(study.topics));
  if (study.cases.length !== 30 || vocabulary.size !== 26) {
    throw new Error(
      "Comparison requires exactly 30 Questions and 26 draft Topics"
    );
  }
  if (new Set(study.cases.map((item) => item.date)).size !== 30) {
    throw new Error("Sample dates must be unique");
  }
  for (const item of study.cases) {
    const labels = [...item.expectedTopics, ...item.forbiddenTopics];
    if (labels.some((topic) => !vocabulary.has(topic))) {
      throw new Error(`Unknown reference Topic for ${item.date}`);
    }
    if (
      item.expectedTopics.some((topic) => item.forbiddenTopics.includes(topic))
    ) {
      throw new Error(`Conflicting reference Topics for ${item.date}`);
    }
  }
}

export function validateMetadata(
  value: unknown,
  vocabulary: Record<string, string>,
  titleOnly = false
): Metadata {
  if (typeof value !== "object" || value === null) {
    throw new Error("Metadata must be an object");
  }
  const item = value as Record<string, unknown>;
  if (
    typeof item.title !== "string" ||
    !item.title.trim() ||
    item.title.length > 60
  ) {
    throw new Error("Title must contain 1–60 characters");
  }
  const topics = titleOnly ? [] : item.topics;
  if (
    !Array.isArray(topics) ||
    (!titleOnly && (topics.length < 1 || topics.length > 3))
  ) {
    throw new Error("Metadata requires 1–3 Topics");
  }
  if (
    topics.some(
      (topic) => typeof topic !== "string" || !Object.hasOwn(vocabulary, topic)
    )
  ) {
    throw new Error("Metadata contains an unknown Topic");
  }
  if (new Set(topics).size !== topics.length) {
    throw new Error("Metadata contains duplicate Topics");
  }
  return { title: item.title.trim(), topics: topics as string[] };
}

export function clefScores(
  value: unknown,
  vocabulary: Record<string, string>
): Record<string, number> {
  if (typeof value !== "object" || value === null) {
    throw new Error("Clef returned no answers object");
  }
  const answers = value as Record<string, unknown>;
  const scores: Record<string, number> = {};
  for (const topic of Object.keys(vocabulary)) {
    const answer = answers[topic];
    if (typeof answer !== "object" || answer === null) {
      throw new Error(`Clef omitted ${topic}`);
    }
    const { noul, type } = answer as Record<string, unknown>;
    if (
      type !== "noul" ||
      typeof noul !== "number" ||
      !Number.isFinite(noul) ||
      noul < 0 ||
      noul > 1
    ) {
      throw new Error(`Clef returned an invalid probability for ${topic}`);
    }
    scores[topic] = noul;
  }
  return scores;
}

export function selectTopics(
  scores: Record<string, number>,
  threshold: number
): string[] {
  return Object.entries(scores)
    .filter(([, score]) => score >= threshold)
    .sort(([left, a], [right, b]) => b - a || left.localeCompare(right))
    .slice(0, 3)
    .map(([topic]) => topic);
}

export function metrics(
  questions: Question[],
  predictions: Record<string, string[]>
): Metrics {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let forbiddenSelections = 0;
  for (const question of questions) {
    const predicted = new Set(predictions[question.date] ?? []);
    const expected = new Set(question.expectedTopics);
    for (const topic of predicted) {
      if (expected.has(topic)) {
        truePositives += 1;
      } else {
        falsePositives += 1;
      }
      if (question.forbiddenTopics.includes(topic)) {
        forbiddenSelections += 1;
      }
    }
    for (const topic of expected) {
      if (!predicted.has(topic)) {
        falseNegatives += 1;
      }
    }
  }
  const precision = truePositives / (truePositives + falsePositives || 1);
  const recall = truePositives / (truePositives + falseNegatives || 1);
  return {
    count: questions.length,
    f1: (2 * precision * recall) / (precision + recall || 1),
    falseNegatives,
    falsePositives,
    forbiddenSelections,
    precision,
    recall,
    truePositives,
  };
}
