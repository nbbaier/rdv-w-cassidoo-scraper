import { describe, expect, test } from "bun:test";
import {
  clefScores,
  metrics,
  type Question,
  questionBody,
  type Study,
  selectTopics,
  validateMetadata,
  validateStudy,
} from "./core";
import studyData from "./study.json" with { type: "json" };

const vocabulary = {
  arrays: "Sequences",
  regex: "Regular expressions",
  strings: "Text",
  trees: "Tree data structures",
};

describe("evaluation boundaries", () => {
  test("preserves body bytes after frontmatter, including line endings", () => {
    expect(
      questionBody("---\r\ndate: 2026-01-01\r\n---\r\n\r\n**Question**\r\n")
    ).toBe("\r\n**Question**\r\n");
    expect(() => questionBody("---\nmissing closing fence")).toThrow();
  });
  test("checks the real 30-question study and rejects duplicate dates", () => {
    validateStudy(studyData as Study);
    const duplicate = structuredClone(studyData) as Study;
    duplicate.cases[1].date = duplicate.cases[0].date;
    expect(() => validateStudy(duplicate)).toThrow("unique");
  });
  test("accepts only usable generated metadata", () => {
    expect(
      validateMetadata(
        { title: "Reverse a string", topics: ["strings"] },
        vocabulary
      ).title
    ).toBe("Reverse a string");
    for (const value of [
      { title: "", topics: ["arrays"] },
      { title: "a".repeat(61), topics: ["arrays"] },
      { title: "Title", topics: ["unknown"] },
      { title: "Title", topics: ["arrays", "arrays"] },
      { title: "Title", topics: [] },
      { title: "Title", topics: Object.keys(vocabulary) },
    ]) {
      expect(() => validateMetadata(value, vocabulary)).toThrow();
    }
    expect(
      validateMetadata({ title: "Title only" }, vocabulary, true).topics
    ).toEqual([]);
  });
  test("parses the actual Clef answer shape and rejects incomplete scores", () => {
    expect(
      clefScores(
        { arrays: { noul: 0.8, type: "noul" } },
        { arrays: "Sequences" }
      )
    ).toEqual({ arrays: 0.8 });
    for (const answer of [
      0.8,
      { noul: 1.1, type: "noul" },
      { noul: Number.NaN, type: "noul" },
      { noul: 0.9, type: "choice" },
    ]) {
      expect(() =>
        clefScores({ arrays: answer }, { arrays: "Sequences" })
      ).toThrow();
    }
    expect(() => clefScores({}, vocabulary)).toThrow();
  });
  test("leaves low-confidence input untagged and caps multi-label predictions", () => {
    expect(selectTopics({ arrays: 0.2, strings: 0.1 }, 0.5)).toEqual([]);
    expect(
      selectTopics({ arrays: 0.8, regex: 0.6, strings: 0.9, trees: 0.7 }, 0.5)
    ).toEqual(["strings", "arrays", "trees"]);
  });
  test("counts missing labels and prohibited topics rather than rewarding empty output", () => {
    const questions: Question[] = [
      {
        body: "Print a pine tree",
        date: "2017-12-18",
        expectedTopics: ["strings"],
        forbiddenTopics: ["trees"],
        notes: "",
        sha256: "test",
        split: "evaluation",
      },
    ];
    const wrong = metrics(questions, { "2017-12-18": ["trees"] });
    expect(wrong).toMatchObject({
      f1: 0,
      falseNegatives: 1,
      falsePositives: 1,
      forbiddenSelections: 1,
    });
    expect(metrics(questions, {}).recall).toBe(0);
    expect(metrics(questions, { "2017-12-18": ["strings"] }).f1).toBe(1);
  });
});
