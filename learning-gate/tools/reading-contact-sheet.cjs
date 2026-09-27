// Developer visual QA only. Renders local images, makes no network requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const words = require('../reading-words.js');

(async () => {
  const output = process.argv[2];
  assert.ok(output && path.isAbsolute(output), 'Supply an absolute output directory (outside the repository).');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 1 });
    for (let start = 0; start < words.length; start += 25) {
      const cards = words.slice(start, start + 25).map(item => {
        const png = fs.readFileSync(path.join(__dirname, '../reading-images', item.id + '.png')).toString('base64');
        return '<article><img src="data:image/png;base64,' + png + '"><b>' + item.word + '</b><small>' + item.id + '</small></article>';
      }).join('');
      await page.setContent('<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;display:grid;grid-template-columns:repeat(5,1fr);background:#ddd;font:20px sans-serif}article{height:240px;background:white;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;flex-direction:column}img{width:180px;height:190px;object-fit:contain}small{font-size:12px;color:#555}</style>' + cards);
      await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      const target = path.join(output, 'reading-' + (start / 25 + 1) + '.png');
      await page.screenshot({ path: target });
      console.log(target);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
