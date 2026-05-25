import { Defuddle } from "defuddle/node";
import { JSDOM } from "jsdom";
import { remark } from "remark";
import remarkUnlink from "remark-unlink";

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

function wrapContentBetweenHRs(dom: JSDOM): void {
	const document = dom.window.document;
	const hrs = document.querySelectorAll("hr");
	if (hrs.length < 2) return;

	for (let i = hrs.length - 2; i >= 0; i--) {
		const startHR = hrs[i] as Node;
		const endHR = hrs[i + 1] as Node;
		if (!startHR?.parentNode || !endHR?.parentNode) continue;

		const wrapper = document.createElement("div");
		wrapper.className = "hr-section";

		let currentElement = startHR.nextSibling;
		const elementsToWrap: Node[] = [];
		while (currentElement && currentElement !== endHR) {
			elementsToWrap.push(currentElement);
			currentElement = currentElement.nextSibling;
		}

		endHR.parentNode.insertBefore(wrapper, endHR);
		for (const element of elementsToWrap) {
			if (element.parentNode) {
				const clone = element.cloneNode(true);
				wrapper.appendChild(clone);
				element.parentNode.removeChild(element);
			}
		}
	}
}

export type ExtractResult =
	| { status: "ok"; markdown: string }
	| { status: "skipped"; reason: string }
	| { status: "failed"; reason: string };

export async function extractQuestion(
	descriptionHtml: string,
	sourceUrl: string,
): Promise<ExtractResult> {
	const dom = new JSDOM(
		`<!doctype html><html><body>${descriptionHtml}</body></html>`,
	);
	wrapContentBetweenHRs(dom);
	const { document } = dom.window;

	const interviewSection = Array.from(
		document.querySelectorAll(".hr-section"),
	).find((e) =>
		e.querySelector("h2")?.textContent?.toLowerCase().includes("interview"),
	);

	if (!interviewSection) {
		return { status: "failed", reason: "no interview section" };
	}

	const sectionText = interviewSection.textContent?.toLowerCase() || "";
	const hasLastWeek =
		sectionText.includes("last week") || sectionText.includes("last time");
	const hasThisWeek = sectionText.includes("this week's question");

	if (hasLastWeek && !hasThisWeek) {
		const strongs = interviewSection.querySelectorAll("strong");
		const hasQuestionStrong = Array.from(strongs).some(
			(s) => (s.textContent?.length || 0) > 30,
		);
		if (!hasQuestionStrong) {
			return { status: "skipped", reason: "answers-only" };
		}
	}

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

	// Fallback: no <strong>, plain-text question after the h2 (e.g. 2017-06-23 style)
	if (!questionStrong) {
		const h2 = interviewSection.querySelector("h2");
		if (h2) {
			const sectionHtml = interviewSection.innerHTML;
			const afterH2 = sectionHtml.split(/<\/h2>/i)[1];
			if (afterH2) {
				const questionMatch = afterH2.match(/^([\s\S]*?)(?:Example|<hr|$)/i);
				if (questionMatch && questionMatch[1].trim().length > 30) {
					const questionDiv = document.createElement("div");
					questionDiv.innerHTML = `<h2>Interview question of the week</h2><p>${questionMatch[1].trim()}</p>`;
					const wrapped = `<!doctype html><html><body>${questionDiv.innerHTML}</body></html>`;
					const result = await Defuddle(wrapped, sourceUrl, {
						markdown: true,
					});
					const file = await remark().use(remarkUnlink).process(result.content);
					return { status: "ok", markdown: String(file).trim() };
				}
			}
		}
		return { status: "failed", reason: "no question found" };
	}

	const questionDiv = document.createElement("div");
	questionDiv.innerHTML = `<h2>Interview question of the week</h2>`;

	// Early-era issues (2017-2018) lack a <p> wrapper around the question; the
	// <strong> is a direct child of the .hr-section. In that case closest("p")
	// is null and we must NOT fall back to parentElement, which would pull in
	// the section's own <h2> and let the sibling walk escape into the next
	// .hr-section.
	const questionParagraph = questionStrong.closest("p");
	let walkAnchor: Element;
	if (questionParagraph && questionParagraph !== interviewSection) {
		questionDiv.appendChild(questionParagraph.cloneNode(true));
		walkAnchor = questionParagraph;
	} else {
		const p = document.createElement("p");
		p.appendChild(questionStrong.cloneNode(true));
		questionDiv.appendChild(p);
		walkAnchor = questionStrong;
	}

	let sibling = walkAnchor.nextElementSibling;
	while (sibling && interviewSection.contains(sibling)) {
		const text = sibling.textContent?.toLowerCase() || "";
		if (
			text.includes("submit your answers") ||
			text.includes("replying to this email")
		) {
			break;
		}
		if (sibling.tagName !== "H2") {
			questionDiv.appendChild(sibling.cloneNode(true));
		}
		sibling = sibling.nextElementSibling;
	}

	normalizeBrsToParagraphs(questionDiv);

	const wrapped = `<!doctype html><html><body>${questionDiv.innerHTML}</body></html>`;
	const result = await Defuddle(wrapped, sourceUrl, {
		markdown: true,
	});
	const file = await remark().use(remarkUnlink).process(result.content);
	return { status: "ok", markdown: String(file).trim() };
}
