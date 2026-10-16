const {expect}=require('playwright/test');
async function encounter(page,enemyName='Warlord Gorthak',surface='.gorthak-reaction-surface'){
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    window.__gorthakReactions=[];
    document.addEventListener('DOMContentLoaded',()=>new MutationObserver(records=>{
      for(const r of records)if(r.target.id==='portrait-enemy'&&r.target.dataset.reaction)
        window.__gorthakReactions.push(r.target.dataset.reaction);
    }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-reaction']}));
  });
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await page.goto('/');await page.locator('#qa-panel summary').click();
  await page.locator('#qa-class').selectOption('mago');await page.locator('#qa-new').click();await page.locator('#qa-confirm-new').click();
  await page.locator('#class-select button',{hasText:'CONTINUAR'}).click();
  if(!await page.locator('#qa-panel details').evaluate(e=>e.open))await page.locator('#qa-panel summary').click();
  await page.waitForTimeout(650);
  for(const [id,value] of Object.entries({level:1,statPoints:0,forca:0,agilidade:0,magia:0,espirito:0,vitalidade:10000,defesa:0}))await page.locator('#qa-'+id).fill(String(value));
  await page.locator('#qa-apply').click();await expect(page.locator('#qa-apply-message')).toContainText('Checkpoint gravado');
  await page.locator('#qa-restore').click();await page.locator('#qa-map').selectOption('2');
  const option=page.locator('#qa-enemy option').filter({hasText:enemyName});
  await page.locator('#qa-enemy').selectOption(await option.getAttribute('value'));await page.locator('#qa-battle').click();
  await expect(page.locator(surface)).toBeVisible();
  await page.waitForFunction(()=>document.querySelector('#portrait-enemy img')?.naturalWidth>0);
  return errors;
}

module.exports={encounter};
