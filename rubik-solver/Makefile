.DEFAULT_GOAL := help
.PHONY: help check serve
help:
	@printf 'check  Syntax, solved cube and offline assets\nserve  Local preview on :8080\n'
check:
	node --check app.js
	node --check solver-worker.js
	node --check sw.js
	node --check family-v2/family.js
	node tools/check.cjs
serve:
	python3 -m http.server 8080
.PHONY: check-browser
check-browser:
	node tools/check-browser.cjs
