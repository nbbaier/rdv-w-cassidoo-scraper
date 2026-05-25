import { getCollection } from "astro:content";

export async function GET() {
  const questions = await getCollection("questions");

  const searchIndex = questions.map((question) => {
    return {
      slug: question.id,
      date: question.data.date.toISOString().split("T")[0],
      number: question.data.number,
      // Create a simple excerpt by removing markdown syntax and taking the first 200 chars
      excerpt: `${(question.body ?? "")
        .replace(/[#*`[\]()]/g, "") // Remove basic markdown chars
        .replace(/\n+/g, " ") // Replace newlines with spaces
        .trim()
        .slice(0, 200)}...`,
    };
  });

  // Sort by date descending
  searchIndex.sort((a, b) => b.date.localeCompare(a.date));

  return Response.json(searchIndex);
}
