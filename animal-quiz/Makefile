.PHONY: check icons preview-art serve
check:
	node --check family-v2/family.js
	node --check quiz-core.js
	node --check learning-gate.js
	node --check game.js
	node --check sw.js
	node tools/check.cjs

icons:
	node tools/icons.mjs

preview-art:
	node tools/preview-art.mjs

serve:
	python3 -m http.server 8080

.PHONY: check-family-browser
# Run from this game; the bounded harness uses the existing home Playwright runtime.
check-family-browser:
	cd .. && node animal-quiz/tools/family-browser.cjs
