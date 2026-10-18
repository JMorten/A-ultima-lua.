const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(reduced=false){
  const nodes={},created=[],observers=[],timers=new Map();let timerId=0;
  function element(){return {dataset:{},style:{},isConnected:true,children:[],classes:new Set(),history:[],
    classList:{add(name){this.owner.classes.add(name);},remove(name){this.owner.classes.delete(name);}},
    setAttribute(){},appendChild(child){this.children.push(child);child.parent=this;},remove(){this.isConnected=false;},
    animate(frames,options){const a={frames,options,onfinish:null,cancelled:false,cancel(){this.cancelled=true;},finish(){this.onfinish?.();}};this.history.push(a);return a;}};}
  function make(){const e=element();e.classList.owner=e;return e;}
  for(const id of ['portrait-enemy','effects-enemy','stage','content'])nodes[id]=make();
  const media={matches:reduced,listeners:new Set(),addEventListener(_e,f){this.listeners.add(f);},removeEventListener(_e,f){this.listeners.delete(f);}};
  const context=vm.createContext({console,Promise,matchMedia:()=>media,addEventListener(){},
    setTimeout(fn){timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);},
    MutationObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.closed=true;}},
    document:{getElementById:id=>nodes[id],querySelector:()=>nodes.stage,createElement(){const e=make();created.push(e);return e;}}});
  for(const file of ['combat-animator.js','gorthak-visual.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',file),'utf8'),context);
  const monster={id:'warlord_gorthak'};return {context,api:context.GorthakVisual,nodes,created,media,monster,observers,timers};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('mount: Gorthak começa imóvel, sem respiração ou loops',()=>{const f=boot();f.api.mount(f.monster);assert.equal(f.nodes['portrait-enemy'].history.length,0);assert.equal(f.created.length,2);f.api.destroy();});
test('outros inimigos não recebem adaptador nem novas animações',()=>{const f=boot();f.api.mount({id:'orc_xama'});assert.equal(f.created.length,0);assert.equal(f.api.hit(f.monster,false),false);});
test('dano normal → recuo → retorno antes dos 480 ms existentes',async()=>{
  const f=boot();f.api.mount(f.monster);assert.equal(f.api.hit(f.monster,false),true);
  const surface=f.nodes['portrait-enemy'];assert.equal(surface.dataset.reaction,'damage');const hit=surface.history[0];hit.finish();await flush();
  assert.equal(surface.dataset.reaction,'retreat');const retreat=surface.history[1];assert.ok(hit.options.duration+retreat.options.duration<480);
  assert.equal(retreat.frames.at(-1).transform,retreat.frames[0].transform);retreat.finish();await flush();
  assert.equal(surface.dataset.reaction,undefined);assert.ok(surface.history.every(a=>a.cancelled));f.api.destroy();
});
test('crítico usa maior deslocamento e flash, sem fila de recuos posterior',async()=>{
  const f=boot();f.api.mount(f.monster);f.api.hit(f.monster,true);const a=f.nodes['portrait-enemy'].history[0];
  assert.match(a.frames[1].transform,/10.5px/);assert.equal(f.created[1].history.length,1);a.finish();await flush();
  assert.equal(f.nodes['portrait-enemy'].history.length,1);assert.equal(f.nodes['portrait-enemy'].dataset.reaction,undefined);f.api.destroy();
});
test('ataques consecutivos cancelam o anterior e ignoram callback atrasado',async()=>{
  const f=boot();f.api.mount(f.monster);f.api.hit(f.monster,false);const old=f.nodes['portrait-enemy'].history[0],late=old.onfinish;
  f.api.hit(f.monster,true);late();await flush();assert.equal(old.cancelled,true);assert.equal(f.nodes['portrait-enemy'].dataset.reaction,'critical');f.api.destroy();
});
test('fim/rebuild/reinício liberam efeitos, listener e observer',async()=>{
  const f=boot();f.api.mount(f.monster);f.api.hit(f.monster,true);f.api.destroy();await flush();
  assert.equal(f.media.listeners.size,0);assert.ok(f.observers[0].closed);assert.ok(f.created.every(e=>!e.isConnected));
  assert.equal(f.nodes['portrait-enemy'].dataset.reaction,undefined);
  const next={id:'warlord_gorthak'};f.api.mount(next);assert.equal(f.media.listeners.size,1);assert.equal(f.api.hit(f.monster,false),false);assert.equal(f.api.hit(next,false),true);f.api.destroy();
});
test('ator removido do DOM cancela a animação e libera recursos',()=>{
  const f=boot();f.api.mount(f.monster);f.api.hit(f.monster,true);f.nodes['portrait-enemy'].isConnected=false;f.observers[0].fn();
  assert.equal(f.media.listeners.size,0);assert.ok(f.nodes['portrait-enemy'].history[0].cancelled);
});
test('movimento reduzido não desloca nem pisca e não deixa timers',async()=>{
  const f=boot(true);f.api.mount(f.monster);f.api.hit(f.monster,true);assert.equal(f.nodes['portrait-enemy'].history.length,0);
  assert.equal(f.nodes['portrait-enemy'].dataset.reactionStatic,'true');f.api.destroy();await flush();assert.equal(f.timers.size,0);assert.equal(f.nodes['portrait-enemy'].dataset.reactionStatic,undefined);
});
test('hooks de produção se limitam a Gorthak e passam isCrit real',()=>{
  const source=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
  const start=source.indexOf('function shakeSide('),end=source.indexOf('\nfunction updateArenaBarsOnly',start);
  const events=[];let legacy=0;
  const ctx=vm.createContext({combatPortraitId:side=>'portrait-'+side,ui:{monster:{id:'warlord_gorthak'}},isGorthak:()=>true,EnemyCombatVisual:{hit:(m,crit)=>{events.push(crit);return true;}},document:{getElementById:()=>({classList:{remove(){},add(){legacy++;}},offsetWidth:1})}});
  vm.runInContext(source.slice(start,end),ctx);vm.runInContext("shakeSide('enemy',true);shakeSide('enemy',false);shakeSide('player')",ctx);
  assert.deepEqual(events,[true,false]);assert.equal(legacy,1);
  assert.match(source,/shakeSide\('enemy', isCrit\)/);
});

test('Batedor: impacto direcional único sem inversão ou segundo tranco',async()=>{
 const f=boot(),scout={id:'orc_batedor'};f.api.mount(scout);assert.equal(f.context.EnemyCombatVisual,f.context.GorthakVisual);
 assert.equal(f.nodes['portrait-enemy'].history.length,0);f.api.hit(scout,false);
 const hit=f.nodes['portrait-enemy'].history[0];assert.equal(hit.options.duration,250);
 assert.match(hit.frames[1].transform,/8px/);assert.equal(hit.frames[1].transform,hit.frames[2].transform);
 assert.equal(hit.frames[0].transform,hit.frames.at(-1).transform);
 for(const k of hit.frames)assert.doesNotMatch(k.transform,/translate3d\(-/);
 hit.finish();await flush();assert.equal(f.nodes['portrait-enemy'].history.length,1);
 assert.equal(f.nodes['portrait-enemy'].dataset.reaction,undefined);f.api.destroy();
});
test('Batedor crítico, ataque consecutivo, interrupção e troca para Gorthak não deixam resíduos',async()=>{
  const f=boot(),scout={id:'orc_batedor'};f.api.mount(scout);f.api.hit(scout,false);
  const first=f.nodes['portrait-enemy'].history[0],late=first.onfinish;
  f.api.hit(scout,true);late();await flush();const crit=f.nodes['portrait-enemy'].history.at(-1);
  assert.equal(crit.options.duration,360);assert.match(crit.frames[1].transform,/16px/);
  assert.equal(first.cancelled,true);f.api.destroy();await flush();assert.equal(f.media.listeners.size,0);
  assert.ok(f.created.every(e=>!e.isConnected));assert.ok(!f.nodes['portrait-enemy'].classes.has('scout-reaction-surface'));
  f.api.mount(f.monster);assert.equal(f.api.hit(scout,false),false);assert.equal(f.api.hit(f.monster,true),true);
  assert.equal(f.nodes['portrait-enemy'].history.at(-1).options.duration,430);f.api.destroy();
});
test('Batedor respeita movimento reduzido, remoção e reinício de combate',()=>{
  const f=boot(true),scout={id:'orc_batedor'};f.api.mount(scout);f.api.hit(scout,false);
  assert.equal(f.nodes['portrait-enemy'].history.length,0);assert.equal(f.nodes['portrait-enemy'].dataset.reactionStatic,'true');
  f.nodes['portrait-enemy'].isConnected=false;f.observers[0].fn();assert.equal(f.timers.size,0);assert.equal(f.media.listeners.size,0);
  f.nodes['portrait-enemy'].isConnected=true;const next={id:'orc_batedor'};f.api.mount(next);
  assert.equal(f.api.hit(scout,false),false);assert.equal(f.api.hit(next,false),true);f.api.destroy();
});

test('Guerreiro pesado reutiliza motor; impacto direcional e recuperação mais rápida que Gorthak',async()=>{
 const f=boot(),m={id:'orc_guerreiro'};f.api.mount(m);assert.ok(f.nodes['portrait-enemy'].classes.has('warrior-reaction-surface'));
 assert.equal(f.nodes['portrait-enemy'].history.length,0);f.api.hit(m,false);let a=f.nodes['portrait-enemy'].history[0];
 assert.equal(a.options.duration,280);assert.match(a.frames[1].transform,/7px/);assert.equal(a.frames.at(-1).transform,a.frames[0].transform);
 a.finish();await flush();assert.equal(f.nodes['portrait-enemy'].history.length,1);f.api.hit(m,true);a=f.nodes['portrait-enemy'].history.at(-1);
 assert.equal(a.options.duration,390);assert.match(a.frames[1].transform,/14px/);f.api.destroy();assert.equal(f.media.listeners.size,0);
});
test('Guerreiro: interrupção, callbacks antigos, remoção, novo combate e reduced-motion',async()=>{
 const f=boot(),m={id:'orc_guerreiro'};f.api.mount(m);f.api.hit(m,false);const old=f.nodes['portrait-enemy'].history[0],late=old.onfinish;
 f.api.hit(m,true);late();await flush();assert.ok(old.cancelled);assert.equal(f.nodes['portrait-enemy'].dataset.reaction,'critical');
 f.nodes['portrait-enemy'].isConnected=false;f.observers[0].fn();assert.equal(f.media.listeners.size,0);
 f.nodes['portrait-enemy'].isConnected=true;const next={id:'orc_guerreiro'};f.api.mount(next);assert.equal(f.api.hit(m,false),false);f.api.destroy();
 const r=boot(true);r.api.mount(m);r.api.hit(m,true);assert.equal(r.nodes['portrait-enemy'].history.length,0);r.api.destroy();assert.equal(r.timers.size,0);
});

test('Capitão reutiliza o motor: dano e crítico são direcionais e liberam os recursos',async()=>{
 const f=boot(),m={id:'orc_capitao'};f.api.mount(m);
 assert.ok(f.nodes['portrait-enemy'].classes.has('captain-reaction-surface'));
 assert.equal(f.api.hit(m,false),true);let a=f.nodes['portrait-enemy'].history[0];
 assert.equal(a.options.duration,260);assert.match(a.frames[1].transform,/8px/);assert.equal(a.frames[0].transform,a.frames.at(-1).transform);
 a.finish();await flush();assert.equal(f.nodes['portrait-enemy'].history.length,1);
 assert.equal(f.nodes['portrait-enemy'].dataset.reaction,undefined);
 assert.equal(f.api.hit(m,true),true);a=f.nodes['portrait-enemy'].history.at(-1);
 assert.equal(a.options.duration,410);assert.match(a.frames[1].transform,/16px/);
 f.api.destroy();assert.equal(f.media.listeners.size,0);assert.ok(f.created.every(e=>!e.isConnected));
 assert.ok(!f.nodes['portrait-enemy'].classes.has('captain-reaction-surface'));
});

test('gancho real da Arena encaminha dano e crítico do Capitão ao adaptador',()=>{
 const source=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
 const start=source.indexOf('function shakeSide('),end=source.indexOf('\nfunction updateArenaBarsOnly',start);
 const events=[];let legacy=0;
 const ctx=vm.createContext({ui:{monster:{id:'orc_capitao'},mapIndex:2},isGorthak:()=>false,EnemyCombatVisual:{hit:(m,crit)=>{events.push([m.id,crit]);return true;}},document:{getElementById:()=>({classList:{remove(){},add(){legacy++;}},offsetWidth:1})}});
 vm.runInContext(source.slice(start,end),ctx);vm.runInContext("shakeSide('enemy',true);shakeSide('enemy',false)",ctx);
 assert.deepEqual(events,[['orc_capitao',true],['orc_capitao',false]]);assert.equal(legacy,0);
});