const {test,expect}=require('@playwright/test');
const {solveGate}=require('./helpers/learning-fixture.cjs');
const games=['fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow'];

async function prepare(page){
  await page.addInitScript(()=>{
    const original=Date.now;
    window.testClockOffset=0;
    Date.now=()=>original()+window.testClockOffset;
    Math.random=()=>0.1;
  });
}
async function expire(page){
  await page.evaluate(()=>{window.testClockOffset+=600001;window.dispatchEvent(new Event('focus'));});
  await expect(page.locator('#learning-gate')).toBeVisible();
}

for(const game of games){
  test(game+': challenge at entry, errors, every ten minutes, reload and home',async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await prepare(page);
    await page.goto(game+'/?test=1');
    await expect(page.locator('#learning-gate')).toBeVisible();
    await expect(page.getByRole('link',{name:/todos los juegos/i})).toHaveAttribute('href','https://cmlozanos.github.io/games/');
    const prompt=await page.locator('#gate-prompt').textContent();
    const numbers=prompt.match(/(\d)\s*([+−-])\s*(\d)/);
    const answer=numbers[2]==='+'?+numbers[1]+ +numbers[3]:+numbers[1]- +numbers[3];
    await page.locator('[data-gate-key="'+((answer+1)%10)+'"]').click();
    await expect(page.locator('#learning-gate')).toBeVisible();
    await solveGate(page);
    await expire(page);
    await solveGate(page);
    await page.reload();
    await expect(page.locator('#learning-gate')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('Fruit: simulation freezes and manual pause survives a challenge',async({page})=>{
  await prepare(page);await page.goto('fruit-splash/?test=1');await solveGate(page);
  await page.locator('#play').click();
  await expect.poll(()=>page.evaluate(()=>fruitDebug.snapshot().elapsed)).toBeGreaterThan(0.1);
  await expire(page);
  const frozen=await page.evaluate(()=>fruitDebug.snapshot());
  await page.waitForTimeout(300);
  expect(await page.evaluate(()=>fruitDebug.snapshot())).toEqual(frozen);
  await solveGate(page);await page.locator('#pause').click();
  await expire(page);await solveGate(page);
  expect(await page.evaluate(()=>fruitDebug.snapshot().state)).toBe('paused');
});

test('Orbit: all celestial motion freezes during the challenge',async({page})=>{
  await prepare(page);await page.goto('orbit-lab/?test=1');await solveGate(page);
  await page.locator('#start').click();await page.waitForTimeout(100);
  await expire(page);
  const bodies=await page.evaluate(()=>__orbitDiagnostics.bodies);
  await page.waitForTimeout(300);
  expect(await page.evaluate(()=>__orbitDiagnostics.bodies)).toEqual(bodies);
  await solveGate(page);
  await expect.poll(()=>page.evaluate(()=>__orbitDiagnostics.bodies)).not.toEqual(bodies);
});

test('Memory: a pending comparison waits for unlock',async({page})=>{
  await prepare(page);await page.goto('memory-garden/');await solveGate(page);
  await expect(page.locator('#board')).not.toHaveClass(/preview/);
  await page.locator('#board button').nth(0).click();
  await page.locator('#board button').nth(1).click();
  await expire(page);
  const board=await page.locator('#board').innerHTML();
  await page.waitForTimeout(1100);
  expect(await page.locator('#board').innerHTML()).toBe(board);
  await solveGate(page);
  await expect.poll(()=>page.locator('#board').innerHTML()).not.toBe(board);
});

test('Shapes: completion is not delivered under the challenge',async({page})=>{
  await prepare(page);await page.goto('shape-studio/');await solveGate(page);
  const ids=await page.locator('#tray .piece').evaluateAll(nodes=>nodes.map(node=>node.dataset.shape));
  for(const id of ids){await page.locator('#tray [data-shape="'+id+'"]').click();await page.locator('#slots [data-shape="'+id+'"]').click();}
  await expire(page);await page.waitForTimeout(600);
  await expect(page.locator('#win')).toBeHidden();
  await solveGate(page);await expect(page.locator('#win')).toBeVisible();
});

test('Atelier and maze preserve progress through the challenge',async({page})=>{
  await prepare(page);await page.goto('little-atelier/?test=1');await solveGate(page);
  const canvas=page.locator('canvas').first(),box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.6,box.y+box.height*.6,{steps:8});await page.mouse.up();
  const drawing=await page.evaluate(()=>__atelier.read());
  expect(drawing.actions.length).toBeGreaterThan(0);
  await expire(page);await solveGate(page);
  expect(await page.evaluate(()=>__atelier.read())).toEqual(drawing);
  await page.goto('maze-meadow/?test=1');await solveGate(page);
  const next=await page.evaluate(()=>__meadow.read().path[1]);
  await page.locator('[data-direction="'+(next===1?1:2)+'"]').click();
  const position=await page.evaluate(()=>__meadow.read().position);
  expect(position).toBe(next);
  await expire(page);await page.keyboard.press('ArrowRight');await solveGate(page);
  expect(await page.evaluate(()=>__meadow.read().position)).toBe(position);
});

test('All six games keep the challenge available offline',async({page,context,browserName})=>{
  test.skip(browserName==='webkit','Service-worker offline validation is covered in Chromium.');
  await prepare(page);
  for(const game of games){
    await context.setOffline(false);await page.goto(game+'/');await solveGate(page);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await context.setOffline(true);await page.reload();
    await expect(page.locator('#learning-gate')).toBeVisible();await solveGate(page);
  }
  await context.setOffline(false);
});
