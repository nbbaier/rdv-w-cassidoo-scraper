import data from "./data/data.json" with { type: "json" };
import { type Email, getQuestion } from "./utils";

const emails: Email[] = data.sort((a, b) => a.date.localeCompare(b.date));

for (const [index, email] of emails.entries()) {
	const file = await Bun.file(
		`./src/content/questions/${email.date}.md`,
	).exists();
	if (file) {
		console.log(
			`Skipping ${index + 1} of ${emails.length} - ${email.date} because it already exists`,
		);
		continue;
	}

	email.number = index + 1;

	await getQuestion(email);
}
