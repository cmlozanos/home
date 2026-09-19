import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
const base=process.env.GAMES_BASE_URL||'http://127.0.0.1:4177/';
await mkdir('test-results/visual',{recursive:true});
const browser=await chromium.launch();
try {
  for(const [name,viewport] of [['tablet',{width:1280,height:800}],['phone',{width:360,height:740}],['landscape',{width:740,height:360}]]){
    const context=await browser.newContext({viewport,deviceScaleFactor:1,hasTouch:true,isMobile:true});
    const page=await context.newPage();
    for(const game of ['fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow']){
      await page.goto(new URL(game+'/',base).href);
      await page.screenshot({path:'test-results/visual/'+game+'-'+name+'-menu.png'});
      if(game==='fruit-splash'||game==='orbit-lab') await page.locator(game==='fruit-splash'?'#play':'#start').click();
      if(game==='orbit-lab') { await page.locator('#reset').click(); await page.locator('[data-template="life"]').click(); }
      await page.waitForTimeout(900);
      await page.screenshot({path:'test-results/visual/'+game+'-'+name+'-play.png'});
    }
    await context.close();
  }
  const sheet=await browser.newPage({viewport:{width:1440,height:1010},deviceScaleFactor:1});
  const games=['orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow'];
  let html='<style>body{margin:0;background:#101923;color:#e5edf2;font:16px system-ui;padding:16px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}figure{margin:0}img{width:100%;height:265px;object-fit:contain;background:#17212e}figcaption{padding:5px}</style>';
  for(const game of games){const png=await readFile('test-results/visual/'+game+'-tablet-play.png');html+='<figure><img src="data:image/png;base64,'+png.toString('base64')+'"><figcaption>'+game+'</figcaption></figure>';}
  await sheet.setContent(html);await sheet.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await sheet.screenshot({path:'test-results/visual/contact-sheet.png',fullPage:true});
} finally { await browser.close(); }
console.log('Screenshots: test-results/visual/');
