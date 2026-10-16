const {test,expect}=require('playwright/test');
async function encounter(page){
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
  const option=page.locator('#qa-enemy option').filter({hasText:'Warlord Gorthak'});
  await page.locator('#qa-enemy').selectOption(await option.getAttribute('value'));await page.locator('#qa-battle').click();
  await expect(page.locator('.gorthak-reaction-surface')).toBeVisible();
  await page.waitForFunction(()=>document.querySelector('#portrait-enemy img')?.naturalWidth>0);
  return errors;
}
for(const width of [320,375,390,1366,1920])test('Gorthak reações: enquadramento e ausência de idle em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:width>=1366?768:844});const errors=await encounter(page);
  expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  expect(await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth))).toBeLessThanOrEqual(width+1);
  await page.locator('.battle-arena').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/gorthak-reacoes-'+width+'.png'});
  const bounds=await page.evaluate(()=>{
    const stage=document.querySelector('.arena-stage').getBoundingClientRect();
    return [...document.querySelectorAll('.arena-actor')].map(actor=>{
      const i=actor.querySelector('img'),r=i.getBoundingClientRect(),a=actor.getBoundingClientRect();
      const scale=Math.min(r.width/i.naturalWidth,r.height/i.naturalHeight);
      const w=i.naturalWidth*scale,h=i.naturalHeight*scale;
      return {left:r.left+(r.width-w)/2-stage.left,right:r.left+(r.width+w)/2-stage.left,top:r.bottom-h-stage.top,bottom:r.bottom-stage.top,h,stageW:stage.width,stageH:stage.height,ground:a.bottom-stage.bottom,fit:getComputedStyle(i).objectFit};
    });
  });
  for(const b of bounds){expect(b.fit).toBe('contain');expect(b.left).toBeGreaterThanOrEqual(0);expect(b.right).toBeLessThanOrEqual(b.stageW);expect(b.top).toBeGreaterThanOrEqual(0);expect(Math.abs(b.bottom-b.stageH)).toBeLessThan(1);expect(Math.abs(b.ground)).toBeLessThan(1);}
  expect(bounds[1].h).toBeGreaterThan(bounds[0].h*1.2);
  expect(bounds[0].right).toBeLessThan(bounds[1].left);
  // Sample all keyframes through the actual adapter; freeze WAAPI time only for geometry assertions.
  for(const critical of [false,true]){
    await page.evaluate(c=>GorthakVisual.hit(ui.monster,c),critical);
    const frames=await page.evaluate(()=>{
      const surface=document.getElementById('portrait-enemy'),stage=document.querySelector('.arena-stage').getBoundingClientRect(),animation=surface.getAnimations()[0];
      animation.pause();const duration=animation.effect.getTiming().duration;
      return [0,.18,.3,.6,1].map(t=>{animation.currentTime=duration*t;const r=surface.getBoundingClientRect();return {left:r.left-stage.left,right:r.right-stage.right,top:r.top-stage.top};});
    });
    for(const f of frames){expect(f.left).toBeGreaterThanOrEqual(-1);expect(f.right).toBeLessThanOrEqual(1);expect(f.top).toBeGreaterThanOrEqual(-1);}
    await page.evaluate(()=>GorthakVisual.destroy());
    await page.evaluate(()=>GorthakVisual.mount(ui.monster));
  }
  expect(errors).toEqual([]);
});
test('Gorthak reações: ataques reais, crítico, recuo e reconstrução sem resíduos',async({page})=>{
  test.setTimeout(100000);const errors=await encounter(page);let seen=[];
  for(let n=0;n<60;n++){
    await page.getByRole('button',{name:'Atacar',exact:true}).click();
    await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled({timeout:10000});
    seen=await page.evaluate(()=>window.__gorthakReactions);
    if(['damage','retreat','critical'].every(x=>seen.includes(x)))break;
  }
  expect(seen).toContain('damage');expect(seen).toContain('retreat');expect(seen).toContain('critical');
  await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction',/./);
  expect(await page.locator('#portrait-enemy').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
  await page.evaluate(()=>{window.__oldGorthakSurface=document.getElementById('portrait-enemy');});
  await page.getByRole('button',{name:'Atacar',exact:true}).click();
  await page.locator('.tab-btn[data-tab="mapa"]').click();
  expect(await page.evaluate(()=>window.__oldGorthakSurface.getAnimations().length)).toBe(0);
  await expect(page.locator('.gorthak-impact-glow')).toHaveCount(0);
  await page.locator('.tab-btn[data-tab="batalha"]').click();
  await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled({timeout:10000});
  expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});
test('Gorthak reações: movimento reduzido em combate real',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const errors=await encounter(page);
  await page.getByRole('button',{name:'Atacar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Atacar',exact:true})).toBeEnabled({timeout:10000});
  const events=await page.evaluate(()=>window.__gorthakReactions);expect(events.length).toBeGreaterThan(0);
  expect(events).not.toContain('retreat');expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction-static',/./);expect(errors).toEqual([]);
});
