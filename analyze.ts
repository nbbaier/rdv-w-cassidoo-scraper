// analyze.ts

import { readdir } from "fs/promises";
import { JSDOM } from "jsdom";

const htmlDir = "./scraper/data/html";
const files = await readdir(htmlDir);

interface Analysis {
	date: string;
	questionInSection: boolean;
	questionBeforeSection: boolean;
	hasStrongInSection: boolean;
	hasThisWeeksQuestion: boolean;
	strongText?: string;
	format: "new" | "old" | "unknown";
}

const results: Analysis[] = [];

for (const file of files.sort()) {
	if (!file.endsWith(".html")) continue;

	const date = file.replace(".html", "");
	const html = await Bun.file(`${htmlDir}/${file}`).text();
	const { document } = new JSDOM(html).window;

	const body = document.querySelector(".message-body, .email-body-content");
	if (!body) {
		results.push({
			date,
			questionInSection: false,
			questionBeforeSection: false,
			hasStrongInSection: false,
			hasThisWeeksQuestion: false,
			format: "unknown",
		});
		continue;
	}

	const bodyHtml = body.innerHTML;
	const bodyText = body.textContent?.toLowerCase() || "";

	// Find the interview section
	const interviewSection = Array.from(
		document.querySelectorAll(".hr-section"),
	).find((e) =>
		e.querySelector("h2")?.textContent?.toLowerCase().includes("interview"),
	);

	// Check for "this week's question" or "here's this week's question"
	const hasThisWeeksQuestion = /(?:here'?s\s+)?this\s+week'?s\s+question/i.test(
		bodyText,
	);

	// Find position of "interview question" heading in raw HTML
	const interviewHeadingMatch = bodyHtml.match(
		/<h2[^>]*>[^<]*interview\s+question/i,
	);
	const interviewHeadingIndex = interviewHeadingMatch?.index ?? -1;

	// Find position of "this week's question" text
	const thisWeeksIndex = bodyHtml.toLowerCase().indexOf("this week's question");

	// Check if question appears BEFORE the interview heading
	const questionBeforeSection =
		thisWeeksIndex > -1 &&
		interviewHeadingIndex > -1 &&
		thisWeeksIndex < interviewHeadingIndex;

	// Check if question appears INSIDE the interview section
	const questionInSection =
		interviewSection?.textContent
			?.toLowerCase()
			.includes("this week's question") || false;

	// Check for <strong> tags in the interview section
	const strongsInSection = interviewSection?.querySelectorAll("strong") || [];
	const hasStrongInSection = strongsInSection.length > 0;

	// Get the longest <strong> text (likely the question)
	let strongText: string | undefined;
	let maxLen = 0;
	for (const s of strongsInSection) {
		const text = s.textContent?.trim() || "";
		if (text.length > maxLen) {
			maxLen = text.length;
			strongText = text.slice(0, 80) + (text.length > 80 ? "..." : "");
		}
	}

	// Determine format
	let format: "new" | "old" | "unknown" = "unknown";
	if (questionInSection && hasStrongInSection) {
		format = "new";
	} else if (questionBeforeSection) {
		format = "old";
	} else if (interviewSection) {
		format = hasStrongInSection ? "new" : "old";
	}

	results.push({
		date,
		questionInSection,
		questionBeforeSection,
		hasStrongInSection,
		hasThisWeeksQuestion,
		strongText,
		format,
	});
}

// Summary
const newFormat = results.filter((r) => r.format === "new");
const oldFormat = results.filter((r) => r.format === "old");
const unknown = results.filter((r) => r.format === "unknown");

console.log("\n=== SUMMARY ===");
console.log(`Total files: ${results.length}`);
console.log(`New format (question inside section): ${newFormat.length}`);
console.log(`Old format (question before section): ${oldFormat.length}`);
console.log(`Unknown: ${unknown.length}`);

// Find the transition point
console.log("\n=== FORMAT TRANSITIONS ===");
let lastFormat = results[0]?.format;
for (const r of results) {
	if (r.format !== lastFormat) {
		console.log(`${r.date}: ${lastFormat} -> ${r.format}`);
		lastFormat = r.format;
	}
}

// Show some examples of each
console.log("\n=== OLD FORMAT EXAMPLES ===");
oldFormat.slice(0, 5).forEach((r) => {
	console.log(`${r.date}: strongText="${r.strongText || "none"}"`);
});

console.log("\n=== NEW FORMAT EXAMPLES ===");
newFormat.slice(-5).forEach((r) => {
	console.log(`${r.date}: strongText="${r.strongText || "none"}"`);
});

// Flag potential problems
console.log("\n=== POTENTIAL ISSUES ===");
const issues = results.filter(
	(r) =>
		!r.hasThisWeeksQuestion && !r.hasStrongInSection && r.format !== "unknown",
);
if (issues.length > 0) {
	console.log("These might not have a detectable question:");
	issues.forEach((r) => {
		console.log(`  ${r.date}`);
	});
} else {
	console.log("None detected!");
}

// Write full results to JSON for further analysis
await Bun.write(
	"./scraper/data/analysis.json",
	JSON.stringify(results, null, 2),
);
console.log("\nFull results written to ./scraper/data/analysis.json");
const old = results.filter((r) => r.format === "old");
old.forEach((r) => {
	console.log(r.date, r.hasStrongInSection, r.strongText?.slice(0, 50));
});
