import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = new URL('../', import.meta.url);
const svg = await readFile(new URL('icon.svg', directory), 'utf8');
await mkdir(new URL('icons/', directory), { recursive:true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor:1 });
  for (const size of [192,512]) {
    await page.setViewportSize({ width:size,height:size });
    await page.setContent('<style>html,body{margin:0;width:100%;height:100%}svg{width:100%;height:100%;display:block}</style>'+svg);
    await page.screenshot({ path:fileURLToPath(new URL('icons/icon-'+size+'.png', directory)) });
  }
} finally { await browser.close(); }
console.log('PNG icons generated.');
