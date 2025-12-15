import { parseHTML } from "linkedom";
import { type Email, formatDate } from "./utils";

const data: Email[] = [];
const links: Set<string> = new Set();

let page = 1;
let listGrowing = true;

while (listGrowing) {
	const url = `https://buttondown.com/cassidoo/archive/?page=${page}`;
	console.log(url);

	const res = await fetch(url);
	const html = await res.text();
	const { document } = parseHTML(html);

	const emails = Array.from(
		document.querySelectorAll(".email-list > a.email-link"),
	) as Element[];

	console.log(url, emails.length);

	const sizeBefore = links.size;

	for (const email of emails) {
		const link = email.getAttribute("href");
		if (!link) continue;

		if (links.has(link)) continue;
		links.add(link);

		const metadata = email.querySelector(".email-metadata")?.textContent.trim();

		data.push({
			url: link,
			date: formatDate(metadata as string),
			number: 0,
		});
	}

	const sizeAfter = links.size;
	listGrowing = sizeAfter > sizeBefore;

	if (listGrowing) page++;
}

console.log(data.length);

await Bun.write("./scraper/data/data.json", JSON.stringify(data, null, 2));
