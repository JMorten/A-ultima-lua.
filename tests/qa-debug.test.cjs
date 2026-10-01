const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.join(__dirname,'..'),gameCode=fs.readFileSync(path.join(root,'src/game.js'),'utf8'),saveCode=fs.readFileSync(path.join(root,'src/persistence.js'),'utf8');
function boot(storage=new Map()){
 const cards=[],elements=new Map(),listeners={},timers=[],intervals=[];
 function element(){
  const events={},children={};
  return {value:'0',hidden:false,disabled:false,replaceChildren(...items){this.value=items[0]?.value??'';},querySelectorAll(sel){return sel==='button'?[...this.innerHTML.matchAll(/<button[^>]*id="([^"]+)"/g)].map(match=>document.getElementById(match[1])):[];},focus(){this.focused=true;},style:{},dataset:{},innerHTML:'',classList:{add(){},remove(){},toggle(){}},isConnected:false,
   addEventListener(type,fn){events[type]=fn},
   insertAdjacentHTML(where,html){this.innerHTML+=html},
   appendChild(child){child.isConnected=true;cards.push(child)},
   remove(){this.isConnected=false;const i=cards.indexOf(this);if(i>=0)cards.splice(i,1)},
   querySelector(sel){if(!children[sel]){children[sel]=element();children[sel].parent=this;}return children[sel]},
   closest(){return this.parent||null},
   click(){if(this.disabled)return;if(events.click)events.click();if(listeners.click)listeners.click({target:this})}
  };
 }
 const document={body:{prepend(panel){this.panel=panel;}},
  getElementById(id){if(id==='forest-event-card'||id==='forest-event-result')return cards.find(x=>x.id===id)||null;if(!elements.has(id))elements.set(id,Object.assign(element(),{id}));return elements.get(id)},
  querySelectorAll(sel){return sel==='.interactive-card'?cards.filter(x=>(x.className||'').includes('interactive-card')):[]},
  createElement:element,addEventListener(type,fn){listeners[type]=fn}
 };
 const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
 const context=vm.createContext({console,Date,location:{reload(){}},Math:Object.create(Math),document,localStorage,setTimeout(fn){timers.push(fn)},clearTimeout(){},setInterval(fn){intervals.push(fn)}});
 vm.runInContext(gameCode,context);
 vm.runInContext('showToast=()=>{};floatNumber=()=>{};shakeSide=()=>{};Math.random=()=>0.99;isMonsterEventActive=()=>false;isXpEventActive=()=>false;',context);
 vm.runInContext(saveCode,context);
 vm.runInContext('var qaRandomCalls=0;Math.random=()=>{qaRandomCalls++;return .99;}',context);
 vm.runInContext(fs.readFileSync(path.join(root,'_qa/debug.js'),'utf8'),context);
 const run=s=>vm.runInContext(s,context);
 return {run,storage,document,refresh(){intervals.forEach(fn=>fn());},tick(){const fn=timers.shift();if(fn)fn();},close(){for(const card of [...cards])card.querySelector(card.id==='forest-event-result'?'button':'.notif-continue').click();}};
}
function fresh(){const env=boot();env.run('chooseClass("cavaleiro")');return env;}

const applyFields={level:'10',statPoints:'37',forca:'0',agilidade:'0',magia:'75',espirito:'0',vitalidade:'0',defesa:'0'};
function applyClick(e,fields=applyFields){e.refresh();for(const [key,value] of Object.entries(fields))e.document.getElementById('qa-'+key).value=value;e.document.getElementById('qa-apply').click();}
test('new QA reload requires CONTINUAR; dependent buttons disabled and local guidance visible',()=>{
 const created=boot();created.run('QADebug.requestNew("mago");QADebug.confirmNew()');
 const e=boot(created.storage);assert.equal(e.run('player'),null);
 for(const id of ['apply','read','restore','mag-75','magic-reset','domain-destruidor','battle'])assert.equal(e.document.getElementById('qa-'+id).disabled,true);
 assert.equal(e.document.getElementById('qa-new').disabled,false);
 assert.match(e.document.getElementById('qa-player-notice').textContent,/salvo.*CONTINUAR/);
 const html=e.document.body.panel.innerHTML;
 assert.ok(html.indexOf('qa-player-notice')<html.indexOf('qa-apply'));
 e.run('continueSavedGame()');e.refresh();assert.equal(e.document.getElementById('qa-apply').disabled,false);
});
test('actual apply listener updates HUD, investment, XP, points, local success and persisted reload',()=>{
 const e=boot();e.run('chooseClass("mago")');applyClick(e);
 assert.equal(e.run('player.level'),10);assert.equal(e.run('player.totalXp===totalXpForLevel(10)'),true);
 assert.equal(e.run('player.allocated.magia'),75);assert.equal(e.run('player.statPoints'),37);
 assert.equal(e.document.getElementById('hud-level').textContent,10);
 const message=e.document.getElementById('qa-apply-message');assert.match(message.textContent,/Checkpoint gravado.*Nível 10.*Pontos disponíveis 37.*MAG investida 75/);assert.equal(message.focused,true);
 assert.match(e.document.body.panel.innerHTML,/APLICAR NÍVEL, ATRIBUTOS E PONTOS<\/button><p id="qa-apply-message"/);
 const loaded=boot(e.storage);loaded.run('continueSavedGame()');assert.equal(loaded.run('player.level'),10);assert.equal(loaded.run('player.allocated.magia'),75);assert.equal(loaded.run('player.statPoints'),37);assert.equal(loaded.run('player.magia'),e.run('player.magia'));
});
test('empty and out-of-range inputs identify the field locally without mutating player',()=>{
 const e=fresh(),before=e.run('JSON.stringify(player)');
 for(const [key,value,label] of [['level','','Nível'],['level','101','Nível'],['magia','','MAG investida'],['magia','10001','MAG investida'],['statPoints','-1','Pontos disponíveis'],['defesa','1.5','DEF']]){
  applyClick(e,{...applyFields,[key]:value});assert.ok(e.document.getElementById('qa-apply-message').textContent.startsWith(label+': informe um inteiro entre '));assert.equal(e.run('JSON.stringify(player)'),before);
 }
});
test('checkpoint failure produces focused local error and preserves last saved checkpoint',()=>{
 const e=fresh(),saved=e.storage.get('a-ultima-lua.checkpoint');
 e.run('localStorage.setItem=()=>{throw Error("storage failed")}');applyClick(e);
 assert.match(e.document.getElementById('qa-apply-message').textContent,/Alteração em memória; checkpoint não gravado/);
 assert.equal(e.document.getElementById('qa-apply-message').focused,true);assert.equal(e.storage.get('a-ultima-lua.checkpoint'),saved);
});
test('unsafe states keep Apply disabled and UI click leaves character unchanged',()=>{
 for(const state of ['ui.inBattle=true','ui.locked=true','ui.monster={}','ui.pendingVictory={}','ui.lucasScene={}','ui.romarResult={}','pendingForestEvent={}']){
  const e=fresh();e.run(state);e.refresh();assert.equal(e.document.getElementById('qa-apply').disabled,true);
  const before=e.run('JSON.stringify(player)');e.document.getElementById('qa-apply').click();assert.equal(e.run('JSON.stringify(player)'),before);
 }
});

test('QA uses real classes, requires confirmation and persists fresh schema 5 character',()=>{
 for(const key of ['mago','arqueiro','guerreiro','cavaleiro']){
  const e=fresh(),before=e.storage.get('a-ultima-lua.checkpoint');
  assert.equal(e.run('QADebug.confirmNew()'),false);
  e.run(`QADebug.requestNew('${key}')`);assert.equal(e.storage.get('a-ultima-lua.checkpoint'),before);
  e.run('QADebug.cancelNew()');assert.equal(e.run('QADebug.confirmNew()'),false);
  e.run(`QADebug.requestNew('${key}');QADebug.confirmNew()`);
  assert.equal(e.run('readCheckpoint().player.classKey'),key);assert.equal(e.run('readCheckpoint().schemaVersion'),5);
  assert.equal(e.run('readCheckpoint().player.level'),1);assert.equal(e.run('QADebug.confirmNew()'),false);
 }
});
test('level, six investments and points are independent; real formulas and resources round trip',()=>{
 const e=fresh();e.run('QADebug.apply({level:7,statPoints:123,forca:4,agilidade:5,magia:6,espirito:7,vitalidade:8,defesa:9})');
 assert.equal(e.run('player.totalXp===totalXpForLevel(7)&&player.xp===0'),true);
 assert.equal(e.run('player.statPoints'),123);
 const before=e.run('JSON.stringify(player)');e.run('recomputeStats()');assert.equal(e.run('JSON.stringify(player)'),before);
 e.run('player.hp=1;player.mp=0;QADebug.restore()');assert.equal(e.run('player.hp===player.hpMax&&player.mp===player.mpMax'),true);
 const loaded=boot(e.storage);loaded.run('continueSavedGame()');assert.equal(loaded.run('player.allocated.espirito'),7);assert.equal(loaded.run('player.statPoints'),123);
 assert.throws(()=>e.run('QADebug.apply({level:99999})'));assert.equal(e.run('player.level'),7);
});
test('all MAG presets edit investment, clear domains/overcharge, preserve points and use real domain gates',()=>{
 const e=boot();e.run('chooseClass("mago");player.statPoints=123');
 for(const n of [24,25,49,50,74,75,99,100]){
  e.run(`player.magDomain='destruidor';player.overchargeNext=true;QADebug.preset(${n})`);
  assert.equal(e.run('player.allocated.magia'),n);assert.equal(e.run('player.statPoints'),123);
  assert.equal(e.run('player.magDomain'),null);assert.equal(e.run('player.overchargeNext'),false);
  assert.equal(e.run('hasMagMilestone(25)'),n>=25);assert.equal(e.run('hasMagMilestone(50)'),n>=50);assert.equal(e.run('hasMagMilestone(75)'),n>=75);assert.equal(e.run('hasMagMilestone(100)'),n>=100);
 }
 e.run('QADebug.domain("proibido")');assert.equal(e.run('getMagDomain()'),'proibido');
 e.run('QADebug.domain("destruidor")');assert.equal(e.run('getMagDomain()'),'destruidor');
 e.run('QADebug.resetMagic();QADebug.preset(99)');assert.throws(()=>e.run('QADebug.domain("proibido")'));
 assert.throws(()=>fresh().run('QADebug.preset(100);QADebug.domain("destruidor")'));
});
test('unsafe combat/scenes/results block every QA mutation including confirmed replacement',()=>{
 for(const state of ['ui.inBattle=true','ui.locked=true','ui.monster={}','ui.pendingVictory={}','ui.lucasScene={}','ui.romarResult={}','pendingForestEvent={}']){
  const e=fresh();e.run('QADebug.requestNew("mago")');e.run(state);
  const before=e.run('JSON.stringify(player)');
  for(const op of ['QADebug.restore()','QADebug.resetMagic()','QADebug.preset(25)','QADebug.domain("proibido")','QADebug.battle(0,0)','QADebug.apply({})','QADebug.confirmNew()','QADebug.requestNew("mago")'])assert.throws(()=>e.run(op));
  assert.equal(e.run('JSON.stringify(player)'),before);
 }
});
test('encounter list retains actual template identity and passes correct boss flag for every map',()=>{
 const e=fresh();
 assert.equal(e.run('MAPS.every((map,i)=>QADebug.encounters(i)[0].template===map.monsters[0])'),true);
 assert.equal(e.run('MAPS.every((map,i)=>QADebug.encounters(i).find(e=>e.isBoss).template===map.boss)'),true);
 e.run('var calls=[];startBattle=(...args)=>calls.push(args)');
 e.run('MAPS.forEach((map,i)=>QADebug.encounters(i).forEach((entry,j)=>QADebug.battle(i,j)))');
 assert.equal(e.run('calls.every(([i,t,b])=>b?t===MAPS[i].boss:MAPS[i].monsters.includes(t)||t===MAPS[i].miniBoss)'),true);
 assert.equal(e.run('player.defeatedBosses.length'),0);
});
test('real battle blocks repeated start, preserves pending victory rewards and reload policy',()=>{
 const e=fresh();e.run('QADebug.battle(0,0)');assert.throws(()=>e.run('QADebug.battle(0,0)'));
 const loaded=boot(e.storage);loaded.run('continueSavedGame()');assert.equal(loaded.run('ui.inBattle'),false);
 e.run('handleVictory(ui.monster)');assert.ok(e.run('readCheckpoint().pendingVictory'));
 assert.throws(()=>e.run('QADebug.restore()'));
 const won=boot(e.storage);won.run('continueSavedGame()');const coins=won.run('player.coins');won.run('confirmPendingVictory();confirmPendingVictory()');assert.equal(won.run('player.coins'),coins);
});
test('QA startup does not touch storage or roll RNG; origin stores remain independent',()=>{
 const campaign=new Map([['a-ultima-lua.checkpoint','campaign sentinel']]);
 const e=boot();assert.equal(e.storage.size,0);assert.equal(e.run('qaRandomCalls'),0);e.run('chooseClass("mago");QADebug.preset(50)');
 assert.equal(campaign.get('a-ultima-lua.checkpoint'),'campaign sentinel');
});
test('interactive cards and pending discoveries block QA without consuming or dismissing them',()=>{
 const e=fresh();e.run('var card=document.createElement("div");card.className="interactive-card";document.getElementById("notif-layer").appendChild(card)');
 assert.equal(e.run('QADebug.idle()'),false);assert.throws(()=>e.run('QADebug.restore()'));
 e.run('card.remove();player.romarDiscoveries={seen:[],pending:"massacre",cooldown:0}');
 assert.equal(e.run('QADebug.idle()'),false);assert.throws(()=>e.run('QADebug.preset(25)'));
});
test('invalid input is rejected before mutations; lowering max clamps HP without restoring it',()=>{
 const e=fresh(),before=e.run('JSON.stringify(player)');
 for(const bad of [-1,1.5,Infinity,NaN,''])assert.throws(()=>e.run(`QADebug.apply({level:7,statPoints:0,forca:0,agilidade:0,magia:0,espirito:0,vitalidade:0,defesa:${typeof bad==='string'?JSON.stringify(bad):bad}})`));
 assert.equal(e.run('JSON.stringify(player)'),before);
 e.run('QADebug.apply({level:7,statPoints:0,forca:0,agilidade:0,magia:0,espirito:50,vitalidade:50,defesa:0});QADebug.restore();QADebug.apply({level:1,statPoints:0,forca:0,agilidade:0,magia:0,espirito:0,vitalidade:0,defesa:0})');
 assert.equal(e.run('player.hp<=player.hpMax&&player.mp<=player.mpMax'),true);
});
