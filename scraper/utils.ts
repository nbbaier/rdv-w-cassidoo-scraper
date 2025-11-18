import { Defuddle } from "defuddle/node";
import { JSDOM } from "jsdom";
import { remark } from "remark";
import remarkUnlink from "remark-unlink";

export interface Email {
	url: string;
	date: string;
	number: number;
}

export function wrapContentBetweenHRs(html: string | JSDOM) {
	let dom: JSDOM;

	if (typeof html === "string") {
		dom = new JSDOM(html);
	} else {
		dom = html;
	}

	const document = dom.window.document;
	const hrs = document.querySelectorAll("hr");

	if (hrs.length < 2) {
		return dom.serialize();
	}

	// Process pairs from end to beginning
	for (let i = hrs.length - 2; i >= 0; i--) {
		const startHR = hrs[i] as Node;
		const endHR = hrs[i + 1] as Node;

		if (!startHR?.parentNode || !endHR?.parentNode) {
			continue;
		}

		// Create wrapper
		const wrapper = document.createElement("div");
		wrapper.className = "hr-section";

		// Collect elements between hr tags
		let currentElement = startHR.nextSibling;
		const elementsToWrap = [];

		while (currentElement && currentElement !== endHR) {
			elementsToWrap.push(currentElement);
			currentElement = currentElement.nextSibling;
		}

		try {
			// Insert wrapper before the end HR
			endHR.parentNode.insertBefore(wrapper, endHR);

			// Clone and append elements to avoid DOM manipulation issues
			for (const element of elementsToWrap) {
				if (element.parentNode) {
					const clone = element.cloneNode(true);
					wrapper.appendChild(clone);
					element.parentNode.removeChild(element);
				}
			}
		} catch (error) {
			console.warn("Failed to wrap content between HRs:", error);
		}
	}

	return dom.serialize();
}

export function formatDate(input: string): string {
	const date = new Date(input);
	return date.toISOString().slice(0, 10);
}

export async function getQuestion(email: Email) {
	console.log(`Starting ${email.date} - ${email.number}`);
	const dom = await JSDOM.fromURL(email.url);
	const html = wrapContentBetweenHRs(dom);

	await Bun.write(`./scraper/data/html/${email.date}.html`, html);

	const { document } = new JSDOM(html).window;

	const question = Array.from(document.querySelectorAll(".hr-section")).find(
		(e) => e.querySelector("h2")?.innerHTML.toLowerCase().includes("interview"),
	);

	const result = await Defuddle(question?.innerHTML as string, email.url, {
		markdown: true,
	});

	const file = await remark().use(remarkUnlink).process(result.content);

	const output = `
---
url: ${email.url}
date: ${email.date}
number: ${email.number}
---

${String(file)}
		`;

	await Bun.write(`./src/content/questions/${email.date}.md`, output);
}
