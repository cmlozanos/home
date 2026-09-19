const {test,expect}=require('./helpers/learning-fixture.cjs');
// macOS Chromium151 trace finalization stalls after long input replays.
// Keep real-input assertions and a finish screenshot; short tests retain traces.
test.use({trace:'off'});
for (const [slug, debug] of [['nitro-highway', '__highway'], ['pocket-karts', '__karts']]) {
  test(slug + ': finishes a real race with keyboard and opens next circuit', async ({ page }, testInfo) => {
    test.skip(!['tablet', 'chrome95'].includes(testInfo.project.name), 'Full race is exercised on current and genuine legacy Chromium.');
    test.setTimeout(125000);
    await page.addInitScript(() => { Math.random = () => .18; });
    await page.goto(slug + '/?test=1'); await page.locator('#play').click();
    if (slug === 'nitro-highway') {
      await page.keyboard.down(' ');
      await expect.poll(() => page.evaluate(() => window.__highway.finished), { timeout: 95000 }).toBe(true);
      await page.keyboard.up(' ');
    } else {
      const deadline = Date.now() + 95000; let held = '';
      while (Date.now() < deadline) {
        const command = await page.evaluate(() => {
          const state = window.__karts;
          if (state.finished) return 'finished';
          const points = Karts.course(state.track), n = Karts.nearest(state.x, state.y, points), target = points[(n.index + 6) % 120];
          const a = Math.atan2(target.y - state.y, target.x - state.x) - state.angle, delta = Math.atan2(Math.sin(a), Math.cos(a));
          return delta < -.04 ? 'ArrowLeft' : delta > .04 ? 'ArrowRight' : '';
        });
        if (command === 'finished') break;
        if (command !== held) { if (held) await page.keyboard.up(held); if (command) await page.keyboard.down(command); held = command; }
        await page.waitForTimeout(60);
      }
      if (held) await page.keyboard.up(held);
      expect(await page.evaluate(() => window.__karts.finished)).toBe(true);
      expect(await page.evaluate(() => window.__karts.gates)).toBe(24);
    }
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#next')).toHaveAttribute('aria-label', 'Siguiente circuito');
    await page.screenshot({path:testInfo.outputPath(slug+'-finish.png')});
    await page.locator('#next').click();
    expect(await page.evaluate(key => [window[key].track, window[key].finished], debug)).toEqual([1, false]);
    await expect(page.locator('#result')).toBeHidden();
    // Stop the continuous renderer's active race before Chromium closes this long-lived context.
    await page.locator('#pause').click();
    await page.evaluate(async () => { for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister(); });
    await page.close();
  });
}
