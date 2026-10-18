const {test,expect}=require('playwright/test');const {encounter}=require('./combat-visual-helpers.cjs');
for(const width of [320,375,390,1366])test('Guerreiro V2: corpo inteiro, chão e impacto em '+width+'px',async({page})=>{
 await page.setViewportSize({width,height:width>1000?768:844});const errors=await encounter(page,'Orc Guerreiro','.warrior-reaction-surface');
 await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src','assets/images/enemies/trenches/orc_guerreiro_combat_v2.png');
 const baseline=await page.locator('#portrait-enemy').evaluate(e=>{const r=e.getBoundingClientRect(),i=e.querySelector('img'),c=getComputedStyle(i);return {x:r.x,y:r.y,fit:c.objectFit,position:c.objectPosition,animations:e.getAnimations().length};});
 expect(baseline.fit).toBe('contain');expect(baseline.position).toBe('50% 100%');expect(baseline.animations).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.locator('.battle-arena').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/guerreiro-v2-'+width+'-repouso.png'});
 for(const critical of [false,true]){
  const values=await page.evaluate(c=>{EnemyCombatVisual.hit(ui.monster,c);const e=document.getElementById('portrait-enemy'),a=e.getAnimations()[0],stage=document.querySelector('.arena-stage').getBoundingClientRect();a.pause();
   return [0,.24,.36,.7,.999].map(t=>{a.currentTime=t*a.effect.getTiming().duration;const r=e.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(e).transform);return {x:m.m41,left:r.left-stage.left,right:stage.right-r.right,top:r.top-stage.top,bottom:stage.bottom-r.bottom};});},critical);
  for(const v of values)for(const k of ['left','right','top','bottom'])expect(v[k]).toBeGreaterThanOrEqual(-1);
  expect(values[1].x).toBeCloseTo(critical?14:7,1);expect(values.at(-1).x).toBeCloseTo(0,1);
  await page.evaluate(()=>{const a=document.getElementById('portrait-enemy').getAnimations()[0];a.currentTime=a.effect.getTiming().duration*.24;});
  await page.locator('.battle-arena').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/guerreiro-v2-'+width+'-'+(critical?'critico':'dano')+'.png',animations:'allow'});
  await page.evaluate(()=>{EnemyCombatVisual.destroy();EnemyCombatVisual.mount(ui.monster);});
 }
 expect(errors).toEqual([]);
});
test('Guerreiro V2: golpes reais, crítico, interrupção e novo encontro',async({page})=>{
 test.setTimeout(100000);const errors=await encounter(page,'Orc Guerreiro','.warrior-reaction-surface');let seen=[];
 for(let n=0;n<60;n++){await page.getByRole('button',{name:'Atacar',exact:true}).click();await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled({timeout:10000});seen=await page.evaluate(()=>window.__gorthakReactions);if(seen.includes('damage')&&seen.includes('critical'))break;}
 expect(seen).toContain('damage');expect(seen).toContain('critical');await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction',/./);
 expect(await page.locator('#portrait-enemy').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
 await page.evaluate(()=>{window.oldWarrior=document.getElementById('portrait-enemy');});await page.getByRole('button',{name:'Atacar',exact:true}).click();await page.locator('.tab-btn[data-tab="mapa"]').click();
 expect(await page.evaluate(()=>window.oldWarrior.getAnimations().length)).toBe(0);await expect(page.locator('.warrior-impact-glow')).toHaveCount(0);
 await page.reload();await page.locator('#class-select button',{hasText:'CONTINUAR'}).click();await page.locator('#qa-panel summary').click();await page.locator('#qa-map').selectOption('2');
 await page.locator('#qa-enemy').selectOption(await page.locator('#qa-enemy option').filter({hasText:'Orc Guerreiro'}).getAttribute('value'));await page.locator('#qa-battle').click();await expect(page.locator('.warrior-reaction-surface')).toBeVisible();expect(errors).toEqual([]);
});
test('Guerreiro V2: movimento reduzido',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const errors=await encounter(page,'Orc Guerreiro','.warrior-reaction-surface');await page.getByRole('button',{name:'Atacar',exact:true}).click();await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled();
 expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction-static',/./);expect(errors).toEqual([]);
});
