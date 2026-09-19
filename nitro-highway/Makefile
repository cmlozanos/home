.PHONY: check serve icons
check:
	node --check core.js
	node --check game.js
	node --check sw.js
	node --check learning-gate.js
	node tools/check.cjs
serve:
	python3 -m http.server 8080
icons:
	node tools/icons.mjs
