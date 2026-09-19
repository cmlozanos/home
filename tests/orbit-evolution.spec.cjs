const { test, expect } = require('@playwright/test');

const SAVE_KEY = 'orbit-lab-universe-v1';
function errorsOn(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}
function star() { return { id: 1001, type: 'star', x: 0, y: 0, vx: 0, vy: 0, mass: 30, radius: 30, locked: true }; }
function planet() { return { id: 1002, type: 'ocean', x: -180, y: 0, vx: 0, vy: 0, mass: .07, radius: 12 }; }
async function seedOnce(page, bodies) {
  await page.addInitScript(({ key, bodies }) => {
    if (!sessionStorage.getItem('orbit-evolution-seeded')) {
      localStorage.setItem(key, JSON.stringify({ version: 2, bodies, orbitCount: 0 }));
      sessionStorage.setItem('orbit-evolution-seeded', 'yes');
    }
  }, { key: SAVE_KEY, bodies });
}
async function restore(page, bodies) {
  await seedOnce(page, bodies);
  await page.goto('orbit-lab/?test=1');
  await page.locator('#resume').click();
}
async function pause(page) {
  if (await page.locator('#pause').getAttribute('aria-pressed') !== 'true') await page.locator('#pause').click();
}
async function snapshot(page) { return page.evaluate(() => window.__orbitDiagnostics); }
async function bodyAt(page, id) {
  return page.evaluate(id => window.__orbitDiagnostics.bodies.find(b => b.id === id), id);
}
async function preset(page, name) {
  await page.locator('#reset').click();
  await page.locator(`[data-template="${name}"]`).click();
}

test('orbit evolution: collision preset forms a black hole with conserved mass', async ({ page }) => {
  const errors = errorsOn(page);
  await page.goto('orbit-lab/?test=1');
  await page.locator('#start').click();
  await preset(page, 'collision');
  await page.locator('#speed').click();
  await expect.poll(async () => (await snapshot(page)).bodies.some(b => b.type === 'blackhole'), { timeout: 12000 }).toBe(true);
  await pause(page);
  const state = await snapshot(page);
  expect(state.bodyCount).toBe(1);
  expect(state.bodies[0].mass).toBeCloseTo(120, 8);
  expect(errors).toEqual([]);
});

test('orbit evolution: nursery preset resumes near condensation and creates protostars', async ({ page }) => {
  const errors = errorsOn(page);
  await page.goto('orbit-lab/?test=1');
  await page.locator('#start').click();
  await preset(page, 'nursery');
  await pause(page);
  await page.locator('#save').click();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE_KEY);
  expect(saved.bodies.every(b => b.type === 'nebula')).toBe(true);
  saved.bodies.forEach(b => { b.age = 9.8; b.stageAge = 9.8; });
  await seedOnce(page, saved.bodies);
  await page.reload();
  await page.locator('#resume').click();
  await expect.poll(async () => (await snapshot(page)).bodies.filter(b => b.type === 'protostar').length).toBe(2);
  expect(errors).toEqual([]);
});

test('orbit tools: move an existing planet without creating another body', async ({ page }) => {
  const errors = errorsOn(page);
  await restore(page, [star(), planet()]);
  await pause(page);
  await page.locator('[data-tool="move"]').click();
  const before = await bodyAt(page, 1002);
  await page.mouse.move(before.screenX, before.screenY);
  await page.mouse.down();
  await expect.poll(async () => (await bodyAt(page, 1002)).held).toBe(true);
  await page.mouse.move(before.screenX - 25, before.screenY + 20, { steps: 5 });
  await page.mouse.up();
  const after = await bodyAt(page, 1002);
  expect((await snapshot(page)).bodyCount).toBe(2);
  expect(after.held).toBe(false);
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(15);
  expect(errors).toEqual([]);
});

test('orbit tools: locking then orbiting protects a planet around its fixed sun', async ({ page }) => {
  const errors = errorsOn(page);
  await restore(page, [star(), planet()]);
  await pause(page);
  await page.locator('[data-tool="lock"]').click();
  let b = await bodyAt(page, 1002);
  await page.mouse.click(b.screenX, b.screenY);
  expect((await bodyAt(page, 1002)).locked).toBe(true);
  await page.locator('[data-tool="orbit"]').click();
  b = await bodyAt(page, 1002);
  await page.mouse.click(b.screenX, b.screenY);
  const before = await bodyAt(page, 1002);
  expect(before.orbitLocked).toBe(true);
  await page.locator('#pause').click();
  await expect.poll(async () => Math.hypot((await bodyAt(page, 1002)).x - before.x, (await bodyAt(page, 1002)).y - before.y)).toBeGreaterThan(5);
  await pause(page);
  const after = await bodyAt(page, 1002), anchor = await bodyAt(page, 1001);
  expect(after.orbitLocked).toBe(true);
  expect(anchor.x).toBe(0); expect(anchor.y).toBe(0);
  expect(Math.hypot(after.x - anchor.x, after.y - anchor.y)).toBeCloseTo(Math.hypot(before.x, before.y), 4);
  expect(errors).toEqual([]);
});

test('orbit life: habitable planets develop ships and retain civilization after save/resume', async ({ page }) => {
  const errors = errorsOn(page);
  const home = Object.assign(planet(), { locked: true, orbitLocked: true, anchorId: 1001, orbitRadius: 180, orbitPhase: Math.PI, habitableTime: 47.8, lifeStage: 5 });
  const target = Object.assign(planet(), { id: 1003, type: 'rock', x: 180, mass: .05, radius: 10, locked: true, orbitLocked: true, anchorId: 1001, orbitRadius: 180, orbitPhase: 0 });
  await restore(page, [star(), home, target]);
  await page.locator('#habitat').click();
  await expect(page.locator('#habitat')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await bodyAt(page, 1002)).lifeStage).toBe(6);
  await expect.poll(async () => (await snapshot(page)).ships).toBeGreaterThan(0);
  await pause(page);
  await page.locator('#save').click();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE_KEY);
  expect(saved.version).toBe(2);
  expect(saved.bodies.find(b => b.id === 1002).lifeStage).toBe(6);
  await page.reload();
  await page.locator('#resume').click();
  await pause(page);
  const resumed = await bodyAt(page, 1002);
  expect(resumed.lifeStage).toBe(6);
  expect(resumed.locked).toBe(true);
  expect(resumed.orbitLocked).toBe(true);
  expect((await snapshot(page)).bodyCount).toBe(3);
  expect(errors).toEqual([]);
});

test('orbit palette: size changes both visible radius and mass for new planets', async ({ page }) => {
  const errors = errorsOn(page);
  await restore(page, [star()]);
  await pause(page);
  await page.locator('[data-body="rock"]').click();
  await page.locator('#size').click();
  await page.locator('#space').focus();
  await page.keyboard.press('Enter');
  let rocks = (await snapshot(page)).bodies.filter(b => b.type === 'rock');
  expect(rocks).toHaveLength(1);
  expect(rocks[0].mass).toBeCloseTo(.05 * 1.7 ** 3, 8);
  expect(rocks[0].radius).toBeCloseTo(17, 8);
  await page.locator('#size').click();
  await page.locator('#space').focus();
  await page.keyboard.press('Enter');
  rocks = (await snapshot(page)).bodies.filter(b => b.type === 'rock');
  expect(rocks).toHaveLength(2);
  expect(rocks[1].mass).toBeCloseTo(.05 * 2.5 ** 3, 8);
  expect(rocks[1].radius).toBeCloseTo(25, 8);
  expect(errors).toEqual([]);
});
