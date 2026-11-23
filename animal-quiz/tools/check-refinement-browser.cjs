// Native refinement regression for the seven activity-owned renderers.
// Existing home Playwright runtime only; no installs or changes to shared files.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = process.env.GAMES_BASE_URL || 'http://127.0.0.1:4177/';
const evidence = path.resolve(__dirname, '../../docs/v2/refinement/evidence/activities');
const games = ['animal-quiz','fruit-splash','memory-garden','shape-studio','little-atelier','maze-meadow','rubik-solver'];
async function gate(page) {
  const prompt = page.locator('#gate-prompt');
  if (!await page.locator('#learning-gate').count()) return;
  const m = (await prompt.textContent()).match(/(\d)\s*([+−-])\s*(\d)/);
  assert(m, 'Deterministic entry challenge is arithmetic');
  await page.locator('[data-gate-key="'+(m[2]==='+'?+m[1]+ +m[3]:+m[1]- +m[3])+'"]').click();
  await page.locator('#learning-gate').waitFor({state:'detached'});
}
(async () => {
  fs.mkdirSync(evidence, {recursive:true});
  const browser = await chromium.launch();
  try {
    for (const viewport of [{width:1280,height:800},{width:740,height:360}]) {
      for (const game of games) {
        const context = await browser.newContext({viewport, serviceWorkers:'block'});
        const page = await context.newPage(), errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.addInitScript(()=>{Math.random=()=>.1;});
        await page.goto(base+game+'/?test=1'); await gate(page);
        await page.evaluate(()=>FamilyV2.fontReady);
        if(game==='animal-quiz') await page.locator('[data-profile="full"]').click();
        if(game==='memory-garden') await page.waitForFunction(()=>!document.getElementById('board').classList.contains('preview'));
        if(game==='rubik-solver') {
          await page.locator('#loadSolvedBtn').click();
          assert((await page.locator('#photoCanvas').evaluate(c=>c.getContext('2d').font)).includes('Family School'),'Rubik Canvas prompt uses FamilyV2.fontFamily');
        }
        const before = await page.evaluate(()=>({
          store:JSON.stringify(Object.keys(localStorage).filter(k=>!k.startsWith('family-')).map(k=>[k,localStorage[k]])),
          drawing:window.__atelier?JSON.stringify(__atelier.read().actions):null
        }));
        for (const theme of ['light','dark']) {
          await page.locator('family-v2-shell #theme').selectOption(theme);
          await page.waitForFunction(t=>document.documentElement.dataset.nativeTheme===t,theme);
          await page.waitForTimeout(400);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,game+' horizontal overflow');
          if(game!=='rubik-solver')assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),true,game+' vertical overflow');
          const fonts=await page.locator('button,h1,h2,input,select,#score,.score,.progress,.brand').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().width&&getComputedStyle(n).visibility!=='hidden').map(n=>[n.id||n.className,getComputedStyle(n).fontFamily]));
          assert(fonts.every(([,f])=>f.includes('Family School')),JSON.stringify({game,fonts}));
          await page.screenshot({path:path.join(evidence,`${game}-${viewport.width}-${theme}.png`)});
        }
        // Public appearance event bridge and API-precedence branch (contract test, not shell acceptance).
        await page.evaluate(()=>{
          window.__realTheme=FamilyV2.theme;window.__realMotion=FamilyV2.motionAllowed;
          FamilyV2.theme=()=> 'light';FamilyV2.motionAllowed=()=>false;
          window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme:'dark',motion:true}}));
        });
        assert.equal(await page.locator('html').getAttribute('data-native-theme'),'light');
        assert.equal(await page.locator('html').getAttribute('data-native-motion'),'false');
        if(game==='fruit-splash') {
          await page.waitForTimeout(150);
          const first=await page.locator('#game').evaluate(c=>c.toDataURL());await page.waitForTimeout(120);
          assert(await page.locator('#game').evaluate((c,first)=>c.toDataURL()===first,first),'Menu canvas is static with decorative motion off');
        }
        const animations=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(n=>getComputedStyle(n).animationName!=='none').map(n=>n.className));
        assert.deepEqual(animations,[],game+' decorative CSS animation disabled');
        await page.evaluate(()=>{
          FamilyV2.theme=window.__realTheme;FamilyV2.motionAllowed=window.__realMotion;
          window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme:document.documentElement.dataset.familyTheme,motion:true}}));
        });
        await page.evaluate(()=>{
          const api=window.FamilyV2;window.FamilyV2=undefined;
          window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme:'dark',motion:false}}));
          window.FamilyV2=api;
        });
        assert.equal(await page.locator('html').getAttribute('data-native-theme'),'dark');
        assert.equal(await page.locator('html').getAttribute('data-native-motion'),'false');
        const after = await page.evaluate(()=>({
          store:JSON.stringify(Object.keys(localStorage).filter(k=>!k.startsWith('family-')).map(k=>[k,localStorage[k]])),
          drawing:window.__atelier?JSON.stringify(__atelier.read().actions):null
        }));
        assert.deepEqual(after,before,game+' appearance never edits native saved data');
        assert.deepEqual(errors,[],game+' runtime errors');
        console.log(`PASS ${game} ${viewport.width}x${viewport.height}: day/night, computed linked font, motion/API contract, geometry and unchanged native saves`);
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
