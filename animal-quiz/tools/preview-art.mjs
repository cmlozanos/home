import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { animals } = require('../quiz-core.js');
const definitions = (await readFile(new URL('../assets/animals.svg', import.meta.url), 'utf8')).replace('<svg ', '<svg class="definitions" ');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport:{ width:1280,height:960 }, deviceScaleFactor:1 });
  await page.setContent('<style>body{margin:0;padding:20px;background:#edf3e7;color:#153b37;font:600 18px Arial}.definitions{position:absolute;width:0;height:0}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}.tile{background:#fffdf5;border-radius:18px;text-align:center;padding:14px}.tile svg{width:100%;height:178px}.tile p{margin:6px}</style>'+definitions+'<div class="grid">'+animals.map(animal=>'<div class="tile"><svg viewBox="0 0 200 160"><use href="#'+animal.id+'"/></svg><p>'+animal.name+'</p></div>').join('')+'</div>');
  await page.screenshot({ path:fileURLToPath(new URL('../art-preview.png', import.meta.url)), fullPage:true });
} finally { await browser.close(); }
console.log('Generated animal-quiz/art-preview.png (not committed).');
