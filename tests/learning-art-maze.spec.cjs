const {test,expect}=require('@playwright/test');

async function artState(page){return page.evaluate(()=>window.__atelier.read());}
async function mazeState(page){return page.evaluate(()=>window.__meadow.read());}
async function start(page,slug){
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(slug+'/?test=1');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  return errors;
}

test('Atelier paints, stamps, erases, restores and downloads an actual PNG',async({page},testInfo)=>{
  const errors=await start(page,'little-atelier');
  expect((await artState(page)).sound).toBe(false);
  const paper=page.locator('#paper');const box=await paper.boundingBox();
  await page.mouse.move(box.x+box.width*.22,box.y+box.height*.35);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.65,box.y+box.height*.55,{steps:14});await page.mouse.up();
  await expect.poll(async()=>(await artState(page)).actions.length).toBe(1);
  // Navigate immediately: pagehide must flush the final stroke before its save debounce.
  await page.reload();expect((await artState(page)).actions.length).toBe(1);
  await page.getByRole('button',{name:'Sello flor',exact:true}).click();
  await page.touchscreen.tap(box.x+box.width*.72,box.y+box.height*.28);
  await expect.poll(async()=>(await artState(page)).actions.length).toBe(2);
  expect((await artState(page)).actions[1].tool).toBe('flower');
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();expect((await artState(page)).actions.length).toBe(1);
  await page.getByRole('button',{name:'Rehacer',exact:true}).click();expect((await artState(page)).actions.length).toBe(2);
  await page.getByRole('button',{name:'Goma de borrar',exact:true}).click();
  await page.touchscreen.tap(box.x+box.width*.32,box.y+box.height*.4);
  expect((await artState(page)).actions[2].tool).toBe('eraser');
  await page.getByRole('button',{name:'Jardín',exact:true}).click();
  await page.getByRole('button',{name:'Borrar dibujo',exact:true}).click();
  await page.getByRole('button',{name:'Conservar dibujo',exact:true}).click();expect((await artState(page)).actions.length).toBe(3);
  await expect.poll(()=>page.evaluate(()=>{const saved=JSON.parse(localStorage.getItem('little-atelier-drawing-v1'));return saved?saved.actions.length:0;})).toBe(3);
  await page.reload();await expect.poll(async()=>(await artState(page)).actions.length).toBe(3);
  expect((await artState(page)).background).toBe('garden');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Guardar dibujo como imagen PNG',exact:true}).click();
  const download=await downloadPromise;expect(download.suggestedFilename()).toBe('mi-pequeno-atelier.png');
  const file=await download.path();const buffer=require('node:fs').readFileSync(file);expect(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))).toBe(true);expect(buffer.length).toBeGreaterThan(1000);
  await page.screenshot({path:testInfo.outputPath('atelier.png'),fullPage:true});
  await page.getByRole('button',{name:'Borrar dibujo',exact:true}).click();await page.getByRole('button',{name:'Confirmar borrar dibujo',exact:true}).click();expect((await artState(page)).actions.length).toBe(0);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();expect((await artState(page)).actions.length).toBe(3);
  expect(errors).toEqual([]);
});

test('Meadow blocks walls, accepts touch, solves real paths, advances and changes size',async({page},testInfo)=>{
  const errors=await start(page,'maze-meadow');let state=await mazeState(page);expect(state.sound).toBe(false);
  const keys=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
  const blocked=state.cells[0].findIndex(Boolean);await page.keyboard.press(keys[blocked]);expect((await mazeState(page)).position).toBe(0);
  await expect.poll(async()=>(await mazeState(page)).geometry.cell).toBeGreaterThan(5);
  state=await mazeState(page);const next=state.path[1],box=await page.locator('#maze').boundingBox();
  await page.touchscreen.tap(box.x+state.geometry.x+(next%state.size+.5)*state.geometry.cell,box.y+state.geometry.y+(Math.floor(next/state.size)+.5)*state.geometry.cell);
  expect((await mazeState(page)).position).toBe(next);
  await page.getByRole('button',{name:'Mostrar camino de ayuda',exact:true}).click();expect((await mazeState(page)).hint).toBe(true);
  const names=['Arriba','Derecha','Abajo','Izquierda'];state=await mazeState(page);const route=state.path.slice();
  for(let i=1;i<route.length;i++){const delta=route[i]-route[i-1];const d=delta===1?1:delta===-1?3:delta===state.size?2:0;await page.getByRole('button',{name:names[d],exact:true}).click();}
  await expect(page.getByRole('button',{name:'Jugar siguiente laberinto',exact:true})).toBeVisible();state=await mazeState(page);expect(state.won).toBe(true);expect(state.position).toBe(15);expect(state.completed).toBe(1);expect(state.collected.length).toBe(3);
  await page.getByRole('button',{name:'Jugar siguiente laberinto',exact:true}).click();expect((await mazeState(page)).round).toBe(1);expect((await mazeState(page)).position).toBe(0);
  await page.getByRole('button',{name:'Laberinto medio de 6 por 6',exact:true}).click();state=await mazeState(page);expect(state.cells.length).toBe(36);
  const before=JSON.stringify(state.cells);await page.getByRole('button',{name:'Volver al inicio del mismo laberinto',exact:true}).click();expect(JSON.stringify((await mazeState(page)).cells)).toBe(before);
  await page.getByRole('button',{name:'Laberinto grande de 8 por 8',exact:true}).click();expect((await mazeState(page)).cells.length).toBe(64);
  await page.getByRole('button',{name:'Mostrar camino de ayuda',exact:true}).click();await page.screenshot({path:testInfo.outputPath('meadow.png'),fullPage:true});
  await page.reload();expect((await mazeState(page)).size).toBe(8);expect((await mazeState(page)).completed).toBe(1);
  expect(errors).toEqual([]);
});

for(const slug of ['little-atelier','maze-meadow']){
  test(slug+' remains playable without storage and at 320px width',async({page})=>{
    await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage disabled for test');}});});
    await page.setViewportSize({width:320,height:640});const errors=await start(page,slug);
    await page.getByRole('button',{name:'Ayuda y opciones',exact:true}).click();await expect(page.getByRole('button',{name:'Activar sonido',exact:true})).toBeVisible();await page.getByRole('button',{name:'Cerrar ayuda',exact:true}).click();
    if(slug==='maze-meadow'){const state=await mazeState(page);const delta=state.path[1];await page.keyboard.press(delta===1?'ArrowRight':'ArrowDown');expect((await mazeState(page)).position).not.toBe(0);}
    else{const box=await page.locator('#paper').boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);expect((await artState(page)).actions.length).toBe(1);}
    expect(errors).toEqual([]);
  });
  test(slug+' opens offline through its isolated PWA cache',async({page,context,browserName})=>{
    test.skip(browserName==='webkit','Offline service worker is covered by Chromium; Safari gameplay is tested separately.');
    await start(page,slug);await page.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('other-game-sentinel');});
    await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);await page.goto(slug+'/?test=1&offline=1');
    await expect(page.locator('canvas')).toBeVisible();
    if(slug==='maze-meadow')expect((await mazeState(page)).cells.length).toBe(16);else expect((await artState(page)).actions.length).toBe(0);
    expect(await page.evaluate(()=>caches.has('other-game-sentinel'))).toBe(true);await context.setOffline(false);
  });
}
