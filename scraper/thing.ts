import { Defuddle } from "defuddle/node";
import { JSDOM } from "jsdom";
import type { Content, Heading, Root, Strong, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { remark } from "remark";
import remarkUnlink from "remark-unlink";
import { visit } from "unist-util-visit";
import type { Email } from "./utils";

export async function getQuestion(
	email: Email,
): Promise<{ result: "no-content" | "no-question" | "success" }> {
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
		return { result: "no-content" };
	}

	// Convert to markdown first
	const result = await Defuddle(content.innerHTML, email.url, {
		markdown: true,
	});
	const markdown = result.content;

	Bun.write(`./scraper/data/raw-markdown/${email.date}.md`, markdown);

	// Parse markdown to AST
	const tree = fromMarkdown(markdown);

	// Extract the question section
	const questionTree = extractQuestionSection(tree);

	if (!questionTree || questionTree.children.length <= 1) {
		console.log(`No question found for ${email.date}`);
		return { result: "no-question" };
	}

	// Convert back to markdown and remove links
	const questionMd = toMarkdown(questionTree);
	const file = await remark().use(remarkUnlink).process(questionMd);

	const output = `---
url: ${email.url}
date: ${email.date}
number: ${email.number}
---

${String(file).trim()}
`;

	await Bun.write(`./scraper/data/questions/${email.date}.md`, output);
	console.log(`Saved ${email.date}`);
	return { result: "success" };
}

function extractQuestionSection(tree: Root): Root | null {
	const children = tree.children;
	let startIndex = -1;
	let endIndex = children.length;

	// Find the "Interview question" heading
	for (let i = 0; i < children.length; i++) {
		const node = children[i];
		if (isInterviewQuestionHeading(node)) {
			startIndex = i;
			break;
		}
	}

	if (startIndex === -1) {
		return null;
	}

	// Find the end of the section (next h2 heading or thematic break)
	for (let i = startIndex + 1; i < children.length; i++) {
		const node = children[i];
		if (
			(node.type === "heading" && node.depth === 2) ||
			node.type === "thematicBreak"
		) {
			endIndex = i;
			break;
		}
	}

	// Extract nodes in the interview section
	const sectionNodes = children.slice(startIndex, endIndex);

	// Find where the actual question starts (skip "last week" preamble)
	let questionStartIndex = 1; // Start after the heading
	let foundQuestion = false;

	for (let i = 1; i < sectionNodes.length; i++) {
		const node = sectionNodes[i];

		if (!foundQuestion) {
			// Check for "this week's question" text
			if (containsText(node, /this\s+week'?s\s+question/i)) {
				questionStartIndex = i + 1;
				foundQuestion = true;
				continue;
			}

			// Check for bold text that's likely the question (long enough)
			if (startsWithLongBold(node, 30)) {
				questionStartIndex = i;
				foundQuestion = true;
			}
		}

		if (foundQuestion) {
			// Stop at submission instructions
			if (containsText(node, /submit your answers|replying to this email/i)) {
				endIndex = startIndex + i;
				break;
			}
		}
	}

	// Build the result tree
	const questionNodes: Content[] = [
		{
			type: "heading",
			depth: 2,
			children: [{ type: "text", value: "Interview question of the week" }],
		},
		...sectionNodes.slice(questionStartIndex),
	];

	// Filter out nodes after submission instructions
	const filteredNodes = filterUntilSubmission(questionNodes);

	return {
		type: "root",
		children: filteredNodes,
	};
}

function isInterviewQuestionHeading(node: Content): node is Heading {
	if (node.type !== "heading" || node.depth !== 2) {
		return false;
	}

	const text = getTextContent(node);
	return /interview\s+question/i.test(text);
}

function getTextContent(node: Content): string {
	let text = "";

	visit({ type: "root", children: [node] }, "text", (textNode: Text) => {
		text += textNode.value;
	});

	return text;
}

function containsText(node: Content, pattern: RegExp): boolean {
	const text = getTextContent(node);
	return pattern.test(text);
}

function startsWithLongBold(node: Content, minLength: number): boolean {
	if (node.type !== "paragraph" || !node.children.length) {
		return false;
	}

	const firstChild = node.children[0];
	if (firstChild.type !== "strong") {
		return false;
	}

	const boldText = getTextContent(firstChild as Content);
	return boldText.length >= minLength;
}

function filterUntilSubmission(nodes: Content[]): Content[] {
	const result: Content[] = [];

	for (const node of nodes) {
		if (containsText(node, /submit your answers|replying to this email/i)) {
			break;
		}
		result.push(node);
	}

	return result;
}

import data from "./data/data.json" with { type: "json" };

const noContent = [];
const noQuestion = [];

for (const email of data) {
	const { result } = await getQuestion(email);
	if (result === "no-content") {
		noContent.push(email);
	} else if (result === "no-question") {
		noQuestion.push(email);
	}
}

Bun.write("./scraper/data/no-content.json", JSON.stringify(noContent, null, 2));
Bun.write(
	"./scraper/data/no-question.json",
	JSON.stringify(noQuestion, null, 2),
);
