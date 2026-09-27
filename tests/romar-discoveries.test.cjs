const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
function game(){
  const element={style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}};
  const context=vm.createContext({console,Date,Math:Object.create(Math),setTimeout(){},setInterval(){},
    document:{getElementById:()=>element,querySelectorAll:()=>[],createElement:()=>({...element})}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/game.js'),'utf8'),context);
  vm.runInContext('render=()=>{};popNotif=()=>{};newPlayer("cavaleiro");ui.mapIndex=0;Math.random=()=>0.99;',context);
  return code=>vm.runInContext(code,context);
}
function sequence(run,values){run('var rolls='+JSON.stringify(values)+'; Math.random=()=>rolls.length?rolls.shift():0.99');}
test('pre-Alfa blocked; post-Alfa exploration can discover without changing progress',()=>{
  const run=game();
  assert.equal(run('discoverRomarClue()'),false);
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3');
  const before=run('JSON.stringify([player.forestProgress,player.swampProgress,player.defeatedBosses,player.coins,player.totalXp])');
  sequence(run,[0.99,0.99,0.01,0]);
  run('explorarMapa(0)');
  assert.equal(run('getRomarDiscoveries().pending'),'massacre');
  assert.equal(run('JSON.stringify([player.forestProgress,player.swampProgress,player.defeatedBosses,player.coins,player.totalXp])'),before);
});
test('unique discoveries, variable order and exhausted pool',()=>{
  const orders=[];
  for(const random of [0,0.99]){
    const run=game();run('player.defeatedBosses=[0];Math.random=()=>'+random);
    for(let i=0;i<4;i++){
      assert.equal(run('discoverRomarClue()'),true);
      run('finishRomarDiscovery();getRomarDiscoveries().cooldown=0;forestEventCooldown=0');
    }
    assert.equal(run('discoverRomarClue()'),false);
    assert.equal(run('new Set(getRomarDiscoveries().seen).size'),4);
    orders.push(run('getRomarDiscoveries().seen.filter(id=>id!=="runa").join(",")'));
  }
  assert.notEqual(orders[0],orders[1]);
});
test('rune and three total clues required; eligibility does not start combat',()=>{
  const run=game();run('player.defeatedBosses=[0]');
  for(const [seen,eligible] of [
    [['massacre','marcas','acampamento'],false],
    [['runa','massacre'],false],
    [['runa','massacre','marcas'],true]
  ]){
    run('getRomarDiscoveries().seen='+JSON.stringify(seen));
    assert.equal(run('canEncounterRomar()'),eligible);
    assert.equal(run('ui.inBattle'),false);
  }
});
test('eligible exploration uses existing encounter only on successful later roll',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3;getRomarDiscoveries().seen=["runa","massacre","marcas"]');
  sequence(run,[0.99,0.99,0.99,0.01]);
  run('explorarMapa(0)');
  assert.equal(run('ui.monster.id'),'romar');
  assert.equal(run('ui.monster.hp'),300);
});
test('eligibility alone does not guarantee an encounter',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3;getRomarDiscoveries().seen=["runa","massacre","marcas"];explorarMapa(0)');
  assert.notEqual(run('ui.monster.id'),'romar');
});
test('completed first encounters never repeat, both choices',()=>{
  for(const choice of ['spared','attacked']){
    const run=game();
    run('player.defeatedBosses=[0];getRomarDiscoveries().seen=["runa","massacre","marcas"];startRomarEncounter();resolvePlayerHit(1000,false);chooseRomarFirst("'+choice+'");continueRomarResult()');
    assert.equal(run('canEncounterRomar()'),false);
    assert.equal(run('startRomarEncounter()'),false);
  }
});
test('temporary access bypasses clues without granting clues',()=>{
  const run=game();
  assert.ok(run('renderMapaTab()').includes('TESTE — ENCONTRO COM ROMAR'));
  assert.equal(run('startRomarEncounter()'),true);
  assert.equal(run('getRomarDiscoveries().seen.length'),0);
});
test('scene persists, blocks stacking and closes only by button action',()=>{
  const run=game();run('player.defeatedBosses=[0];discoverRomarClue()');
  const html=run('renderMapaTab()');
  assert.ok(html.includes('romar-discovery-art'));
  assert.ok(html.includes('onclick="finishRomarDiscovery()"'));
  const pending=run('getRomarDiscoveries().pending');
  run('explorarMapa(0);switchTab("loja");startBattle(0,MAPS[0].monsters[0],false)');
  assert.equal(run('getRomarDiscoveries().pending'),pending);
  assert.equal(run('ui.inBattle'),false);
  assert.equal(run('startRomarEncounter()'),false);
  run('finishRomarDiscovery()');
  assert.equal(run('getRomarDiscoveries().pending'),null);
  assert.equal(run('ui.tab'),'mapa');
});
test('existing interactive event blocks new discoveries and exploration',()=>{
  const run=game();
  run('player.defeatedBosses=[0];document.querySelectorAll=()=>[{}]');
  assert.equal(run('discoverRomarClue()'),false);
  run('explorarMapa(0)');
  assert.equal(run('ui.inBattle'),false);
  assert.equal(run('getRomarDiscoveries().seen.length'),0);
});
test('two explorations after scene cannot produce another special event',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3;discoverRomarClue();finishRomarDiscovery()');
  for(let i=0;i<2;i++){
    sequence(run,[0.99,0.01,0.99]);
    run('explorarMapa(0)');
    assert.equal(run('getRomarDiscoveries().pending'),null);
    assert.notEqual(run('ui.monster.id'),'romar');
    run('fleeBattle()');
  }
  assert.equal(run('getRomarDiscoveries().cooldown'),0);
});
test('legacy player migrates without losing progression; serialized pending scene survives',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().commonKills=77;delete player.romarDiscoveries');
  assert.equal(run('getRomarDiscoveries().seen.length'),0);
  assert.equal(run('getForestProgress().commonKills'),77);
  run('discoverRomarClue();player=JSON.parse(JSON.stringify(player))');
  assert.ok(run('renderMapaTab()').includes('DESCOBERTA'));
  assert.equal(run('getRomarDiscoveries().seen.length'),1);
});
test('normal forest events, stage discoveries, traps and swamp remain accessible',()=>{
  const run=game();
  run('var normalEvent=false;showForestEvent=()=>{normalEvent=true}');
  sequence(run,[0.99,0.01]);run('explorarMapa(0)');
  assert.equal(run('normalEvent'),true);
  sequence(run,[0.99,0.99,0.01]);run('explorarMapa(0)');
  assert.equal(run('getForestProgress().discoveries'),1);
  const hp=run('player.hp');
  sequence(run,[0,0]);run('explorarMapa(0)');
  assert.ok(run('player.hp')<hp);
  sequence(run,[0.99,0.99,0.99]);run('explorarMapa(1)');
  assert.equal(run('ui.mapIndex'),1);
  assert.notEqual(run('ui.monster.id'),'romar');
});
test('art paths exist and PNG signatures match',()=>{
  const run=game();
  const scenes=JSON.parse(run('JSON.stringify(ROMAR_DISCOVERIES)'));
  for(const scene of scenes){
    const bytes=fs.readFileSync(path.join(__dirname,'..',scene.image));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  }
});
