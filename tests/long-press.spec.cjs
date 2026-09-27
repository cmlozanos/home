const {test,expect}=require('@playwright/test');
const {solveGate}=require('./helpers/learning-fixture.cjs');

const games=['','fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow','nitro-highway','pocket-karts','pulse-path','animal-quiz','rubik-solver'];
for(const game of games) test(game+': touch context menu is suppressed without blocking editing',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>.1;});
  await page.goto(game ? game+'/' : './');
  await solveGate(page);
  const result=await page.evaluate(()=>{
    const body=document.body;
    const desktop=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});
    body.dispatchEvent(desktop);
    body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:77}));
    const touch=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});
    body.dispatchEvent(touch);
    body.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:77}));
    const field=document.createElement('input');field.type='text';body.appendChild(field);
    const editing=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});field.dispatchEvent(editing);
    const selection=getComputedStyle(body).userSelect||getComputedStyle(body).webkitUserSelect;
    const fieldSelection=getComputedStyle(field).userSelect||getComputedStyle(field).webkitUserSelect;
    field.remove();
    return {touch:touch.defaultPrevented,desktop:desktop.defaultPrevented,editing:editing.defaultPrevented,selection,fieldSelection};
  });
  expect(result).toEqual({touch:true,desktop:false,editing:false,selection:'none',fieldSelection:'text'});
});
