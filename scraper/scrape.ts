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
    date: new Date(i.pubDate as string).toISOString().slice(0, 10),
    description: i.description as string,
    link: i.link as string,
    pubDate: i.pubDate as string,
  }))
  .sort((a, b) => a.date.localeCompare(b.date));

console.log(`Feed returned ${items.length} items`);

const totals = {
  failed: 0,
  processed: 0,
  skipped_exists: 0,
  skipped_no_question: 0,
  written: 0,
};

for (const [i, item] of items.entries()) {
  totals.processed += 1;
  const number = i + 1;
  const path = `${OUT_DIR}/${item.date}.md`;

  // biome-ignore lint/performance/noAwaitInLoops: Process issues sequentially to bound DOM memory and keep output ordered.
  if (await Bun.file(path).exists()) {
    totals.skipped_exists += 1;
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
    totals.written += 1;
    console.log(`wrote ${item.date} (#${number})`);
  } else if (result.status === "skipped") {
    totals.skipped_no_question += 1;
    console.log(`skipped ${item.date} (#${number}): ${result.reason}`);
  } else {
    totals.failed += 1;
    console.log(`failed ${item.date} (#${number}): ${result.reason}`);
  }
}

console.log("\nSummary:");
console.log(`  Processed:           ${totals.processed}`);
console.log(`  Written:             ${totals.written}`);
console.log(`  Skipped (exists):    ${totals.skipped_exists}`);
console.log(`  Skipped (no q):      ${totals.skipped_no_question}`);
console.log(`  Failed:              ${totals.failed}`);
