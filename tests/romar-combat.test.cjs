const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {test}=require('node:test');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
function game(code=source,level=7){
  const el={style:{},dataset:{},classList:{add(){},remove(){}},appendChild(){},remove(){},addEventListener(){}};
  const context=vm.createContext({Date,Math:Object.create(Math),console,setTimeout(){},setInterval(){},document:{getElementById:()=>el,querySelectorAll:()=>[],createElement:()=>({...el})}});
  vm.runInContext(code,context);
  const run=s=>vm.runInContext(s,context);
  run('render=()=>{};popNotif=()=>{};showForestEvent=()=>{forestEventCooldown=2};newPlayer("cavaleiro");player.level='+level+';recomputeStats();player.hp=player.hpMax;player.mp=player.mpMax;ui.gameStart=0;Math.random=()=>0.99;');
  return run;
}
test('three scaling bands fixed once at start, including level boundaries',()=>{
  for(const [level,hp,atk,def] of [[1,300,24,12],[5,300,24,12],[6,324,25.2,12.6],[7,324,25.2,12.6],[8,345,26.4,12.96],[20,345,26.4,12.96]]){
    const run=game(source,level);run('startRomarEncounter()');
    assert.equal(run('ui.monster.hpMax'),hp);
    assert.ok(Math.abs(run('ui.monster.atk')-atk)<1e-9);
    assert.ok(Math.abs(run('ui.monster.def')-def)<1e-9);
    run('player.level=99');
    assert.equal(run('ui.monster.hpMax'),hp);
    assert.ok(!run('romarBehaviorChip(ui.monster)').includes('GUARDA'));
  }
});
function frequencies(stage,history,last=null){
  const run=game();run('startRomarEncounter();ui.monster.romarStage='+stage+';ui.monster.romarHistory='+JSON.stringify(history)+';ui.monster.romarLastMove='+JSON.stringify(last));
  return JSON.parse(run('JSON.stringify((()=>{const counts={};for(let i=0;i<10000;i++){Math.random=()=>(i+0.5)/10000;const move=romarMoveFromHistory(ui.monster);counts[move]=(counts[move]||0)+1;}return counts;})())'));
}
test('phase probabilities, stronger adaptation, bounded counter and pattern changes',()=>{
  const base=[[1800,1500,1200,2000],[2200,1800,1500,1500],[1500,1800,2200,2000]];
  for(let stage=1;stage<=3;stage++){
    const neutral=frequencies(stage,[]);
    for(const [i,key] of ['guard','breaker','pressure','heavy'].entries())assert.equal(neutral[key],base[stage-1][i]);
    for(const [action,move] of [['defense','breaker'],['attack','guard'],['support','pressure']]){
      const twice=frequencies(stage,[action,action,'other']),thrice=frequencies(stage,[action,action,action]);
      assert.ok(twice[move]>neutral[move]);
      assert.ok(thrice[move]>twice[move]);
      assert.ok(thrice[move]<=5000);
      assert.equal(frequencies(stage,['attack','defense','support'])[move],neutral[move]);
    }
  }
  assert.equal(frequencies(2,['attack','attack','attack'],'guard').guard,undefined);
});
test('Cavaleiro level 7 defense action is learned later and still reduces Guard Break',()=>{
  const run=game();run('startRomarEncounter();player.mp=100;usarSkill("postura_defensiva")');
  assert.equal(run('ui.monster.romarHistory[0]'),'defense');
  assert.ok(run('getEffectiveDef()')>run('player.def'));
  // Grid test above proves this history changes tendency, never forces Quebra-Guarda.
  const damage=defensive=>{
    const r=game();r('startRomarEncounter();player.agilidade=0;player.def=50;player.hp=1000;Math.random=()=>0.5;'+(defensive?'ui.buffs.defBoost={turnsLeft:2,mult:1.25};':'')+'romarStrike(ui.monster,"Quebra-Guarda",1,0.8,false,true)');
    return 1000-r('player.hp');
  };
  assert.ok(damage(true)<damage(false));
  run('ui.monster.romarHistory=["defense"];ui.monster.romarStage=2;Math.random=()=>0.45;resolveRomarAction("defense")');
  // Current second defense must not influence this decision: .45 selects pressure, not breaker.
  assert.equal(run('ui.monster.romarPrepared'),'surge');
});
test('stage transitions, surge telegraph, vulnerability and scaled interruption',()=>{
  const run=game();run('startRomarEncounter();player.hp=1000;resolvePlayerHit(114,false)');
  assert.equal(run('ui.monster.romarStage'),2);assert.equal(run('player.hp'),1000);
  run('Math.random=()=>0.45;monsterCounterTurn()');
  assert.equal(run('ui.monster.romarPrepared'),'surge');assert.equal(run('player.hp'),1000);
  run('monsterCounterTurn()');
  assert.ok(run('player.hp')<1000);
  assert.ok(Math.abs(run('ui.monster.def-ui.monster.battleBaseDef*0.7'))<1e-9);
  run('resolvePlayerHit(100,false)');
  assert.equal(run('ui.monster.romarStage'),3);assert.equal(run('ui.monster.romarPrepared'),'rupture');
  assert.ok(run('romarBehaviorChip(ui.monster)').includes('39'));
  run('resolvePlayerHit(39,false)');
  assert.equal(run('ui.monster.romarSurgePending'),true);
  run('monsterCounterTurn()');
  assert.equal(run('ui.monster.def'),run('ui.monster.battleBaseDef'));
});
test('surviving Rupture opens vulnerability; nonlethal ending and both choices remain',()=>{
  const run=game();run('startRomarEncounter();player.hp=1000;ui.monster.hp=110;resolveRomarAction("support");monsterCounterTurn()');
  assert.ok(run('ui.monster.def')<run('ui.monster.battleBaseDef'));
  for(const choice of ['spared','attacked']){
    const r=game(source,8);r('startRomarEncounter();resolvePlayerHit(99999,false)');
    assert.equal(r('ui.monster.hp'),69);
    assert.equal(r('ui.inBattle'),false);
    r('chooseRomarFirst("'+choice+'")');
    assert.equal(r('player.romar_first_choice'),choice);
    assert.equal(r('player.coins'),25);
  }
  const r=game();r('startRomarEncounter();player.hp=1;monsterCounterTurn()');
  assert.equal(r('player.hp'),r('Math.max(1,Math.round(player.hpMax*.2))'));
  assert.equal(r('player.romar_first_choice'),undefined);
});
test('temporary tools removed; organic flow matches approved pacing over 300 explorations',()=>{
  assert.ok(!/resetRomarPlaytest|DIAGNÓSTICO ROMAR|TESTE — ENCONTRO COM ROMAR|traceRomar/.test(source));
  const old=execFileSync('git',['show','640c8d4:src/game.js'],{cwd:root,encoding:'utf8'});
  const a=game(old,1),b=game(source,1);
  // A única diferença aprovada neste snapshot é o slot vazio Bracelete → Pernas.
  a('player.equipment=Object.fromEntries(Object.entries(player.equipment).map(([key,value])=>[key==="bracelet"?"legs":key,value]))');
  for(const run of [a,b])run('player.defeatedBosses=[0];var seed=12345,calls=0;Math.random=()=>{calls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}');
  for(let i=0;i<300;i++){
    for(const run of [a,b]){
      run('explorarMapa(0)');
      if(run('hasPendingRomarDiscovery()'))run('finishRomarDiscovery()');
      if(run('ui.inBattle'))run('fleeBattle()');
      if(i%40===39)run('player.romarDiscoveries={seen:[],pending:null,cooldown:0,clueAttempts:0,encounterAttempts:0}');
    }
    assert.equal(b('calls'),a('calls'));
    assert.equal(b('JSON.stringify([player,forestEventCooldown,pendingForestEvent])'),a('JSON.stringify([player,forestEventCooldown,pendingForestEvent])'));
  }
});

function defensiveRomar(){
  const run=game();
  run('startRomarEncounter();player.def=50;player.hp=1000;player.agilidade=0;ui.buffs.defBoost={turnsLeft:3,mult:1.25};Math.random=()=>0.5;romarMoveFromHistory=()=>"breaker";resolveRomarAction("defense")');
  return run;
}
test('Fracture applies after a landed breaker, preserves stance and expires after one action plus response',()=>{
  for(const action of ['resolvePlayerHit(1,false)','usarSkill("postura_defensiva")','usarConsumivelBatalha("mp")']){
    const r=defensiveRomar();
    assert.equal(r('player.hp'),981); // Initial breaker does not benefit from its own fracture.
    assert.equal(r('ui.buffs.romarFracture.turnsLeft'),1);
    assert.equal(r('ui.buffs.defBoost.turnsLeft'),2);
    assert.ok(Math.abs(r('getEffectiveDef()')-25.2)<1e-9);
    r('player.mp=100;player.consumables.mp=1;romarMoveFromHistory=()=>"normal";'+action);
    assert.equal(r('player.hp'),968); // Response uses fractured DEF: round(25.2 - 25.2/2).
    assert.equal(r('ui.buffs.romarFracture'),undefined);
    assert.equal(r('getEffectiveDef()'),63);
    r('monsterCounterTurn()');assert.equal(r('player.hp'),967);
  }
});
test('Fracture is not consumed by renders or rejected actions; refresh never stacks',()=>{
  const r=defensiveRomar();
  r('render();player.mp=0;usarSkill("postura_defensiva");usarSkill("invalid");player.consumables.mp=0;usarConsumivelBatalha("mp")');
  assert.equal(r('ui.buffs.romarFracture.turnsLeft'),1);
  r('resolveRomarAction("defense")');
  assert.equal(r('ui.buffs.romarFracture.turnsLeft'),1);
  assert.ok(Math.abs(r('getEffectiveDef()')-25.2)<1e-9);
  r('romarMoveFromHistory=()=>"guard";resolveRomarAction("support")');
  assert.equal(r('ui.buffs.romarFracture'),undefined);
});
test('breaker only fractures a landed hit against active stance',()=>{
  for(const stance of [false,true])for(const dodge of [false,true]){
    const r=game();r('startRomarEncounter();romarMoveFromHistory=()=>"breaker";player.agilidade=80;Math.random=()=>'+(dodge?'0':'0.99')+';'+(stance?'ui.buffs.defBoost={turnsLeft:2,mult:1.25};':'')+'resolveRomarAction("support")');
    assert.equal(r('!!ui.buffs.romarFracture'),stance&&!dodge);
  }
});
test('Fracture clears on transition, interruption, flee, final choice, defeat and encounter restart',()=>{
  for(const end of ['ui.monster.hp=200;resolveRomarAction("attack")','ui.monster.romarStage=3;ui.monster.romarPrepared="rupture";resolveRomarAction("attack",39)','fleeBattle()','romarFinalChoice(ui.monster)','romarNonlethalDefeat()','finishRomarEncounter("test")']){
    const r=defensiveRomar();r(end);assert.equal(r('ui.buffs.romarFracture'),undefined);
  }
  const r=defensiveRomar();r('fleeBattle();startRomarEncounter()');assert.equal(r('getEffectiveDef()'),50);
});
test('special damage matrix covers low/high rolls, stance, defensive builds and damage reduction',()=>{
  const specs={normal:[1,0],breaker:[1,.8],surge:[1.5,.85],aggressive:[1.75,.85],rupture:[4,.85],heavy:[1.5,0]};
  for(const def of [29,50,76])for(const stance of [false,true])for(const roll of [0,.5,.999999])for(const reduction of [0,.35])for(const [move,[mult,pierce]] of Object.entries(specs)){
    const r=game();r('startRomarEncounter();player.def='+def+';player.agilidade=0;player.hp=1000;equippedAffixTotal=()=>'+reduction+';getDodgeChance=()=>0;Math.random=()=>'+roll+';romarMoveFromHistory=()=>'+JSON.stringify(move)+';'+(stance?'ui.buffs.defBoost={turnsLeft:2,mult:1.25};':'')+(move==='aggressive'?'ui.monster.romarSurgePending=true;':['surge','rupture','heavy'].includes(move)?'ui.monster.romarPrepared='+JSON.stringify(move)+';':'')+'resolveRomarAction("support")');
    const D=stance?Math.round(def*1.25):def;
    const expected=Math.max(1,Math.round(Math.max(1,Math.round(Math.max(1,25.2-D*(1-pierce)*.5)*(.85+roll*.3)))*mult*(1-reduction)));
    assert.equal(1000-r('player.hp'),expected,JSON.stringify({def,stance,roll,reduction,move}));
  }
});
test('Rupture boundary remains 39; aggressive consequence and dodge remain available',()=>{
  for(const damage of [38,39]){
    const r=game();r('startRomarEncounter();player.hp=195;player.agilidade=0;player.def=50;ui.buffs.defBoost={turnsLeft:3,mult:1.25};ui.monster.romarStage=3;ui.monster.romarPrepared="rupture";Math.random=()=>0.5;resolveRomarAction("attack",'+damage+')');
    assert.equal(r('player.hp'),damage===38?115:195);
    if(damage===39){assert.equal(r('ui.monster.romarSurgePending'),true);r('monsterCounterTurn()');assert.equal(r('player.hp'),160);}
  }
  for(const prepared of ['surge','rupture']){
    const r=game();r('startRomarEncounter();ui.monster.romarPrepared="'+prepared+'";Math.random=()=>0;monsterCounterTurn()');
    assert.equal(r('player.hp'),r('player.hpMax'));
    assert.ok(r('ui.monster.def<ui.monster.battleBaseDef'));
  }
});
