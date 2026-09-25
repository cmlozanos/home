const { test, expect } = require('./helpers/learning-fixture.cjs');

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(page.runtimeErrors).toEqual([]); });

async function assertNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function memoryReady(page) {
  await expect(page.locator('#board')).not.toHaveClass(/preview/);
}
async function solveMemory(page) {
  await memoryReady(page);
  const pairs = await page.locator('.card').evaluateAll(cards => {
    const result = {};
    cards.forEach(card => (result[card.dataset.animal] || (result[card.dataset.animal] = [])).push(card.dataset.card));
    return Object.values(result);
  });
  for (const pair of pairs) {
    for (const index of pair) await page.locator('[data-card="' + index + '"]').tap();
    await expect(page.locator('[data-card="' + pair[0] + '"]')).toHaveClass(/matched/);
  }
  await expect(page.locator('#win')).toBeVisible();
}
async function solveShapes(page) {
  const ids = await page.locator('.piece:not(.placed)').evaluateAll(pieces => pieces.map(piece => piece.dataset.shape));
  for (const id of ids) {
    await page.locator('.piece[data-shape="' + id + '"]').tap();
    await page.locator('.slot[data-shape="' + id + '"]').tap();
  }
  await expect(page.locator('#win')).toBeVisible();
}

test('memory: every difficulty fits an 800px or 600px high tablet', async ({ page }) => {
  for (const viewport of [{width:1280,height:800}, {width:1024,height:600}]) {
    await page.setViewportSize(viewport);
    await page.goto('memory-garden/');
    for (const level of [0,1,2]) {
      await page.locator('.levels button[data-level="' + level + '"]').click();
      const boxes = await page.locator('.card').evaluateAll(cards => cards.map(card => { const box = card.getBoundingClientRect(); return {top:box.top,bottom:box.bottom,width:box.width,height:box.height}; }));
      expect(boxes.length).toBe([8,12,16][level]);
      for (const box of boxes) {
        expect(box.top).toBeGreaterThanOrEqual(0);
        expect(box.bottom).toBeLessThanOrEqual(viewport.height);
        expect(box.width).toBeGreaterThanOrEqual(48);
        expect(box.height).toBeGreaterThanOrEqual(48);
      }
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    }
  }
});

test('memory: all three levels are solvable, matched cards lock and progress persists', async ({ page }) => {
  await page.goto('memory-garden/');
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  await assertNoOverflow(page);
  for (const count of [8,12,16]) {
    await expect(page.locator('.card')).toHaveCount(count);
    await solveMemory(page);
    await expect(page.locator('.card:disabled')).toHaveCount(count);
    if (count < 16) await page.locator('#next').click();
  }
  await page.reload();
  await expect(page.locator('#best')).toContainText('★');
});

test('memory: mismatches lock the third card, preview can repeat, keyboard plays', async ({ page }) => {
  await page.goto('memory-garden/');
  await memoryReady(page);
  const cards = await page.locator('.card').evaluateAll(nodes => nodes.map(node => ({index:node.dataset.card, animal:node.dataset.animal})));
  const first = cards[0], second = cards.find(card => card.animal !== first.animal), third = cards.find(card => card.index !== first.index && card.index !== second.index);
  await page.locator('[data-card="' + first.index + '"]').focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-card="' + second.index + '"]').click();
  await page.locator('[data-card="' + third.index + '"]').click();
  await expect(page.locator('[data-card="' + third.index + '"]')).not.toHaveClass(/open/);
  await expect(page.locator('.card.open')).toHaveCount(0);
  await page.locator('#preview').click();
  await expect(page.locator('#board')).toHaveClass(/preview/);
  await memoryReady(page);
  await page.locator('#help').click();
  await expect(page.locator('#help-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#help-panel')).toBeHidden();
});

test('shapes: geometry rejects wrong slots and all levels complete with tap or keyboard', async ({ page }) => {
  await page.goto('shape-studio/');
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  await assertNoOverflow(page);
  await page.locator('.piece[data-shape="circle"]').click();
  await page.locator('.slot[data-shape="triangle"]').click();
  await expect(page.locator('.slot.placed')).toHaveCount(0);
  await expect(page.locator('#status')).toContainText('otra silueta');
  await page.locator('.slot[data-shape="circle"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.slot[data-shape="circle"]')).toHaveClass(/placed/);
  for (const count of [4,6,8]) {
    await expect(page.locator('.piece')).toHaveCount(count);
    await solveShapes(page);
    if (count < 8) await page.locator('#next').click();
  }
  await page.reload();
  await expect(page.locator('#saved')).toContainText('★ ★ ★');
});

test('shapes: dragging over a correct silhouette places the piece', async ({ page }) => {
  await page.goto('shape-studio/');
  const source = await page.locator('.piece[data-shape="square"]').boundingBox();
  const target = await page.locator('.slot[data-shape="square"]').boundingBox();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, {steps:12});
  await page.mouse.up();
  await expect(page.locator('.slot[data-shape="square"]')).toHaveClass(/placed/);
  await expect(page.locator('.drag-ghost')).toHaveCount(0);
});

for (const game of ['memory-garden', 'shape-studio']) {
  test(game + ': blocked storage and 320px portrait remain playable', async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', {get() { throw new Error('Storage blocked'); }}); });
    await page.setViewportSize({width:320,height:640});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(game + '/');
    await assertNoOverflow(page);
    if (game === 'memory-garden') await solveMemory(page); else await solveShapes(page);
    expect(errors).toEqual([]);
  });

  test(game + ': offline shell loads and cache isolation preserves sibling games', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit harness does not expose offline service workers.');
    await page.goto(game + '/');
    await page.evaluate(async () => { await caches.open('sibling-game-cache-test'); await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
    if (game === 'memory-garden') await solveMemory(page); else await solveShapes(page);
    expect(await page.evaluate(() => caches.has('sibling-game-cache-test'))).toBe(true);
    await context.setOffline(false);
  });
}
