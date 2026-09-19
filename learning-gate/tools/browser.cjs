'use strict';
const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
(async function () {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME95_PATH || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await page.setContent('<meta name="viewport" content="width=device-width,initial-scale=1"><button id="outside">Outside</button>');
    await page.addScriptTag({ content: readFileSync(join(__dirname, '../gate.js'), 'utf8') });
    await page.evaluate(() => {
      window.testNow = 10000; Date.now = () => window.testNow; Math.random = () => 0.1;
      window.calls = { lock: 0, unlock: 0, leaks: 0 };
      window.addEventListener('click', () => window.calls.leaks++);
      window.gate = LearningGate.mount({ onLock: () => window.calls.lock++, onUnlock: () => window.calls.unlock++ });
    });
    assert.equal(await page.locator('#gate-prompt').innerText(), '1 + 0 = ?');
    await page.locator('[data-gate-key="9"]').click();
    assert.equal(await page.evaluate(() => gate.isLocked()), true);
    await page.locator('[data-gate-key="1"]').click();
    assert.equal(await page.evaluate(() => gate.isLocked()), false);
    await page.evaluate(() => { testNow += 599999; gate.check(); });
    assert.equal(await page.locator('#learning-gate').count(), 0);
    await page.evaluate(() => { testNow++; gate.check(); });
    assert.equal(await page.locator('#learning-gate').count(), 1);
    assert.deepEqual(await page.evaluate(() => calls), { lock: 2, unlock: 1, leaks: 0 });
    await page.setViewportSize({ width: 640, height: 360 });
    await page.evaluate(() => { gate.destroy(); Math.random = () => 0.99; gate = LearningGate.mount({}); });
    const letter = await page.locator('#gate-trace').getAttribute('data-letter');
    const strokes = await page.evaluate(l => LearningGate.Core.glyphs[l], letter);
    const rect = await page.locator('#gate-trace').boundingBox();
    assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= 640 && rect.y + rect.height <= 360);
    for (const stroke of strokes) {
      const coords = p => ({ x: rect.x + p[0] * rect.width / 100, y: rect.y + p[1] * rect.height / 100 });
      const start = coords(stroke[0]); await page.mouse.move(start.x, start.y); await page.mouse.down();
      for (const p of stroke.slice(1)) { const next = coords(p); await page.mouse.move(next.x, next.y, { steps: 3 }); }
      await page.mouse.up();
    }
    assert.equal(await page.locator('#learning-gate').count(), 0, 'real trace completes through pointer events');
    await page.evaluate(() => { gate.destroy(); Math.random = () => 0; gate = LearningGate.mount({ onUnlock: () => { throw new Error('Expected callback failure'); } }); });
    await page.locator('[data-gate-key="0"]').click();
    assert.equal(await page.evaluate(() => gate.isLocked()), true, 'callback errors fail closed');
    await page.locator('#outside').evaluate(el => el.focus());
    assert.equal(await page.evaluate(() => document.getElementById('learning-gate').contains(document.activeElement)), true);
    console.log('Learning gate browser ' + await browser.version() + ': math, interval, trace, input isolation, failure containment, focus and landscape checks passed.');
  } finally { await browser.close(); }
}()).catch(error => { console.error(error); process.exitCode = 1; });
