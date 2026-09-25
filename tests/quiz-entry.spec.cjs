const {test,expect}=require('@playwright/test');

test('Quiz entry uses static Pages and never registers tunnel polling',async({page})=>{
  await page.addInitScript(()=>{
    window.workerMessages=[];
    window.Worker=function(){this.postMessage=function(message){window.workerMessages.push(message);};};
  });
  await page.goto('/');
  const card=page.locator('a.card').filter({has:page.locator('#dot-animal-quiz')});
  await expect(card).toHaveAttribute('href','https://cmlozanos.github.io/home/animal-quiz/');
  await expect(card.locator('.badge')).toHaveText('Educativo · PWA');
  expect(await page.evaluate(()=>window.workerMessages.some(message=>message.apps.some(app=>app.slug==='animal-quiz')))).toBe(false);
});
