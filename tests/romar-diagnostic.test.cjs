const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {test}=require('node:test');
const root=path.join(__dirname,'..');
const current=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
const baseline=execFileSync('git',['show','640c8d4c5913b41e2aff722f0f7b8b0d760c22da:src/game.js'],{cwd:root,encoding:'utf8'});
function game(code){
  let seed=12345,calls=0;
  const el={style:{},dataset:{},classList:{add(){},remove(){}},appendChild(){},remove(){},addEventListener(){}};
  const math=Object.create(Math);math.random=()=>{calls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const context=vm.createContext({Math:math,Date,console,setTimeout(){},setInterval(){},document:{getElementById:()=>el,querySelectorAll:()=>[],createElement:()=>({...el})}});
  vm.runInContext(code,context);
  const run=s=>vm.runInContext(s,context);
  run('render=()=>{};popNotif=()=>{};showForestEvent=()=>{forestEventCooldown=2};isXpEventActive=()=>false;isMonsterEventActive=()=>false;newPlayer("cavaleiro");player.defeatedBosses=[0];ui.mapIndex=0;ui.gameStart=0;');
  return {run,calls:()=>calls};
}
test('diagnostic reads do not normalize legacy state or consume RNG',()=>{
  const g=game(current);
  g.run('delete player.romarDiscoveries');
  const before=g.run('JSON.stringify([player,ui,forestEventCooldown])'),calls=g.calls();
  for(let i=0;i<10;i++)g.run('romarDiagnosticSnapshot();romarDiagnosticText();updateRomarDiagnostic()');
  assert.equal(g.run('JSON.stringify([player,ui,forestEventCooldown])'),before);
  assert.equal(g.calls(),calls);
});
test('instrumented exploration matches approved build state and RNG across 300 clicks',()=>{
  const old=game(baseline),now=game(current);
  for(let i=0;i<300;i++){
    for(const g of [old,now]){
      g.run('explorarMapa(0)');
      if(g.run('hasPendingRomarDiscovery()'))g.run('finishRomarDiscovery()');
      if(g.run('ui.inBattle'))g.run('fleeBattle()');
      if(i%40===39)g.run('resetRomarPlaytest()');
    }
    assert.equal(now.calls(),old.calls(),'RNG calls at '+i);
    assert.equal(now.run('JSON.stringify([player,ui,forestEventCooldown,pendingForestEvent,lastForestEventId,battleLog])'),
      old.run('JSON.stringify([player,ui,forestEventCooldown,pendingForestEvent,lastForestEventId,battleLog])'),'state at '+i);
  }
});
test('trace identifies guarantee deferred by cooldown and preserves last accepted click',()=>{
  const g=game(current);
  g.run('getForestProgress().discoveries=3;getRomarDiscoveries().clueAttempts=6;getRomarDiscoveries().cooldown=1;Math.random=()=>0.99;explorarMapa(0)');
  const trace=g.run('romarExplorationTrace.join("\\n")');
  assert.ok(trace.includes('6 → 7'));
  assert.ok(trace.includes('Pista garantida: SIM'));
  assert.ok(trace.includes('cooldown ativo no início'));
  g.run('explorarMapa(0)'); // battle already open
  assert.equal(g.run('romarExplorationTrace.join("\\n")'),trace);
  assert.equal(g.run('romarBlockedClick'),'combate ativo');
});
