import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { TOPIC_IDS, validTitle, validTopics } from "./topics";

const MD_EXTENSION = /\.md$/u;

const questions = defineCollection({
  loader: glob({
    base: "./src/content/questions",
    generateId: ({ entry }) => entry.replace(MD_EXTENSION, ""),
    pattern: "**/*.md",
  }),
  schema: z.object({
    date: z.coerce.date(),
    number: z.number(),
    title: z
      .string()
      .refine(validTitle, "Title must contain 1–60 characters")
      .optional(),
    topics: z
      .array(z.enum(TOPIC_IDS))
      .refine(validTopics, "Expected 1–3 unique Topics")
      .optional(),
    url: z.url(),
  }),
});

export const collections = {
  questions,
};
