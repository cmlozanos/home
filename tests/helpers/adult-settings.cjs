const {expect}=require('@playwright/test');
async function adults(page){
 const shell=page.locator('family-v2-shell');
 if(await shell.locator('#adult-settings').isVisible())return;
 await shell.locator('#adults').click();const[a,b]=(await shell.locator('#gate-label').textContent()).match(/\d+/g).map(Number);
 await shell.locator('#answer').fill(String(a*b));await shell.getByRole('button',{name:'Entrar',exact:true}).click();
}
async function clickSetting(page,selector){await adults(page);await page.locator(selector).click();const close=page.locator('family-v2-shell #close');if(await close.isVisible())await close.click();}
module.exports={adults,clickSetting};
