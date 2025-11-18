import { defineCollection, z } from "astro:content";

const questions = defineCollection({
	type: "content",
	schema: z.object({
		url: z.string().url(),
		date: z.date(),
		number: z.number(),
	}),
});

export const collections = {
	questions,
};
