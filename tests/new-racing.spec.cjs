const { test, expect, solveGate } = require('./helpers/learning-fixture.cjs');

for (const [slug, debug] of [['nitro-highway', '__highway'], ['pocket-karts', '__karts']]) {
  test(slug + ': choose car/course, drive with touch, cancel, pause and retry', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { Math.random = () => .18; });
    await page.goto(slug + '/?test=1');
    await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
    await page.locator('#cars button').nth(2).click(); await page.locator('#tracks button').nth(1).click(); await page.locator('#play').click();
    await expect.poll(() => page.evaluate(key => window[key].speed, debug)).toBeGreaterThan(10);
    expect(await page.evaluate(key => [window[key].track, window[key].car], debug)).toEqual([1, 2]);
    const right = page.locator('[data-input="right"]');
    await right.dispatchEvent('pointerdown', { pointerId: 75, pointerType: 'touch', buttons: 1 });
    expect(await page.evaluate(key => window[key].held, debug)).toContain('right');
    await right.dispatchEvent('pointercancel', { pointerId: 75, pointerType: 'touch' });
    expect(await page.evaluate(key => window[key].held, debug)).not.toContain('right');
    await page.locator('#pause').click();
    const before = await page.evaluate(key => window[key].time, debug); await page.waitForTimeout(150);
    expect(await page.evaluate(key => window[key].time, debug)).toBe(before);
    await page.locator('#next').click();
    await expect.poll(() => page.evaluate(key => window[key].time, debug)).toBeGreaterThan(before);
    await page.locator('#pause').click(); await page.locator('#retry').click();
    expect(await page.evaluate(key => window[key].time, debug)).toBeLessThan(1);
    expect(errors).toEqual([]);
  });
  test(slug + ': ten-minute challenge freezes and preserves manual pause', async ({ page }) => {
    await page.addInitScript(() => { Math.random = () => .18; const now = Date.now; window.testClockOffset = 0; Date.now = () => now() + window.testClockOffset; });
    await page.goto(slug + '/?test=1'); await page.locator('#play').click();
    await expect.poll(() => page.evaluate(key => window[key].time, debug)).toBeGreaterThan(.15);
    await page.evaluate(() => { window.testClockOffset = 600001; });
    await expect(page.locator('#learning-gate')).toBeVisible();
    const before = await page.evaluate(key => window[key].time, debug); await page.waitForTimeout(150);
    expect(await page.evaluate(key => window[key].time, debug)).toBe(before);
    expect(await page.evaluate(key => window[key].held, debug)).toEqual([]);
    await solveGate(page); await expect.poll(() => page.evaluate(key => window[key].time, debug)).toBeGreaterThan(before);
    await page.locator('#pause').click(); await page.evaluate(() => { window.testClockOffset += 600001; });
    await expect(page.locator('#learning-gate')).toBeVisible(); await solveGate(page);
    expect(await page.evaluate(key => window[key].paused, debug)).toBe(true);
    await expect(page.locator('#result')).toBeVisible();
  });
  test(slug + ': compact controls fit phone portrait and landscape', async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { Math.random = () => .18; CanvasRenderingContext2D.prototype.roundRect = undefined; });
    await page.goto(slug + '/?test=1');
    for (const viewport of [{ width: 320, height: 568 }, { width: 740, height: 360 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      const outside = await page.locator('button:visible').evaluateAll(elements => elements.filter(e => { const r = e.getBoundingClientRect(); return r.width < 40 || r.height < 40 || r.x < -.5 || r.y < -.5 || r.right > innerWidth + .5 || r.bottom > innerHeight + .5; }).map(e => e.id || e.getAttribute('aria-label')));
      expect(outside).toEqual([]); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('#play').click(); await page.setViewportSize({ width: 320, height: 568 });
    const outside = await page.locator('#controls button').evaluateAll(elements => elements.filter(e => { const r = e.getBoundingClientRect(); return r.x < 0 || r.right > innerWidth || r.bottom > innerHeight; }).length);
    expect(outside).toBe(0); expect(errors).toEqual([]);
  });
  test(slug + ': offline shell retains educational challenge and cache isolation', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker offline coverage runs in Chromium.');
    await page.addInitScript(() => { Math.random = () => .18; });
    await page.goto(slug + '/?test=1');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; await caches.open('racing-other-sentinel'); });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const manifest = await page.evaluate(async () => (await fetch('manifest.webmanifest')).json()); expect(manifest.display).toBe('standalone');
    for (const icon of manifest.icons) expect((await page.request.get(new URL(icon.src, page.url()).href)).ok()).toBe(true);
    await context.setOffline(true); await page.reload(); await page.locator('#play').click();
    await expect.poll(() => page.evaluate(key => window[key].time, debug)).toBeGreaterThan(.1);
    expect(await page.evaluate(() => caches.has('racing-other-sentinel'))).toBe(true);
  });
}
