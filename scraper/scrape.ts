import { parseFeed } from "feedsmith";
import { extractQuestion } from "./extract";

const COUNT = Number(process.env.COUNT ?? "1000");
const FEED_URL = `https://buttondown.com/cassidoo/rss?count=${COUNT}`;
const OUT_DIR = "./src/content/questions";

console.log(`Fetching ${FEED_URL}`);
const res = await fetch(FEED_URL);
if (!res.ok) {
  throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
}
const xml = await res.text();
const { format, feed } = parseFeed(xml);
if (format !== "rss") {
  throw new Error(`Unexpected feed format: ${format}`);
}

const items = (feed.items ?? [])
  .filter((i) => i.link && i.pubDate && i.description)
  .map((i) => ({
    link: i.link as string,
    pubDate: i.pubDate as string,
    description: i.description as string,
    date: new Date(i.pubDate as string).toISOString().slice(0, 10),
  }))
  .sort((a, b) => a.date.localeCompare(b.date));

console.log(`Feed returned ${items.length} items`);

const totals = {
  processed: 0,
  written: 0,
  skipped_exists: 0,
  skipped_no_question: 0,
  failed: 0,
};

for (const [i, item] of items.entries()) {
  totals.processed++;
  const number = i + 1;
  const path = `${OUT_DIR}/${item.date}.md`;

  if (await Bun.file(path).exists()) {
    totals.skipped_exists++;
    continue;
  }

  const result = await extractQuestion(item.description, item.link);

  if (result.status === "ok") {
    const output = `---
url: ${item.link}
date: ${item.date}
number: ${number}
---

${result.markdown}
`;
    await Bun.write(path, output);
    totals.written++;
    console.log(`wrote ${item.date} (#${number})`);
  } else if (result.status === "skipped") {
    totals.skipped_no_question++;
    console.log(`skipped ${item.date} (#${number}): ${result.reason}`);
  } else {
    totals.failed++;
    console.log(`failed ${item.date} (#${number}): ${result.reason}`);
  }
}

console.log("\nSummary:");
console.log(`  Processed:           ${totals.processed}`);
console.log(`  Written:             ${totals.written}`);
console.log(`  Skipped (exists):    ${totals.skipped_exists}`);
console.log(`  Skipped (no q):      ${totals.skipped_no_question}`);
console.log(`  Failed:              ${totals.failed}`);
