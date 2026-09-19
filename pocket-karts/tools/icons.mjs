import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const svg = await readFile('icon.svg', 'utf8');
await mkdir('icons', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const size of [192, 512]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent('<style>html,body{margin:0;overflow:hidden}svg{width:100vw;height:100vh;display:block}</style>' + svg);
    await page.screenshot({ path: 'icons/icon-' + size + '.png' });
  }
} finally { await browser.close(); }
