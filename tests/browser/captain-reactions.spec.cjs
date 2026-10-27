const {test,expect}=require('playwright/test');
const {encounter}=require('./combat-visual-helpers.cjs');

for(const width of [320,375,390,1366])test('Capitão: transparência, direção, proporção e pés em '+width+'px',async({page})=>{
 await page.setViewportSize({width,height:width>1000?768:844});
 const errors=await encounter(page,'Orc Capitão','.captain-reaction-surface');
 const img=page.locator('#portrait-enemy img');
 await expect(img).toHaveAttribute('src','assets/images/enemies/trenches/orc_capitao_combat_v2.png');
 const frame=await page.locator('.arena-actor[data-actor="orc_capitao"]').evaluate(actor=>{
  const stage=actor.closest('.arena-stage').getBoundingClientRect(),r=actor.getBoundingClientRect(),i=actor.querySelector('img'),c=getComputedStyle(i);
  return {naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,fit:c.objectFit,position:c.objectPosition,
   widthRatio:r.width/stage.width,heightRatio:r.height/stage.height,
   centerError:r.x+r.width/2-stage.x-stage.width*.69,groundError:r.bottom-stage.bottom,
   imageTransform:c.transform,animations:document.getElementById('portrait-enemy').getAnimations().length};
 });
 expect(frame.naturalWidth).toBe(1145);expect(frame.naturalHeight).toBe(1337);
 expect(frame.fit).toBe('contain');expect(frame.position).toBe('50% 100%');
 expect(frame.widthRatio).toBeCloseTo(.42,3);expect(frame.heightRatio).toBeCloseTo(.78,3);
 expect(Math.abs(frame.centerError)).toBeLessThan(1);expect(Math.abs(frame.groundError)).toBeLessThan(1);
 expect(frame.imageTransform).toBe('none');expect(frame.animations).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.locator('.battle-arena').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/orc-capitao-'+width+'-arena.png'});
 expect(errors).toEqual([]);
});

test('Capitão: golpes reais, crítico, encerramento e novo combate sem resíduos',async({page})=>{
 test.setTimeout(100000);const errors=await encounter(page,'Orc Capitão','.captain-reaction-surface');let seen=[];
 for(let n=0;n<60;n++){
  await page.getByRole('button',{name:'Atacar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled({timeout:10000});
  seen=await page.evaluate(()=>window.__gorthakReactions);
  if(seen.includes('damage')&&seen.includes('critical'))break;
 }
 expect(seen).toContain('damage');expect(seen).toContain('critical');
 await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction',/./);
 expect(await page.locator('#portrait-enemy').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
 await page.evaluate(()=>{window.oldCaptain=document.getElementById('portrait-enemy');});
 await page.getByRole('button',{name:'Atacar',exact:true}).click();await page.locator('.tab-btn[data-tab="mapa"]').click();
 expect(await page.evaluate(()=>window.oldCaptain.getAnimations().length)).toBe(0);
 await expect(page.locator('.captain-impact-glow')).toHaveCount(0);
 await page.reload();await page.locator('#class-select button',{hasText:'CONTINUAR'}).click();
 await page.locator('#qa-panel summary').click();await page.locator('#qa-map').selectOption('2');
 await page.locator('#qa-enemy').selectOption(await page.locator('#qa-enemy option').filter({hasText:'Orc Capitão'}).getAttribute('value'));
 await page.locator('#qa-battle').click();await expect(page.locator('.captain-reaction-surface')).toBeVisible();
 expect(errors).toEqual([]);
});

test('Capitão: movimento reduzido não cria animação nem deixa resíduos',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const errors=await encounter(page,'Orc Capitão','.captain-reaction-surface');
 await page.getByRole('button',{name:'Atacar',exact:true}).click();
 await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled();
 expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
 await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction-static',/./);
 expect(errors).toEqual([]);
});
