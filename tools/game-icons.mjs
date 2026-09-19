import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const game = process.argv[2];
if (!game || !/^[a-z0-9-]+$/.test(game)) throw new Error('Usage: npm run icons -- game-folder');
const svg = await readFile(resolve(game,'icon.svg'),'utf8');
await mkdir(resolve(game,'icons'),{recursive:true});
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor:1 });
  for (const size of [192,512]) {
    await page.setViewportSize({width:size,height:size});
    await page.setContent('<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{width:100%;height:100%;display:block}</style>'+svg);
    await page.screenshot({path:resolve(game,'icons','icon-'+size+'.png')});
  }
} finally { await browser.close(); }
console.log('Generated PNG icons for '+game);
