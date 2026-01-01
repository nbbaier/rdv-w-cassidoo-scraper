import { Defuddle } from "defuddle/node";
import { JSDOM } from "jsdom";
import { remark } from "remark";
import remarkUnlink from "remark-unlink";

export interface Email {
	url: string;
	date: string;
	number: number;
}

const blockTags = new Set([
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6",
	"UL",
	"OL",
	"DIV",
	"BLOCKQUOTE",
	"PRE",
	"HR",
	"P",
]);

function normalizeBrsToParagraphs(element: Element): void {
	const doc = element.ownerDocument;
	const result: Node[] = [];
	let currentParagraph: Node[] = [];

	const flushParagraph = () => {
		if (currentParagraph.length === 0) return;

		const hasContent = currentParagraph.some(
			(node) =>
				node.nodeType === 1 ||
				(node.nodeType === 3 && node.textContent?.trim()),
		);

		if (hasContent) {
			const p = doc.createElement("p");
			for (const node of currentParagraph) {
				p.appendChild(node.cloneNode(true));
			}
			result.push(p);
		}
		currentParagraph = [];
	};

	for (const node of Array.from(element.childNodes)) {
		if (node.nodeType === 1) {
			const el = node as Element;
			if (el.tagName === "BR") {
				flushParagraph();
			} else if (blockTags.has(el.tagName)) {
				flushParagraph();
				result.push(node.cloneNode(true));
			} else {
				currentParagraph.push(node);
			}
		} else if (node.nodeType === 3) {
			currentParagraph.push(node);
		}
	}

	flushParagraph();

	element.innerHTML = "";
	for (const node of result) {
		element.appendChild(node);
	}
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

export async function getHTML(url: string) {
	const pageText = await fetch(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.5",
			Referer: "https://google.com",
			"Cache-Control": "no-cache",
		},
	}).then((res) => res.text());

	const dom = new JSDOM(pageText);
	const document = dom.window.document;

	// Strip non-content elements
	const junk = document.querySelectorAll(
		"script, style, noscript, iframe, svg, nav, header, footer, [hidden]",
	);
	junk.forEach((el) => {
		el.remove();
	});

	const html = wrapContentBetweenHRs(dom);
	return html;
}

export async function getQuestion(email: Email) {
	console.log(`Starting ${email.date} - ${email.number}`);

	const html = await getHTML(email.url);
	await Bun.write(`./scraper/data/html/${email.date}.html`, html);

	const { document } = new JSDOM(html).window;

	// Find the interview section
	const interviewSection = Array.from(
		document.querySelectorAll(".hr-section"),
	).find((e) =>
		e.querySelector("h2")?.textContent?.toLowerCase().includes("interview"),
	);

	if (!interviewSection) {
		console.log(`No interview section found for ${email.date}`);
		return;
	}

	// Check if this section only has "last week/time" answers (no new question)
	const sectionText = interviewSection.textContent?.toLowerCase() || "";
	const hasLastWeek =
		sectionText.includes("last week") || sectionText.includes("last time");
	const hasThisWeek = sectionText.includes("this week's question");

	// If it mentions last week but NOT this week's question, it's probably answers-only
	if (hasLastWeek && !hasThisWeek) {
		// Check if there's a <strong> tag (which would contain the new question)
		const strongs = interviewSection.querySelectorAll("strong");
		const hasQuestionStrong = Array.from(strongs).some(
			(s) => (s.textContent?.length || 0) > 30,
		);

		if (!hasQuestionStrong) {
			console.log(`Skipping ${email.date} - only has last week's answers`);
			return;
		}
	}

	// Find the question in <strong> tag
	const strongTags = interviewSection.querySelectorAll("strong");
	let questionStrong: Element | null = null;
	let maxLen = 0;

	for (const s of strongTags) {
		const text = s.textContent?.trim() || "";
		if (text.length > maxLen && text.length > 30) {
			maxLen = text.length;
			questionStrong = s;
		}
	}

	// Fallback for 2017-06-23 style: no <strong>, question is plain text after h2
	if (!questionStrong) {
		const h2 = interviewSection.querySelector("h2");
		if (h2) {
			// Get all text between h2 and "Example:" or end of section
			const sectionHtml = interviewSection.innerHTML;
			const afterH2 = sectionHtml.split(/<\/h2>/i)[1];
			if (afterH2) {
				const questionMatch = afterH2.match(/^([\s\S]*?)(?:Example|<hr|$)/i);
				if (questionMatch && questionMatch[1].trim().length > 30) {
					const questionDiv = document.createElement("div");
					questionDiv.innerHTML = `<h2>Interview question of the week</h2><p>${questionMatch[1].trim()}</p>`;

					// Process and save...
					const result = await Defuddle(questionDiv.innerHTML, email.url, {
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
					return;
				}
			}
		}

		console.log(`No question found for ${email.date}`);
		return;
	}

	// Build question content from <strong> tag
	const questionDiv = document.createElement("div");
	questionDiv.innerHTML = `<h2>Interview question of the week</h2>`;

	const questionParagraph =
		questionStrong.closest("p") || questionStrong.parentElement;
	if (questionParagraph) {
		questionDiv.appendChild(questionParagraph.cloneNode(true));
	}

	// Add following siblings (examples, code blocks) until submission text
	let sibling = questionParagraph?.nextElementSibling;
	while (sibling) {
		const text = sibling.textContent?.toLowerCase() || "";
		if (
			text.includes("submit your answers") ||
			text.includes("replying to this email")
		) {
			break;
		}
		questionDiv.appendChild(sibling.cloneNode(true));
		sibling = sibling.nextElementSibling;
	}

	normalizeBrsToParagraphs(questionDiv);

	const result = await Defuddle(questionDiv.innerHTML, email.url, {
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

export async function getQuestionMd(email: Email) {
	console.log(`Starting ${email.date} - ${email.number}`);

	// Fetch and get the main content
	const res = await fetch(email.url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			Referer: "https://google.com",
		},
	});
	const html = await res.text();
	const { document } = new JSDOM(html).window;

	// Get the email body content
	const content = document.querySelector(".email-body-content, .message-body");
	if (!content) {
		console.log(`No content found for ${email.date}`);
		return;
	}

	// Convert to markdown first
	const result = await Defuddle(content.innerHTML, email.url, {
		markdown: true,
	});
	const markdown = result.content;

	// 	// Now extract the question section using simple text patterns
	// 	const lines = markdown.split("\n");

	// 	let inInterviewSection = false;
	// 	const questionLines: string[] = [];
	// 	let foundQuestion = false;

	// 	for (const line of lines) {
	// 		// Start of interview section
	// 		if (/^##\s*interview\s+question/i.test(line)) {
	// 			inInterviewSection = true;
	// 			questionLines.push("## Interview question of the week");
	// 			continue;
	// 		}

	// 		// End of interview section (next ## heading or ---)
	// 		if (inInterviewSection && (/^##\s+/i.test(line) || /^---/.test(line))) {
	// 			break;
	// 		}

	// 		if (inInterviewSection) {
	// 			// Skip "last week/time" preamble until we hit "this week's question" or a **bold** question
	// 			if (!foundQuestion) {
	// 				if (/this\s+week'?s\s+question/i.test(line)) {
	// 					foundQuestion = true;
	// 					continue; // Skip the "This week's question:" line itself
	// 				}
	// 				// Found bold text that's likely the question (long enough)
	// 				if (/^\*\*[^*]{30,}/.test(line)) {
	// 					foundQuestion = true;
	// 				}
	// 			}

	// 			if (foundQuestion) {
	// 				// Stop at submission instructions
	// 				if (/submit your answers|replying to this email/i.test(line)) {
	// 					break;
	// 				}
	// 				questionLines.push(line);
	// 			}
	// 		}
	// 	}

	// 	if (questionLines.length <= 1) {
	// 		console.log(`No question found for ${email.date}`);
	// 		return;
	// 	}

	// 	// Clean up and remove links
	// 	const questionMd = questionLines.join("\n");
	// 	const file = await remark().use(remarkUnlink).process(questionMd);

	// 	const output = `---
	// url: ${email.url}
	// date: ${email.date}
	// number: ${email.number}
	// ---

	// ${String(file).trim()}
	// `;

	// 	await Bun.write(`./src/content/questions/${email.date}.md`, output);
	// 	console.log(`Saved ${email.date}`);
	console.log(markdown);
}
