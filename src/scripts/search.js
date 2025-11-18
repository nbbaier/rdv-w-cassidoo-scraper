let searchIndex = [];

(async function() {
	try {
		const res = await fetch('/search.json');
		searchIndex = await res.json();
	} catch (err) {
		console.error('Failed to load search index', err);
	}
})();

const searchInput = document.getElementById('search-input');
const list = document.getElementById('questions-list');
const noResults = document.getElementById('no-results');

if (searchInput && list && noResults) {
	searchInput.addEventListener('input', (e) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) return;

		const term = input.value.toLowerCase();
		const items = document.querySelectorAll('.question-item');
		let hasVisible = false;

		const matchingSlugs = new Set();
		if (term.length > 0 && searchIndex.length > 0) {
			for (const item of searchIndex) {
				if (
					item.excerpt.toLowerCase().includes(term) ||
					item.date.includes(term) ||
					String(item.number).includes(term) ||
					item.slug.includes(term)
				) {
					matchingSlugs.add(item.slug);
				}
			}
		}

		for (const item of items) {
			if (!(item instanceof HTMLElement)) continue;

			const date = item.dataset.date || '';
			const number = item.dataset.number || '';
			const href = item.getAttribute('href') || '';
			const slug = href.split('/').pop() || '';

			let matchesTerm = false;
			if (term === '') {
				matchesTerm = true;
			} else if (searchIndex.length > 0) {
				matchesTerm = matchingSlugs.has(slug);
			} else {
				matchesTerm = date.includes(term) || number.includes(term) || (item.textContent || '').toLowerCase().includes(term);
			}

			if (matchesTerm) {
				item.style.display = 'block';
				hasVisible = true;
			} else {
				item.style.display = 'none';
			}
		}

		if (hasVisible) {
			noResults.classList.add('hidden');
		} else {
			noResults.classList.remove('hidden');
		}
	});
}
