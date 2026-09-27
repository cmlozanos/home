// Local Home integration by default; READING_URLS may point to deployed games.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const {chromium,expect}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const games=['fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow','nitro-highway','pocket-karts','pulse-path','animal-quiz'];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json','.md':'text/plain; charset=utf-8'};

async function serve() {
  const server=http.createServer(async(req,res)=>{
    try {
      let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
      if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(await fs.readFile(file));
    } catch(error){res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {server,base:'http://127.0.0.1:'+server.address().port+'/'};
}
async function ready(page) {
  await expect(page.locator('#gate-word')).toBeVisible({timeout:15000});
  await expect(page.locator('.gate-pictures button')).toHaveCount(3);
  for(const button of await page.locator('.gate-pictures button').all())await expect(button).toBeEnabled({timeout:15000});
  const word=await page.locator('#gate-word').textContent();assert.match(word,/^[a-záéíóúüñ]{1,5}$/);
  assert.equal(await page.locator('.gate-pictures img').evaluateAll(nodes=>nodes.filter(n=>n.complete&&n.naturalWidth>0).length),3);
  return word;
}
async function correct(page) {
  const word=await ready(page);await page.getByRole('button',{name:word,exact:true}).click();
  await expect(page.locator('#learning-gate')).toHaveCount(0);
}
async function check(browser,url) {
  const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
  const timer=setTimeout(()=>context.close(),60000);
  try {
    await context.addCookies([{name:'family-learning-profile',value:encodeURIComponent(JSON.stringify({version:1,level:'advanced',reading:true,expiresAt:Date.now()+31536000000})),url:new URL(url).origin}]);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{Math.random=()=>.99;window.readingClockOffset=0;const now=Date.now;Date.now=()=>now()+window.readingClockOffset;});
    await page.goto(url);const word=await ready(page);
    const before=await page.locator('.gate-pictures button').evaluateAll(nodes=>nodes.map(n=>n.dataset.readingId));
    const wrong=page.locator('.gate-pictures button').filter({hasNot:page.locator('img[alt="'+word+'"]')}).first();
    await wrong.click();const next=await ready(page);assert.notEqual(next,word);
    const after=await page.locator('.gate-pictures button').evaluateAll(nodes=>nodes.map(n=>n.dataset.readingId));
    assert.ok(after.every(id=>!before.includes(id)));
    await correct(page);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:15000}).toBe(true);
    const cacheImages=await page.evaluate(async()=>{
      const paths=new Set();
      for(const key of await caches.keys())for(const request of await (await caches.open(key)).keys()) {
        const pathname=new URL(request.url).pathname;
        if(/\/reading-images\/\d+\.png$/.test(pathname))paths.add(pathname);
      }
      return paths.size;
    });
    assert.equal(cacheImages,100,'all 100 reading images are cached, not only the visible three');
    await context.setOffline(true);await page.reload();await ready(page);await correct(page);
    await page.evaluate(()=>{readingClockOffset+=600001;document.dispatchEvent(new Event('visibilitychange'));});
    await ready(page);await correct(page);
    await context.clearCookies();
    await page.evaluate(()=>{readingClockOffset+=600001;document.dispatchEvent(new Event('visibilitychange'));});
    await expect(page.locator('#learning-gate')).toBeVisible();await expect(page.locator('#gate-reading')).toBeHidden();
    assert.equal(await page.locator('#gate-trace').isVisible()||await page.locator('#gate-prompt').isVisible(),true);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({url,reading:'entry, error/full rotation, success, 100 offline images, offline reload, 10-minute recurrence, no-cookie minima PASS'}));
  } finally {clearTimeout(timer);await context.close();}
}
(async()=>{
  let local,browser;
  try {
    const urls=process.env.READING_URLS?JSON.parse(process.env.READING_URLS):null;
    if(!urls)local=await serve();
    const targets=urls||games.map(game=>local.base+game+'/');
    assert.ok(Array.isArray(targets)&&targets.length>0);
    for(const url of targets)assert.ok(['http:','https:'].includes(new URL(url).protocol));
    browser=await chromium.launch({executablePath:process.env.CHROME95_PATH||undefined});
    console.log('Reading integrations with '+await browser.version());
    for(const url of targets)await check(browser,url);
  } finally {if(browser)await browser.close();if(local)await new Promise(resolve=>local.server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
