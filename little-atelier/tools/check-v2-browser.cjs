/* Focused V2 browser checks; run from the game's directory against make serve or the home preview. */
const assert = require('node:assert/strict');
const {chromium,webkit} = require('@playwright/test');
const path = require('node:path');
const slug = path.basename(path.resolve(__dirname, '..'));
const base = process.env.GAME_URL || 'http://127.0.0.1:4177/' + slug + '/';
async function gate(page) {
  const g = page.locator('#learning-gate');
  if (!await g.count()) return;
  if (await page.locator('#gate-prompt').isVisible()) {
    const m = (await page.locator('#gate-prompt').textContent()).match(/(\d)\s*([+−-])\s*(\d)/);
    await page.locator('[data-gate-key="' + (m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3]) + '"]').click();
  } else {
    const c = page.locator('#gate-trace'), box = await c.boundingBox();
    const strokes = await c.evaluate(n => LearningGate.Core.glyphs[n.dataset.letter]);
    for (const stroke of strokes) {
      await page.mouse.move(box.x + stroke[0][0] * box.width/100, box.y + stroke[0][1] * box.height/100);
      await page.mouse.down();
      for (const p of stroke.slice(1)) await page.mouse.move(box.x + p[0]*box.width/100, box.y + p[1]*box.height/100, {steps:3});
      await page.mouse.up();
    }
  }
  await g.waitFor({state:'detached'});
}
async function adults(page) {
  await page.locator('family-v2-shell #adults').click();
  const text = await page.locator('family-v2-shell #gate-label').textContent();
  const numbers = text.match(/\d+/g).map(Number);
  await page.locator('family-v2-shell #answer').fill(String(numbers[0]*numbers[1]));
  await page.locator('family-v2-shell #gate button').click();
}
async function solve(page) {
  if (slug === 'memory-garden') {
    await page.waitForFunction(() => !document.getElementById('board').classList.contains('preview'));
    const pairs = await page.locator('.card').evaluateAll(cards => {const p={};cards.forEach(c=>(p[c.dataset.animal]||(p[c.dataset.animal]=[])).push(c.dataset.card));return Object.values(p);});
    for (const pair of pairs) {
      for (const id of pair) await page.locator('[data-card="'+id+'"]').click();
      await page.waitForFunction(id => document.querySelector('[data-card="'+id+'"]').classList.contains('matched'), pair[0]);
    }
  } else if (slug === 'shape-studio') {
    const ids = await page.locator('.piece').evaluateAll(nodes=>nodes.map(n=>n.dataset.shape));
    for (const id of ids) {await page.locator('.piece[data-shape="'+id+'"]').click();await page.locator('.slot[data-shape="'+id+'"]').click();}
  } else if (slug === 'maze-meadow') {
    const state = await page.evaluate(()=>__meadow.read());
    for (let i=1;i<state.path.length;i++) {
      const d=state.path[i]-state.path[i-1];
      await page.locator('[data-direction="'+(d===1?1:d===-1?3:d===state.size?2:0)+'"]').click();
    }
  }
}
(async()=>{
  const browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch(process.env.CHROME95_PATH?{executablePath:process.env.CHROME95_PATH}:{});
  try {
    for (const viewport of [{width:1280,height:800},{width:1024,height:600},{width:360,height:740},{width:740,height:360}]) {
      const context=await browser.newContext({viewport,hasTouch:true});
      const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(() => { const now=Date.now;window.testClockOffset=0;Date.now=()=>now()+window.testClockOffset;Math.random=()=>0.1; });
      await page.goto(base+'?test=1');await gate(page);await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
      for (const level of [0,1,2]) {
        if (slug==='memory-garden'||slug==='shape-studio')await page.locator('button[data-level="'+level+'"]').click();
        if(slug==='maze-meadow')await page.locator('[data-size="'+[4,6,8][level]+'"]').click();
        const geometry=await page.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,boxes:Array.from(document.querySelectorAll('#board .card,#slots .slot,#tray .piece,#paper,#maze')).map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,b:r.bottom,r:r.right,w:r.width,h:r.height};})}));
        assert(geometry.sw<=geometry.w+1&&geometry.sh<=geometry.h+1,JSON.stringify({slug,viewport,level,geometry}));
        for(const b of geometry.boxes)assert(b.x>=0&&b.y>=0&&b.r<=geometry.w+1&&b.b<=geometry.h+1&&b.w>=30&&b.h>=30,JSON.stringify({slug,viewport,level,b}));
      }
      // Regression inputs exercise actual handlers, never a state-setting test hook.
      if(slug==='memory-garden') {
        await page.waitForFunction(()=>!document.getElementById('board').classList.contains('preview'));
        const cards=await page.locator('.card').evaluateAll(ns=>ns.map(n=>({id:n.dataset.card,a:n.dataset.animal})));
        const first=cards[0],other=cards.find(c=>c.a!==first.a),third=cards.find(c=>c.id!==first.id&&c.id!==other.id);
        await page.locator('[data-card="'+first.id+'"]').click();await page.locator('[data-card="'+first.id+'"]').click();assert.equal(await page.locator('#moves').textContent(),'0');
        await page.locator('[data-card="'+other.id+'"]').click();await page.locator('[data-card="'+third.id+'"]').click();assert.equal(await page.locator('.card.open').count(),2);
        await page.locator('#restart').click();await page.waitForTimeout(1100);assert.equal(await page.locator('#moves').textContent(),'0');assert.equal(await page.locator('.card.matched').count(),0);
      }
      if(slug==='shape-studio') {
        await page.locator('.piece[data-shape="circle"]').click();await page.locator('.slot[data-shape="triangle"]').click();assert.equal(await page.locator('.slot.placed').count(),0);
        await page.locator('.piece[data-shape="square"]').dispatchEvent('pointerdown',{pointerId:77,pointerType:'touch',isPrimary:false,button:0,clientX:40,clientY:160});assert.equal(await page.locator('.drag-ghost').count(),0);
        const from=await page.locator('.piece[data-shape="square"]').boundingBox();await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(1,1,{steps:8});await page.mouse.up();assert.equal(await page.locator('.slot.placed').count(),0);assert.equal(await page.locator('.drag-ghost').count(),0);
        await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.locator('.piece').first().dispatchEvent('pointercancel',{pointerId:999,pointerType:'touch'});assert.equal(await page.locator('.drag-ghost').count(),1,'secondary pointer cancellation cannot cancel the primary drag');await page.mouse.up();assert.equal(await page.locator('.drag-ghost').count(),0);
      }
      if(slug==='little-atelier') {
        const before=await page.evaluate(()=>__atelier.read().actions.length);
        await page.locator('#paper').dispatchEvent('pointerdown',{pointerId:77,pointerType:'touch',isPrimary:false,button:0,clientX:40,clientY:160});
        await page.locator('#paper').dispatchEvent('pointerup',{pointerId:77,pointerType:'touch'});
        assert.equal(await page.evaluate(()=>__atelier.read().actions.length),before,'secondary finger cannot start a new stroke after primary ends');
      }
      if(slug==='maze-meadow') {
        const original=await page.evaluate(()=>__meadow.read());
        const blocked=original.cells[0].findIndex(Boolean);await page.locator('[data-direction="'+blocked+'"]').click();assert.equal(await page.evaluate(()=>__meadow.read().position),0);
        const box=await page.locator('#maze').boundingBox();
        await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.locator('#reset').evaluate(n=>n.click());await page.mouse.move(box.x+box.width*.8,box.y+box.height*.8);await page.mouse.up();assert.equal(await page.evaluate(()=>__meadow.read().position),0,'reset discards stale held gesture');
        assert.deepEqual(await page.evaluate(()=>__meadow.read().cells),original.cells,'reset keeps the same maze');
        // Reach the goal and restart before the delayed win modal can appear.
        await solve(page);await page.locator('#reset').evaluate(n=>n.click());await page.waitForTimeout(350);assert.equal(await page.locator('#win').isVisible(),false);assert.equal(await page.evaluate(()=>__meadow.read().won),false);
        await page.locator('#new-maze').click();assert.equal(await page.evaluate(()=>__meadow.read().round),original.round+1);
      }
      // Real gameplay and score on the smallest/large difficulty selected above.
      const before=await page.evaluate(()=>FamilyV2.read().points);
      if(slug==='little-atelier') {
        const b=await page.locator('#paper').boundingBox();await page.mouse.move(b.x+b.width*.2,b.y+b.height*.3);await page.mouse.down();await page.mouse.move(b.x+b.width*.7,b.y+b.height*.6,{steps:8});await page.mouse.up();
        assert.equal(await page.evaluate(()=>__atelier.read().actions.length),1);
        await page.locator('#undo').click();assert.equal(await page.evaluate(()=>__atelier.read().actions.length),0);
        await page.locator('#redo').click();assert.equal(await page.evaluate(()=>__atelier.read().actions.length),1);
        const download=page.waitForEvent('download');await page.locator('#download').click();const exported=await download;assert.equal(exported.suggestedFilename(),'mi-pequeno-atelier.png');const png=require('node:fs').readFileSync(await exported.path());assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(png.length>1000);
      } else {
        await solve(page);await page.locator('#win').waitFor({state:'visible'});
        assert.equal(await page.evaluate(()=>FamilyV2.read().points)-before,slug==='maze-meadow'?1:8);
        const score=await page.evaluate(()=>FamilyV2.read().points);await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>FamilyV2.read().points),score);
        await page.locator(slug==='maze-meadow'?'#next':'#replay').click();
      }
      // Independent pause reasons: Adult close cannot release an active educational gate.
      await page.locator('family-v2-shell #adults').click();
      await page.evaluate(()=>{window.testClockOffset+=600001;window.dispatchEvent(new Event('focus'));});
      await page.locator('#learning-gate').waitFor({state:'visible'});
      await page.waitForFunction(()=>!document.querySelector('family-v2-shell').shadowRoot.querySelector('dialog').open);
      if(slug==='shape-studio') {
        await page.evaluate(()=>{document.querySelector('.piece').click();document.querySelector('.slot').click();});
        assert.equal(await page.locator('.slot.placed').count(),0);
      }
      if(slug==='memory-garden') {
        await page.waitForTimeout(2400);assert(await page.locator('#board').evaluate(n=>n.classList.contains('preview')));
      }
      if(slug==='maze-meadow') {
        const position=await page.evaluate(()=>__meadow.read().position);
        await page.evaluate(()=>document.querySelector('[data-direction]').click());
        assert.equal(await page.evaluate(()=>__meadow.read().position),position);
      }
      if(slug==='little-atelier') {
        const count=await page.evaluate(()=>__atelier.read().actions.length);
        await page.locator('#paper').dispatchEvent('pointerdown',{pointerId:99,pointerType:'touch',clientX:50,clientY:150});
        await page.locator('#paper').dispatchEvent('pointerup',{pointerId:99,pointerType:'touch'});
        assert.equal(await page.evaluate(()=>__atelier.read().actions.length),count);
      }
      await gate(page);
      const url=page.url();
      const retained=await page.evaluate(()=>window.__atelier?JSON.stringify(__atelier.read().actions):window.__meadow?JSON.stringify(__meadow.read().cells):document.getElementById('board')?document.getElementById('board').innerHTML:document.getElementById('tray').innerHTML);
      await page.locator('family-v2-shell #home').click();await page.locator('#game-menu').waitFor({state:'visible'});assert.equal(page.url(),url);
      await page.locator('#menu-continue').click();
      assert.equal(await page.evaluate(()=>window.__atelier?JSON.stringify(__atelier.read().actions):window.__meadow?JSON.stringify(__meadow.read().cells):document.getElementById('board')?document.getElementById('board').innerHTML:document.getElementById('tray').innerHTML),retained);
      await adults(page);await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
      await page.locator('#help').click();await page.locator(slug==='memory-garden'||slug==='shape-studio'?'#help-panel':'#help-dialog').waitFor({state:'visible'});
      await page.locator('#close-help').click();
      await page.locator('family-v2-shell #theme').selectOption('dark');assert.equal(await page.locator('html').getAttribute('data-family-theme'),'dark');
      await page.locator('family-v2-shell #theme').selectOption('light');
      if(process.env.BROWSER!=='webkit') {
      await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
      const familyURLs=await page.evaluate(async()=>{const keys=await caches.keys();const k=keys.find(k=>k.indexOf(location.pathname.split('/').filter(Boolean).pop()+'-')===0);const c=await caches.open(k);return (await c.keys()).map(r=>r.url);});
      assert.equal(familyURLs.filter(u=>u.includes('/family-v2/')).length,4);
      await context.setOffline(true);await page.reload();await gate(page);assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');assert.equal(await page.evaluate(()=>FamilyV2.version),'2.0.0');await context.setOffline(false);
      }
      assert.deepEqual(errors,[]);await context.close();
      console.log(slug+': '+viewport.width+'x'+viewport.height+' fits all levels; gameplay, score, native settings and theme OK');
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
