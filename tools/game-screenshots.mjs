import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base=process.env.GAMES_BASE_URL||'http://127.0.0.1:4177/';
await mkdir('test-results/visual',{recursive:true});
const browser=await chromium.launch();
try {
  for(const [name,viewport] of [['tablet',{width:1280,height:800}],['phone',{width:360,height:740}],['landscape',{width:740,height:360}]]){
    const context=await browser.newContext({viewport,deviceScaleFactor:1,hasTouch:true,isMobile:true});
    const page=await context.newPage();
    for(const game of ['fruit-splash','orbit-lab']){
      await page.goto(new URL(game+'/',base).href);
      await page.screenshot({path:'test-results/visual/'+game+'-'+name+'-menu.png'});
      await page.locator(game==='fruit-splash'?'#play':'#start').click();
      await page.waitForTimeout(900);
      await page.screenshot({path:'test-results/visual/'+game+'-'+name+'-play.png'});
    }
    await context.close();
  }
} finally { await browser.close(); }
console.log('Screenshots: test-results/visual/');
