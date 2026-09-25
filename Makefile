.PHONY: check serve install-tests test-games check-games icons screenshots sync-gates check-gates

check:
	node --check apps.js
	@node -e 'const fs=require("fs");const source=fs.readFileSync("apps.js","utf8");const staticApps=[...source.matchAll(/href:\s*"(https:\/\/[^\"]+)"/g)].map(match=>match[1]);if(staticApps.length===0||new Set(staticApps).size!==staticApps.length)process.exit(1);console.log(`Static app links verified: $${staticApps.length}`)'

serve:
	python3 -m http.server 8080

install-tests:
	npm ci
	npx playwright install chromium webkit

check-games:
	$(MAKE) check-gates
	$(MAKE) -C fruit-splash check
	$(MAKE) -C orbit-lab check
	$(MAKE) -C memory-garden check
	$(MAKE) -C shape-studio check
	$(MAKE) -C little-atelier check
	$(MAKE) -C maze-meadow check
	$(MAKE) -C nitro-highway check
	$(MAKE) -C pocket-karts check
	$(MAKE) -C pulse-path check
	$(MAKE) -C animal-quiz check
	node tools/check-static-games.mjs fruit-splash orbit-lab memory-garden shape-studio little-atelier maze-meadow nitro-highway pocket-karts pulse-path animal-quiz
	node tools/check-cache-isolation.mjs fruit-splash orbit-lab memory-garden shape-studio little-atelier maze-meadow nitro-highway pocket-karts pulse-path animal-quiz rubik-solver

sync-gates:
	node tools/sync-learning-gate.mjs

check-gates:
	$(MAKE) -C learning-gate check
	node tools/sync-learning-gate.mjs --check

test-games:
	npm test

icons:
	npm run icons -- $(GAME)

screenshots:
	node tools/game-screenshots.mjs $(GAME)
