import type { HTMLAnchorElement } from "linkedom";
import { parseHTML } from "linkedom";
import type { Email } from "./utils";
import { formatDate } from "./utils";

const data: Email[] = [];

const urls: string[] = [
	"https://buttondown.com/cassidoo/archive/?page=1",
	"https://buttondown.com/cassidoo/archive/?page=2",
	"https://buttondown.com/cassidoo/archive/?page=3",
	"https://buttondown.com/cassidoo/archive/?page=4",
	"https://buttondown.com/cassidoo/archive/?page=5",
	"https://buttondown.com/cassidoo/archive/?page=6",
	"https://buttondown.com/cassidoo/archive/?page=7",
	"https://buttondown.com/cassidoo/archive/?page=8",
	"https://buttondown.com/cassidoo/archive/?page=9",
];

for (const url of urls) {
	console.log(url);
	const res = await fetch(url);
	const html = await res.text();
	const { document } = parseHTML(html);
	const emails = Array.from(document.querySelectorAll(".email")) as Element[];

	for (const email of emails) {
		const link = email.querySelector("a") as unknown as HTMLAnchorElement;
		const metadata = Array.from(
			(email.querySelector(".email-metadata") as Element).children,
		).map(
			(child) =>
				(child as Element).textContent?.replace(/\s+/g, " ").trim() ?? "",
		)[0];
		console.log(metadata);
		data.push({
			url: link?.href,
			date: formatDate(metadata?.replace(/(#\d{1,3}) /, "").trim() as string),
			number: Number.parseInt(
				(metadata?.match(/(#\d{1,3})/)?.[0] ?? "").replace("#", ""),
				10,
			),
		});
	}
}

await Bun.write("./scraper/data/data.json", JSON.stringify(data, null, 2));
