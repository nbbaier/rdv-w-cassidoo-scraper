import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const questions = defineCollection({
	loader: glob({
		pattern: "**/*.md",
		base: "./src/content/questions",
		generateId: ({ entry }) => entry.replace(/\.md$/, ""),
	}),
	schema: z.object({
		url: z.string().url(),
		date: z.coerce.date(),
		number: z.number(),
	}),
});

export const collections = {
	questions,
};
