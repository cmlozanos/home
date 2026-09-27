.PHONY: check check-browser check-reading-assets download-reading-assets reading-contact-sheet
check:
	node --check gate.js
	node tools/check.cjs
	node tools/profile-check.cjs
	node tools/reading-check.cjs
	node tools/reading-assets.cjs
check-browser:
	node tools/browser.cjs

check-reading-assets:
	node tools/reading-assets.cjs

download-reading-assets:
	node tools/reading-assets.cjs --download

reading-contact-sheet:
	node tools/reading-contact-sheet.cjs $(OUTPUT_DIR)
