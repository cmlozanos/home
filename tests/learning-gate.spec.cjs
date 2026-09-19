const {test,expect}=require('@playwright/test');
const {solveGate}=require('./helpers/learning-fixture.cjs');
const games=['nitro-highway','pocket-karts','pulse-path'];

test('home includes all three new games without changing the existing car-game link',async({page})=>{
  await page.goto('./');
  for(const game of games){
    const link=page.locator('a[href="https://cmlozanos.github.io/home/'+game+'/"]');
    await expect(link).toBeVisible();await expect(link).toHaveAttribute('target','_blank');
  }
  await expect(page.locator('a[href="https://cmlozanos.github.io/turbo-loop-legends/"]')).toBeVisible();
});

for(const game of games){
  test(game+': mandatory entry, incorrect answer and direct reload cannot skip the challenge',async({page})=>{
    await page.addInitScript(()=>{Math.random=()=>.1;});
    await page.goto(game+'/?test=1');
    await expect(page.locator('#learning-gate')).toBeVisible();
    await expect(page.locator('#gate-prompt')).toHaveText('1 + 0 = ?');
    await page.keyboard.press('Escape');
    await page.locator('[data-gate-key="9"]').click();
    await expect(page.locator('#learning-gate')).toBeVisible();
    await page.locator('#play').dispatchEvent('click');
    await expect(page.locator('#menu')).toBeVisible();
    await solveGate(page);
    await page.locator('#play').click();
    await expect(page.locator('#menu')).toBeHidden();
    await page.reload();
    await expect(page.locator('#learning-gate')).toBeVisible();
  });
  test(game+': guided letter rejects a stray stroke and accepts the actual visible route',async({page})=>{
    await page.addInitScript(()=>{Math.random=()=>.99;});
    await page.goto(game+'/');
    const trace=page.locator('#gate-trace');await expect(trace).toBeVisible();
    const box=await trace.boundingBox();
    await page.mouse.move(box.x+2,box.y+2);await page.mouse.down();
    await page.mouse.move(box.x+box.width-2,box.y+box.height-2,{steps:4});await page.mouse.up();
    await expect(page.locator('#learning-gate')).toBeVisible();
    await solveGate(page);
    await expect(page.locator('#play')).toBeVisible();
  });
  test(game+': missing gate script fails closed',async({page})=>{
    await page.route('**/learning-gate.js*',route=>route.abort());
    await page.goto(game+'/?test=1');
    if(await page.locator('#play').count())await page.locator('#play').dispatchEvent('click');
    expect(await page.evaluate(()=>{
      if(window.__pulse)return window.__pulse.read().playing;
      return (window.__highway||window.__karts||{}).running||false;
    })).toBe(false);
  });
}

test('gate is per game, counts hidden wall time and does not impose new gates on previous games',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>.1;const now=Date.now;window.clockOffset=0;Date.now=()=>now()+window.clockOffset;});
  await page.goto('nitro-highway/');await solveGate(page);
  await page.goto('pocket-karts/');await expect(page.locator('#learning-gate')).toBeVisible();await solveGate(page);
  await page.evaluate(()=>{window.clockOffset=600001;window.dispatchEvent(new Event('focus'));});
  await expect(page.locator('#learning-gate')).toBeVisible();await solveGate(page);
  await page.evaluate(()=>{window.clockOffset=-100;window.dispatchEvent(new Event('focus'));});
  await expect(page.locator('#learning-gate')).toBeVisible();
  for(const game of ['fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow']){
    await page.goto(game+'/');await expect(page.locator('#learning-gate')).toHaveCount(0);
  }
});

for(const [game,key] of [['nitro-highway','__highway'],['pocket-karts','__karts']]){
  test(game+': native multitouch controls release safely when the challenge returns',async({page,context,browserName})=>{
    test.skip(browserName!=='chromium','Native multi-contact driver uses Chromium CDP.');
    await page.addInitScript(()=>{Math.random=()=>.1;const now=Date.now;window.clockOffset=0;Date.now=()=>now()+window.clockOffset;});
    await page.goto(game+'/?test=1');
    await page.locator('[data-gate-key="1"]').tap();await page.locator('#play').tap();
    const client=await context.newCDPSession(page);
    const touches=[];
    for(const action of ['right','throttle']){
      const box=await page.locator('[data-input="'+action+'"]').boundingBox();
      touches.push({id:touches.length+1,x:box.x+box.width/2,y:box.y+box.height/2,radiusX:5,radiusY:5});
    }
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
    await expect.poll(()=>page.evaluate(k=>window[k].held,key)).toEqual(expect.arrayContaining(['right','throttle']));
    await expect.poll(()=>page.evaluate(k=>window[k].speed,key)).toBeGreaterThan(0);
    await page.evaluate(()=>{window.clockOffset=600001;});
    await expect(page.locator('#learning-gate')).toBeVisible();
    expect(await page.evaluate(k=>window[k].held,key)).toEqual([]);
    await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    await page.locator('[data-gate-key="1"]').tap();
    expect(await page.evaluate(k=>window[k].held,key)).toEqual([]);
  });
}
