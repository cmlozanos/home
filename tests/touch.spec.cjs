const {test,expect}=require('@playwright/test');

test('native multitouch cuts fruit and creates two planets',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','Native multi-contact input uses Chromium CDP; pointer behavior is separately covered on WebKit.');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{Math.random=()=>.5;});
  const input=await context.newCDPSession(page);
  await page.goto('fruit-splash/?test=1');
  const play=await page.locator('#play').boundingBox();
  await page.touchscreen.tap(play.x+play.width/2,play.y+play.height/2);
  await page.waitForFunction(()=>window.fruitDebug.snapshot().fruits.some(f=>f.y<600&&f.y>220));
  const position=await page.evaluate(()=>{
    const s=window.fruitDebug.snapshot(),f=s.fruits.find(f=>f.y<600&&f.y>220),rect=document.getElementById('game').getBoundingClientRect();
    return {x:f.x*rect.width/s.width,y:f.y*rect.height/s.height,r:f.r*rect.width/s.width,w:rect.width,h:rect.height};
  });
  let touches=[{id:11,x:position.x,y:position.h*.9,radiusX:5,radiusY:5},{id:12,x:position.w*.85,y:position.h*.7,radiusX:5,radiusY:5}];
  await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().pointers)).toBe(2);
  touches[0].y=position.h*.2;
  touches[1].x-=10;
  await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches});
  await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().pointers)).toBe(0);
  expect(await page.evaluate(()=>window.fruitDebug.snapshot().score)).toBeGreaterThan(0);

  await page.goto('orbit-lab/?test=1');
  await page.locator('#start').tap();await page.locator('#pause').tap();
  const before=await page.evaluate(()=>window.__orbitDiagnostics.bodyCount),box=await page.locator('#space').boundingBox();
  touches=[{id:21,x:box.width*.2,y:box.height*.43,radiusX:5,radiusY:5},{id:22,x:box.width*.7,y:box.height*.6,radiusX:5,radiusY:5}];
  await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
  expect(await page.evaluate(()=>window.__orbitDiagnostics.pointers)).toBe(2);
  await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(await page.evaluate(()=>window.__orbitDiagnostics.bodyCount)).toBe(before+2);
  expect(await page.evaluate(()=>window.__orbitDiagnostics.pointers)).toBe(0);
  expect(errors).toEqual([]);
});
