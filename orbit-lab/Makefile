.PHONY: check serve icons

check:
	node --check learning-gate.js
	node --check game.js
	node --check physics.js
	node --check life.js
	node --check vendor/gravity.js
	node --check sw.js
	node tools/check.mjs
	node tools/check-life.mjs

serve:
	python3 -m http.server 8080

icons:
	magick -background none icon.svg -resize 192x192 icon-192.png
	magick -background none icon.svg -resize 512x512 icon-512.png
