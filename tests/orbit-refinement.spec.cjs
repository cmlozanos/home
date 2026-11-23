const {test,expect}=require('./helpers/learning-fixture.cjs');

test('orbit Home preserves universe without simulation or point gains',async({page})=>{
  await page.goto('orbit-lab/?test=1');
  await page.locator('#start').click();
  await page.getByRole('button',{name:'Inicio del juego',exact:true}).click();
  await expect(page.locator('#welcome')).toBeVisible();
  const snapshot=()=>page.evaluate(()=>({bodies:__orbitDiagnostics.bodies.map(b=>({id:b.id,x:b.x,y:b.y})),points:FamilyV2.read().points}));
  const before=await snapshot();
  await page.waitForTimeout(300);
  expect(await snapshot()).toEqual(before);
});

test('orbit scene follows theme and effective viewport while preserving linked text',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('orbit-lab/?test=1');
  await page.locator('family-v2-shell #theme').selectOption('dark');
  await expect.poll(()=>page.evaluate(()=>__orbitDiagnostics.theme)).toBe('dark');
  await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>280});window.dispatchEvent(new Event('resize')); });
  const size=await page.locator('#space').evaluate(c=>({buffer:c.height,css:c.getBoundingClientRect().height,dpr:Math.min(devicePixelRatio,1.5)}));
  expect(size.css).toBe(280);expect(size.buffer).toBe(Math.round(size.css*size.dpr));
  expect(await page.locator('#start').evaluate(e=>getComputedStyle(e).fontFamily)).toContain('Family School');
  expect(errors).toEqual([]);
});
