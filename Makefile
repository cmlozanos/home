.PHONY: check serve

check:
	node --check apps.js
	@node -e 'const fs=require("fs");const source=fs.readFileSync("apps.js","utf8");const staticApps=[...source.matchAll(/href:\s*"(https:\/\/[^\"]+)"/g)].map(match=>match[1]);if(staticApps.length===0||new Set(staticApps).size!==staticApps.length)process.exit(1);console.log(`Static app links verified: $${staticApps.length}`)'

serve:
	python3 -m http.server 8080
