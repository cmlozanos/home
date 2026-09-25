const {test,expect} = require('./helpers/learning-fixture.cjs');

function trackErrors(page) {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  return errors;
}
async function openFruit(page,mode='garden') {
  await page.goto('fruit-splash/?test=1');
  await page.locator('[data-mode="'+mode+'"]').click();
  await page.locator('#play').click();
  await expect(page.locator('#hud')).toBeVisible();
}
async function swipeFruit(page) {
  await page.waitForFunction(()=>window.fruitDebug.snapshot().fruits.some(f=>!f.bomb&&f.y<750&&f.y>180));
  const geometry=await page.evaluate(()=>{
    const s=window.fruitDebug.snapshot(),f=s.fruits.find(f=>!f.bomb&&f.y<750&&f.y>180),r=document.getElementById('game').getBoundingClientRect();
    return {x:f.x*r.width/s.width,height:r.height};
  });
  // A full vertical stroke still intersects the moving fruit if CI input is delayed.
  await page.mouse.move(geometry.x,geometry.height*.9);
  await page.mouse.down();
  await page.mouse.move(geometry.x,geometry.height*.2);
  await page.mouse.up();
}

test('fruit: real swipe scores, pause freezes, resume and retry work',async({page})=>{
  const errors=trackErrors(page);
  await page.addInitScript(()=>{Math.random=()=>.5;});
  await openFruit(page);
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
  await swipeFruit(page);
  await expect.poll(()=>page.evaluate(()=>window.fruitDebug.snapshot().score)).toBeGreaterThan(0);
  await page.locator('#pause').click();
  const before=await page.evaluate(()=>window.fruitDebug.snapshot().elapsed);
  await page.waitForTimeout(180);
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().elapsed)).toBe(before);
  await page.locator('#resume').click();
  await expect.poll(()=>page.evaluate(()=>window.fruitDebug.snapshot().elapsed)).toBeGreaterThan(before);
  await page.locator('#pause').click();
  await page.locator('#menu-button').click();
  await expect(page.locator('#menu')).toBeVisible();
  expect(Number(await page.locator('#best').textContent())).toBeGreaterThan(0);
  await page.reload();
  expect(Number(await page.locator('#best').textContent())).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('fruit: three difficulty choices and two independent fingers',async({page})=>{
  const errors=trackErrors(page);
  await openFruit(page,'classic');
  await expect(page.locator('#remaining')).toHaveText('♥♥♥');
  const canvas=page.locator('#game');
  await canvas.dispatchEvent('pointerdown',{pointerId:101,pointerType:'touch',clientX:60,clientY:240,buttons:1});
  await canvas.dispatchEvent('pointerdown',{pointerId:102,pointerType:'touch',clientX:160,clientY:240,buttons:1});
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().pointers)).toBe(2);
  await canvas.dispatchEvent('pointercancel',{pointerId:101,pointerType:'touch'});
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().pointers)).toBe(1);
  await canvas.dispatchEvent('pointerup',{pointerId:102,pointerType:'touch'});
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().pointers)).toBe(0);
  await page.locator('#pause').click();await page.locator('#menu-button').click();
  await page.locator('[data-mode="rush"]').click();await page.locator('#play').click();
  await expect(page.locator('#remaining')).toHaveText('60');
  await expect.poll(()=>page.evaluate(()=>window.fruitDebug.snapshot().fruits.length)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().fruits.some(f=>f.bomb))).toBe(false);
  expect(errors).toEqual([]);
});

test('orbit: create bodies, pause, save, reload, resume and templates',async({page})=>{
  const errors=trackErrors(page);
  await page.goto('orbit-lab/?test=1');
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
  await page.locator('#start').click();
  await expect(page.locator('#pause')).toBeVisible();
  await page.locator('#pause').click();
  const initial=await page.evaluate(()=>window.__orbitDiagnostics.bodyCount);
  const box=await page.locator('#space').boundingBox();
  await page.locator('[data-body="rock"]').click();
  await page.mouse.click(box.width*.27,box.height*.43);
  await expect.poll(()=>page.evaluate(()=>window.__orbitDiagnostics.bodyCount)).toBe(initial+1);
  const positions=await page.evaluate(()=>window.__orbitDiagnostics.bodies.map(({screenX,screenY,...body})=>body));
  await page.waitForTimeout(180);
  expect(await page.evaluate(()=>window.__orbitDiagnostics.bodies.map(({screenX,screenY,...body})=>body))).toEqual(positions);
  await page.locator('#save').click();
  await page.reload();
  await expect(page.locator('#resume')).toBeVisible();
  await page.locator('#resume').click();
  expect(await page.evaluate(()=>window.__orbitDiagnostics.bodyCount)).toBe(initial+1);
  await page.locator('#reset').click();
  await page.locator('[data-template="binary"]').click();
  expect(await page.evaluate(()=>window.__orbitDiagnostics.bodies.filter(b=>b.type==='star').length)).toBe(2);
  expect(errors).toEqual([]);
});

test('orbit: launch gesture and simultaneous touches are independent',async({page})=>{
  const errors=trackErrors(page);
  await page.goto('orbit-lab/?test=1');await page.locator('#start').click();await page.locator('#pause').click();
  await page.locator('#reset').click();await page.locator('[data-template="empty"]').click();await page.locator('#pause').click();
  await page.locator('[data-body="comet"]').click();
  const box=await page.locator('#space').boundingBox();
  await page.mouse.move(box.width*.25,box.height*.37);await page.mouse.down();await page.mouse.move(box.width*.35,box.height*.3,{steps:8});await page.mouse.up();
  expect(await page.evaluate(()=>window.__orbitDiagnostics.bodies.filter(b=>b.type==='comet').length)).toBe(1);
  const space=page.locator('#space');
  await space.dispatchEvent('pointerdown',{pointerId:51,pointerType:'touch',clientX:box.width*.25,clientY:box.height*.65,buttons:1});
  await space.dispatchEvent('pointerdown',{pointerId:52,pointerType:'touch',clientX:box.width*.7,clientY:box.height*.3,buttons:1});
  expect(await page.evaluate(()=>window.__orbitDiagnostics.pointers)).toBe(2);
  await space.dispatchEvent('pointerup',{pointerId:51,pointerType:'touch',clientX:box.width*.25,clientY:box.height*.65});
  await space.dispatchEvent('pointerup',{pointerId:52,pointerType:'touch',clientX:box.width*.7,clientY:box.height*.3});
  expect(await page.evaluate(()=>window.__orbitDiagnostics.bodyCount)).toBe(4);
  expect(errors).toEqual([]);
});

for(const game of ['fruit-splash','orbit-lab']) {
  test(game+': controls fit, blocked storage does not break startup, portrait/landscape',async({page})=>{
    const errors=trackErrors(page);
    await page.addInitScript(()=>{
      Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage disabled');}});
      // Chrome 95 lacks these; modern browsers must not rely on them either.
      window.structuredClone=undefined;
      CanvasRenderingContext2D.prototype.roundRect=undefined;
    });
    await page.goto(game+'/?test=1');
    await expect(page.locator(game==='fruit-splash'?'#play':'#start')).toBeVisible();
    await page.locator(game==='fruit-splash'?'#play':'#start').click();
    for(const viewport of [{width:320,height:568},{width:740,height:360},{width:1280,height:800}]){
      await page.setViewportSize(viewport);
      await page.waitForTimeout(80);
      const outside=await page.locator('button:visible, a:visible').evaluateAll(elements=>elements.filter(e=>{
        const r=e.getBoundingClientRect();return r.width<30||r.height<30||r.x<-.5||r.y<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5;
      }).map(e=>e.id||e.getAttribute('aria-label')));
      expect(outside).toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test(game+': installs offline shell without deleting other games caches',async({page,context,browserName})=>{
    test.skip(browserName==='webkit','Offline service worker is covered by Chromium; WebKit gameplay is covered separately.');
    const errors=trackErrors(page);
    await page.goto(game+'/?test=1');
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('other-game-sentinel');});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    const manifest=await page.evaluate(async()=>{const href=document.querySelector('link[rel="manifest"]').href;return(await fetch(href)).json();});
    expect(manifest.display).toBe('standalone');
    for(const icon of manifest.icons)expect((await page.request.get(new URL(icon.src,page.url()).href)).ok()).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await page.locator(game==='fruit-splash'?'#play':'#start').click();
    await expect(page.locator(game==='fruit-splash'?'#hud':'#pause')).toBeVisible();
    expect(await page.evaluate(()=>caches.has('other-game-sentinel'))).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('home links both new games and retains existing games',async({page})=>{
  await page.goto('./');
  await expect(page.getByRole('link').filter({hasText:'Fruit Splash'})).toHaveAttribute('href',/\/home\/fruit-splash\//);
  await expect(page.getByRole('link').filter({hasText:'Órbita'})).toHaveAttribute('href',/\/home\/orbit-lab\//);
  await expect(page.getByRole('link').filter({hasText:'Turbo Loop Legends'})).toBeVisible();
  for(const slug of ['memory-garden','shape-studio','little-atelier','maze-meadow']) await expect(page.locator('a[href="https://cmlozanos.github.io/home/'+slug+'/"]')).toBeVisible();
});

test('fruit: adventure reaches game over and restarts with three lives',async({page})=>{
  const errors=trackErrors(page);
  await openFruit(page,'classic');
  await expect(page.locator('#dialog')).toBeVisible({timeout:15000});
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().lives)).toBe(0);
  await expect(page.locator('#retry')).toBeVisible();
  await page.locator('#retry').click();
  await expect(page.locator('#remaining')).toHaveText('♥♥♥');
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().state)).toBe('playing');
  expect(errors).toEqual([]);
});

test('fruit: sixty-second round finishes and can be replayed',async({page},testInfo)=>{
  test.skip(!['tablet','chrome95'].includes(testInfo.project.name),'Full timed round is covered on current and genuine legacy Chromium.');
  test.setTimeout(100000);
  const errors=trackErrors(page);
  await openFruit(page,'rush');
  await expect(page.locator('#dialog')).toBeVisible({timeout:85000});
  await expect(page.locator('#remaining')).toHaveText('0');
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().state)).toBe('over');
  await page.locator('#retry').click();
  await expect(page.locator('#remaining')).toHaveText('60');
  expect(errors).toEqual([]);
});
