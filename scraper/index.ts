import data from "./data/data.json" with { type: "json" };
import { type Email, getQuestion } from "./utils";

const emails: Email[] = data;

for (const email of emails) {
	const file = await Bun.file(`./src/content/questions/${email.date}.md`).exists();
	if (file) {
		console.log(`Skipping ${email.date} because it already exists`);
		continue;
	}
	await getQuestion(email);
}
