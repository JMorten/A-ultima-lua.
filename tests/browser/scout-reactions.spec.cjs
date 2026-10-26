const {test,expect}=require('playwright/test');
const {encounter}=require('./combat-visual-helpers.cjs');
for(const width of [320,375,390,1366])test('Batedor: arte preservada e sem idle em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:width>1000?768:844});const errors=await encounter(page,'Orc Batedor','.scout-reaction-surface');
  await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src','assets/images/enemies/trenches/orc_batedor_combat.webp');
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
    if(n>=6&&['damage','critical'].every(x=>seen.includes(x))&&sources.size===2)break;
  }
  for(const action of ['damage','critical'])expect(seen).toContain(action);
  expect([...sources]).toContain('assets/images/enemies/trenches/orc_batedor_alerta_combat.webp');
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

for(const width of [320,375,390,1366])test('V2 comparação visual e trajetória em '+width+'px',async({page})=>{
 await page.setViewportSize({width,height:width>1000?768:844});const errors=await encounter(page,'Orc Batedor','.scout-reaction-surface');
 const results=[];
 for(const critical of [false,true]){
   await page.evaluate(c=>EnemyCombatVisual.hit(ui.monster,c),critical);
   const sampled=await page.evaluate(()=>{
     const surface=document.getElementById('portrait-enemy'),stage=document.querySelector('.arena-stage').getBoundingClientRect();
     const a=surface.getAnimations()[0];a.pause();const duration=a.effect.getTiming().duration;
     const values=[0,.12,.24,.36,.55,.8,.999].map(t=>{a.currentTime=t*duration;const r=surface.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(surface).transform);return {t,x:m.m41,y:m.m42,left:r.left-stage.left,right:stage.right-r.right,top:r.top-stage.top,bottom:stage.bottom-r.bottom};});
     return {values,cssAnimation:getComputedStyle(surface).animationName,legacyShake:surface.classList.contains('shake'),keyframes:a.effect.getKeyframes()};
   });
   expect(sampled.legacyShake).toBe(false);expect(sampled.cssAnimation).toBe('none');
   for(const v of sampled.values){expect(v.x).toBeGreaterThanOrEqual(-.01);expect(v.left).toBeGreaterThanOrEqual(-1);expect(v.right).toBeGreaterThanOrEqual(-1);expect(v.top).toBeGreaterThanOrEqual(-1);expect(v.bottom).toBeGreaterThanOrEqual(-1);}
   expect(sampled.values[2].x).toBeCloseTo(critical?16:8,1);expect(sampled.values.at(-1).x).toBeCloseTo(0,1);
   await page.evaluate(()=>{const a=document.getElementById('portrait-enemy').getAnimations()[0];a.currentTime=a.effect.getTiming().duration*.24;});
   await page.locator('.battle-arena').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/batedor-v2-'+width+'-'+(critical?'critico':'dano')+'.png',animations:'allow'});
   results.push({critical,...sampled});await page.evaluate(()=>{EnemyCombatVisual.destroy();EnemyCombatVisual.mount(ui.monster);});
 }
 require('fs').writeFileSync(process.env.AUL_PW_ARTIFACTS+'/batedor-v2-'+width+'.json',JSON.stringify(results,null,2));
 expect(errors).toEqual([]);
});
