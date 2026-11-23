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

.PHONY: check-family-browser
# Focal V2 integration only; uses the existing home test runtime and running server.
check-family-browser:
	cd .. && node nitro-highway/tools/check-family-browser.cjs

.PHONY: check-native-appearance
# Native rendering for all three racing games; existing root Playwright + preview.
check-native-appearance:
	cd .. && node nitro-highway/tools/check-native-appearance.cjs
