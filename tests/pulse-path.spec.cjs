const {test,expect,solveGate}=require('./helpers/learning-fixture.cjs');
const read=page=>page.evaluate(()=>window.__pulse.read());
test('Salto Neón accepts taps and keys, pauses, retries and exposes child-friendly choices',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('pulse-path/?test=1');
  expect((await read(page)).sound).toBe(false);await page.locator('#assist').click();await page.locator('#play').click();
  const box=await page.locator('#jump').boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await expect.poll(async()=>(await read(page)).state.jumps).toBeGreaterThan(0);
  await page.locator('#pause').click();const x=(await read(page)).state.x;await page.waitForTimeout(350);expect((await read(page)).state.x).toBe(x);
  await page.locator('#resume').click();await expect.poll(async()=>(await read(page)).state.status,{timeout:7000}).toBe('crashed');
  await page.locator('#retry').click();expect((await read(page)).state.status).toBe('playing');
  await page.keyboard.press('Space');await expect.poll(async()=>(await read(page)).state.jumps).toBeGreaterThan(0);
  await page.locator('#home').click();await page.locator('[data-level="2"]').click();await page.locator('#difficulty').click();
  expect((await read(page)).selected).toBe(2);expect((await read(page)).difficulty).toBe('normal');
  await page.locator('#help').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');await page.locator('#close-help').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('Salto Neón completes an actual authored course and advances immediately',async({page},info)=>{
  test.setTimeout(45000);await page.goto('pulse-path/?test=1');await page.locator('#play').click();
  await expect(page.locator('#next')).toBeVisible({timeout:26000});const before=await read(page);expect(before.state.status).toBe('won');expect(before.completed[0]).toBe(true);expect(before.state.stars.length).toBeGreaterThan(0);
  await page.screenshot({path:info.outputPath('pulse-path-finish.png')});await page.locator('#next').click();expect((await read(page)).selected).toBe(1);expect((await read(page)).state.status).toBe('playing');
  await page.reload();expect((await read(page)).completed[0]).toBe(true);
});
test('Salto Neón works at 320px without local storage and loads offline',async({page,context,browserName})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('disabled');}});});await page.setViewportSize({width:320,height:640});await page.goto('pulse-path/?test=1');
  await page.locator('#play').click();expect((await read(page)).playing).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(browserName==='webkit')return;await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);await context.setOffline(true);await page.goto('pulse-path/?test=1&offline=1');await page.locator('#play').click();expect((await read(page)).playing).toBe(true);await context.setOffline(false);
});
test('Salto Neón educational recurrence preserves an existing manual pause',async({page})=>{
  await page.goto('pulse-path/?test=1');await page.locator('#play').click();await page.locator('#pause').click();const frozen=(await read(page)).state;
  await page.evaluate(()=>{const original=Date.now;Date.now=()=>original()+600001;window.dispatchEvent(new Event('focus'));});
  await expect(page.locator('#learning-gate')).toBeVisible();await page.waitForTimeout(300);expect((await read(page)).state).toEqual(frozen);
  await solveGate(page);expect((await read(page)).paused).toBe(true);await page.waitForTimeout(150);expect((await read(page)).state).toEqual(frozen);
  await page.locator('#resume').click();await expect.poll(async()=>(await read(page)).state.x).toBeGreaterThan(frozen.x);
});
