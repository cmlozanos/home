const { test, expect } = require('@playwright/test');

async function protectedPlanet(page) {
  await page.goto('orbit-lab/?test=1');
  await page.locator('#start').click();
  await page.locator('#reset').click();
  await page.locator('[data-template="life"]').click();
  await page.locator('#pause').click();
  await page.locator('[data-tool="move"]').click();
  return page.evaluate(() => window.__orbitDiagnostics.bodies.find(body => body.orbitLocked));
}
async function snapshot(page, id) {
  return page.evaluate(id => window.__orbitDiagnostics.bodies.find(body => body.id === id), id);
}
async function dragStart(page, body) {
  const canvas = page.locator('#space');
  await canvas.dispatchEvent('pointerdown', { pointerId:301,pointerType:'touch',button:0,clientX:body.screenX,clientY:body.screenY });
  await canvas.dispatchEvent('pointermove', { pointerId:301,pointerType:'touch',button:0,clientX:body.screenX - 25,clientY:body.screenY + 20 });
  expect((await snapshot(page, body.id)).held).toBe(true);
  expect((await snapshot(page, body.id)).orbitLocked).toBe(false);
}

test('orbit: cancelling a touch drag restores the protected orbit and movement resumes', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const before = await protectedPlanet(page);
  await dragStart(page, before);
  await page.locator('#space').dispatchEvent('pointercancel', {pointerId:301,pointerType:'touch'});
  const restored = await snapshot(page, before.id);
  expect(restored.held).toBe(false);
  expect(restored.orbitLocked).toBe(true);
  expect(restored.locked).toBe(true);
  expect(restored.x).toBeCloseTo(before.x, 8);
  expect(restored.y).toBeCloseTo(before.y, 8);
  expect(await page.evaluate(() => window.__orbitDiagnostics.pointers)).toBe(0);
  await page.locator('#pause').click();
  await expect.poll(async () => { const body = await snapshot(page, before.id); return Math.hypot(body.x - before.x, body.y - before.y); }).toBeGreaterThan(3);
  expect(errors).toEqual([]);
});

test('orbit: window blur clears held contacts and restores the interrupted planet', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const before = await protectedPlanet(page);
  await dragStart(page, before);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const restored = await snapshot(page, before.id);
  expect(restored.held).toBe(false);
  expect(restored.orbitLocked).toBe(true);
  expect(restored.x).toBeCloseTo(before.x, 8);
  expect(restored.y).toBeCloseTo(before.y, 8);
  expect(await page.evaluate(() => window.__orbitDiagnostics.pointers)).toBe(0);
  expect(errors).toEqual([]);
});
