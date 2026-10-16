const {test,expect}=require('playwright/test');
const {encounter}=require('./combat-visual-helpers.cjs');
for(const width of [320,375,390,1366])test('Batedor: arte preservada e sem idle em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:width>1000?768:844});const errors=await encounter(page,'Orc Batedor','.scout-reaction-surface');
  await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src','assets/images/enemies/trenches/orc_batedor_combat.png');
  expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  expect(await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth))).toBeLessThanOrEqual(width+1);
  await page.locator('.battle-arena').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/orc-batedor-'+width+'.png'});expect(errors).toEqual([]);
});
test('Batedor: dano, crítico, recuo e chifre por ações reais; cancelamento e reinício',async({page})=>{
  test.setTimeout(100000);const errors=await encounter(page,'Orc Batedor','.scout-reaction-surface'),sources=new Set();let seen=[];
  for(let n=0;n<60;n++){
    sources.add(await page.locator('#portrait-enemy img').getAttribute('src'));
    await page.getByRole('button',{name:'Atacar',exact:true}).click();
    await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled({timeout:10000});
    seen=await page.evaluate(()=>window.__gorthakReactions);
    if(n>=6&&['damage','retreat','critical'].every(x=>seen.includes(x))&&sources.size===2)break;
  }
  for(const action of ['damage','retreat','critical'])expect(seen).toContain(action);
  expect([...sources]).toContain('assets/images/enemies/trenches/orc_batedor_alerta_combat.png');
  await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction',/./);
  expect(await page.locator('#portrait-enemy').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
  await page.evaluate(()=>{window.oldScout=document.getElementById('portrait-enemy');});
  await page.getByRole('button',{name:'Atacar',exact:true}).click();await page.locator('.tab-btn[data-tab="mapa"]').click();
  expect(await page.evaluate(()=>window.oldScout.getAnimations().length)).toBe(0);await expect(page.locator('.scout-impact-glow')).toHaveCount(0);
  await page.locator('.tab-btn[data-tab="batalha"]').click();await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>window.oldScout.isConnected)).toBe(false);
  // QA deliberately forbids starting another encounter during battle. Reload the disposable checkpoint first.
  await page.reload();
  await page.locator('#class-select button',{hasText:'CONTINUAR'}).click();
  await page.locator('#qa-panel summary').click();
  await page.locator('#qa-map').selectOption('2');
  await page.locator('#qa-enemy').selectOption(await page.locator('#qa-enemy option').filter({hasText:'Orc Batedor'}).getAttribute('value'));
  await expect(page.locator('#qa-battle')).toBeEnabled();
  await page.locator('#qa-battle').click();await expect(page.locator('.scout-reaction-surface')).toBeVisible();
  expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  await expect(page.locator('.scout-impact-glow')).toHaveCount(1);expect(errors).toEqual([]);
});
test('Batedor: movimento reduzido sem animações residuais',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const errors=await encounter(page,'Orc Batedor','.scout-reaction-surface');
  await page.getByRole('button',{name:'Atacar',exact:true}).click();await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>window.__gorthakReactions)).not.toContain('retreat');
  expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction-static',/./);expect(errors).toEqual([]);
});
