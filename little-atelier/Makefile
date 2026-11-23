.PHONY: check serve
check:
	node --check learning-gate.js
	node tools/check.cjs

serve:
	python3 -m http.server 4181

.PHONY: check-browser
check-browser:
	node tools/check-v2-browser.cjs
