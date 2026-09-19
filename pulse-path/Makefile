.PHONY: check serve
check:
	node --check core.js
	node --check game.js
	node --check learning-gate.js
	node --check sw.js
	node tools/check.cjs
serve:
	python3 -m http.server 8080
