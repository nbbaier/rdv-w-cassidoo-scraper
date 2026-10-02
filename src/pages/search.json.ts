import { getCollection } from "astro:content";
import { plainText } from "../lib/excerpt";

export async function GET() {
  const questions = await getCollection("questions");

  const searchIndex = questions.map((question) => {
    const stripped = plainText(question.body ?? "");

    return {
      slug: question.id,
      date: question.data.date.toISOString().split("T")[0],
      // Create a simple excerpt by removing markdown syntax and taking the first 200 chars
      excerpt: `${stripped.slice(0, 200)}...`,
      // Full plain-text body, lowercased, for full-text search matching
      text: stripped.toLowerCase(),
    };
  });

  // Sort by date descending
  searchIndex.sort((a, b) => b.date.localeCompare(a.date));

  return Response.json(searchIndex);
}
