.PHONY: check serve
check:
	node --check family-v2/family.js
	node --check learning-gate.js
	node --check game.js
	node --check core.js
	node --check sw.js
	node tools/check.cjs
serve:
	python3 -m http.server 8080
