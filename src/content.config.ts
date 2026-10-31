import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
    url: z.url(),
  }),
});

export const collections = {
  questions,
};
