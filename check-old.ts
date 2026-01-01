// check-old.ts
import { JSDOM } from "jsdom";

const oldDates = [
	"2017-06-23",
	"2017-09-30",
	"2017-10-08",
	"2017-10-15",
	"2017-10-22",
	"2017-12-17",
	"2018-01-21",
	"2018-06-11",
	"2018-07-15",
];

for (const date of oldDates) {
	const html = await Bun.file(`./scraper/data/html/${date}.html`).text();
	const { document } = new JSDOM(html).window;

	const interviewSection = Array.from(
		document.querySelectorAll(".hr-section"),
	).find((e) =>
		e.querySelector("h2")?.textContent?.toLowerCase().includes("interview"),
	);

	console.log(`\n=== ${date} ===`);

	if (!interviewSection) {
		console.log("No interview section found");
		continue;
	}

	// Show the text content (truncated)
	const text = interviewSection.textContent?.trim().slice(0, 300);
	console.log(text);
}
