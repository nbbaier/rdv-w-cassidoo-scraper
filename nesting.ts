import { readFileSync } from "fs";
import { Parser } from "htmlparser2";

const html = readFileSync("index.html", "utf-8");

const stack: { tag: string; line: number }[] = [];
let line = 1;

const voidElements = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

// Tags that can be implicitly closed
const implicitlyClosedBy: Record<string, Set<string>> = {
	p: new Set([
		"address",
		"article",
		"aside",
		"blockquote",
		"div",
		"dl",
		"fieldset",
		"footer",
		"form",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"header",
		"hr",
		"main",
		"nav",
		"ol",
		"p",
		"pre",
		"section",
		"table",
		"ul",
	]),
	li: new Set(["li"]),
	dt: new Set(["dt", "dd"]),
	dd: new Set(["dt", "dd"]),
	td: new Set(["td", "th"]),
	th: new Set(["td", "th"]),
	tr: new Set(["tr"]),
	thead: new Set(["tbody", "tfoot"]),
	tbody: new Set(["tbody", "tfoot"]),
};

const parser = new Parser(
	{
		onopentag(name) {
			const lower = name.toLowerCase();

			// Check if this tag implicitly closes something
			const last = stack[stack.length - 1];
			if (last && implicitlyClosedBy[last.tag]?.has(lower)) {
				console.warn(
					`⚠️  Line ${line}: <${name}> implicitly closes <${last.tag}> (opened at line ${last.line})`,
				);
				stack.pop();
			}

			if (!voidElements.has(lower)) {
				stack.push({ tag: lower, line });
			}
		},
		onclosetag(name) {
			const lower = name.toLowerCase();
			if (voidElements.has(lower)) return;

			// Find matching open tag (may not be the last one due to implicit closing)
			const idx = stack.map((s) => s.tag).lastIndexOf(lower);

			if (idx === -1) {
				console.error(
					`❌ Line ${line}: Unexpected </${name}> - no matching open tag!`,
				);
			} else if (idx !== stack.length - 1) {
				const unclosed = stack.slice(idx + 1);
				console.error(
					`❌ Line ${line}: </${name}> but these tags are still open:`,
				);
				unclosed.forEach((t) => {
					console.error(`   - <${t.tag}> at line ${t.line}`);
				});
				stack.length = idx; // Pop everything including the match
				stack.pop();
			}
		},
		ontext(text) {
			line += (text.match(/\n/g) || []).length;
		},
	},
	{ recognizeSelfClosing: true },
);

parser.write(html);
parser.end();

if (stack.length === 0) {
	console.log("\n✅ All tags properly closed!");
} else {
	console.log("\n❌ Unclosed tags at end of file:");
	stack.forEach((t) => {
		console.error(`   - <${t.tag}> at line ${t.line}`);
	});
}
