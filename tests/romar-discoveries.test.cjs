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
  sequence(run,[0.99,0.99,0.01,0,0]);
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
test('playtest reset clears only Romar state and preserves all other player fields',()=>{
  const run=game();
  run('player.defeatedBosses=[0,1];player.level=8;player.totalXp=1234;player.coins=456;player.hp=17;player.mp=9;getForestProgress().commonKills=80;getForestProgress().miniBossKills=4;getForestProgress().miniBossDefeated=true;getSwampProgress().commonKills=50;getSwampProgress().miniBossKills=2;player.questItems={fragmento_ferro_runico:{questClue:true}};player.romar_first_choice="attacked";player.romarDiscoveries={seen:["runa","massacre","marcas"],pending:"marcas",cooldown:2};ui.romarResult="resultado";ui.monster={id:"romar",romarChoice:true};forestEventCooldown=2;var notices=[];popNotif=notice=>notices.push(notice);');
  const snapshot='JSON.stringify(Object.fromEntries(Object.entries(player).filter(([key])=>!["romarDiscoveries","romar_first_choice"].includes(key))))';
  const before=run(snapshot);
  assert.equal(run('resetRomarPlaytest()'),true);
  assert.equal(run(snapshot),before);
  assert.equal(run('JSON.stringify(player.romarDiscoveries)'),'{"seen":[],"pending":null,"cooldown":0,"clueAttempts":0,"encounterAttempts":0}');
  assert.equal(run('player.romar_first_choice'),undefined);
  assert.equal(run('ui.romarResult'),null);
  assert.equal(run('ui.monster'),null);
  assert.equal(run('ui.inBattle'),false);
  assert.equal(run('forestEventCooldown'),2); // compartilhado com eventos normais, não pertence só a Romar
  assert.equal(run('notices[0].persist'),true);
  assert.equal(run('notices[0].title'),'CADEIA DE ROMAR RESETADA');
  assert.equal(run('canEncounterRomar()'),false);
  run('forestEventCooldown=0;getForestProgress().discoveries=3');
  sequence(run,[0.99,0.99,0.01,0]);run('explorarMapa(0)');
  assert.equal(run('getRomarDiscoveries().seen.length'),1);
});
test('reset remains available after choice, supports old characters and refuses active battle',()=>{
  const run=game();
  run('player.romar_first_choice="spared"');
  assert.ok(run('renderMapaTab()').includes('RESETAR CADEIA DE ROMAR'));
  assert.ok(!run('renderMapaTab()').includes('onclick="startRomarEncounter()"'));
  run('delete player.romarDiscoveries;resetRomarPlaytest()');
  assert.ok(run('renderMapaTab()').includes('onclick="startRomarEncounter()"'));
  run('startRomarEncounter()');
  const before=run('JSON.stringify([player,ui])');
  assert.equal(run('resetRomarPlaytest()'),false);
  assert.equal(run('JSON.stringify([player,ui])'),before);
});
for(const encounter of [false,true]){
  test('pity probability boundaries: '+(encounter?'encounter':'clues'),()=>{
    const chances=encounter?[.06,.06,.12,.12,.25,.25,.50,1]:[.12,.15,.20,.30,.50,1];
    chances.forEach((chance,index)=>{
      for(const success of [false,true]){
        if(chance===1&&!success)continue;
        const run=game();
        run('player.defeatedBosses=[0];getForestProgress().discoveries=3;');
        if(encounter)run('getRomarDiscoveries().seen=["massacre","marcas","runa"]');
        const key=encounter?'encounterAttempts':'clueAttempts';
        run('getRomarDiscoveries().'+key+'='+index);
        sequence(run,[.99,.99,.99,success?chance-.00001:chance,0]);
        run('explorarMapa(0)');
        assert.equal(run(encounter?'ui.monster.id==="romar"':'!!getRomarDiscoveries().pending'),success);
        assert.equal(run('getRomarDiscoveries().'+key),success?0:index+1);
      }
    });
  });
}
test('sixth real clue attempt guaranteed, next clue starts fresh, independent counters',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3;getRomarDiscoveries().encounterAttempts=4');
  for(let cycle=0;cycle<2;cycle++){
    for(let n=1;n<=6;n++){
      sequence(run,[.99,.99,.99,.999999,0]);
      run('explorarMapa(0)');
      assert.equal(run('getRomarDiscoveries().clueAttempts'),n===6?0:n);
      assert.equal(run('getRomarDiscoveries().encounterAttempts'),4);
      if(n<6)run('fleeBattle()');
    }
    assert.equal(run('getRomarDiscoveries().seen.length'),cycle+1);
    run('finishRomarDiscovery();getRomarDiscoveries().cooldown=0;forestEventCooldown=0');
  }
});
test('eighth encounter guaranteed; no clue roll on same click',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3;getRomarDiscoveries().seen=["massacre","marcas","runa"];getRomarDiscoveries().clueAttempts=7');
  assert.equal(run('ui.inBattle'),false);
  for(let n=1;n<=8;n++){
    sequence(run,[.99,.99,.99,.999999,0]);
    run('explorarMapa(0)');
    assert.equal(run('getRomarDiscoveries().encounterAttempts'),n===8?0:n);
    assert.equal(run('getRomarDiscoveries().clueAttempts'),7);
    assert.equal(run('getRomarDiscoveries().seen.length'),3);
    assert.equal(run('ui.monster.id==="romar"'),n===8);
    if(n<8)run('fleeBattle()');
  }
});
test('accepted explorations count even when occupied; blocked clicks do not',()=>{
  const scenarios=[
    ['trap',[0,0],''],
    ['normal event',[.99,0],'showForestEvent=()=>{}'],
    ['territorial discovery',[.99,.99,0],'getForestProgress().discoveries=0'],
    ['shared cooldown',[.99,.99],'forestEventCooldown=1'],
    ['clue cooldown',[.99,.99,.99],'getRomarDiscoveries().cooldown=1'],
    ['interactive card',[],'document.querySelectorAll=()=>[{}]'],
    ['before Alfa',[.99,.99,.99],'player.defeatedBosses=[]'],
    ['completed',[.99,.99,.99],'player.romar_first_choice="spared"'],
    ['pending scene',[],'getRomarDiscoveries().pending="massacre"'],
    ['other territory',[.99,.99,.99],''],
  ];
  for(const [name,rolls,setup] of scenarios){
    const run=game();
    run('player.defeatedBosses=[0];getForestProgress().discoveries=3;getRomarDiscoveries().clueAttempts=2;getRomarDiscoveries().encounterAttempts=3;'+setup);
    sequence(run,rolls);run('explorarMapa('+(name==='other territory'?1:0)+')');
    assert.equal(run('getRomarDiscoveries().clueAttempts'),['trap','normal event','territorial discovery','shared cooldown','clue cooldown'].includes(name)?3:2,name);
    assert.equal(run('getRomarDiscoveries().encounterAttempts'),3,name);
  }
});
test('counter migration, serialization, reset and playtest isolation',()=>{
  const run=game();
  run('player.romarDiscoveries={seen:["runa"],pending:null,cooldown:0}');
  assert.equal(run('getRomarDiscoveries().clueAttempts'),0);
  assert.equal(run('getRomarDiscoveries().encounterAttempts'),0);
  run('getRomarDiscoveries().clueAttempts=5;getRomarDiscoveries().encounterAttempts=7;player=JSON.parse(JSON.stringify(player))');
  assert.equal(run('getRomarDiscoveries().clueAttempts'),5);
  assert.equal(run('getRomarDiscoveries().encounterAttempts'),7);
  run('startRomarEncounter()');
  assert.equal(run('getRomarDiscoveries().encounterAttempts'),7);
  run('fleeBattle();resetRomarPlaytest()');
  assert.equal(run('getRomarDiscoveries().clueAttempts'),0);
  assert.equal(run('getRomarDiscoveries().encounterAttempts'),0);
});
for(const encounter of [false,true]){
  test('pending guarantee survives occupied clicks and serialization: '+(encounter?'encounter':'clue'),()=>{
    const run=game();
    run('player.defeatedBosses=[0];getForestProgress().discoveries=3;');
    if(encounter)run('getRomarDiscoveries().seen=["massacre","marcas","runa"]');
    const key=encounter?'encounterAttempts':'clueAttempts',limit=encounter?8:6;
    run('getRomarDiscoveries().'+key+'='+(limit-1));
    sequence(run,[0,0]);run('explorarMapa(0)'); // limite alcançado numa armadilha
    assert.equal(run('getRomarDiscoveries().'+key),limit);
    assert.equal(run('ui.inBattle'),false);
    assert.equal(run('getRomarDiscoveries().pending'),null);
    run('player=JSON.parse(JSON.stringify(player));showForestEvent=()=>{forestEventCooldown=2}');
    sequence(run,[.99,0]);run('explorarMapa(0)'); // evento normal mantém prioridade
    assert.equal(run('getRomarDiscoveries().'+key),limit+1);
    for(let i=0;i<2;i++){
      sequence(run,[.99,.99,.99]);run('explorarMapa(0)');
      assert.notEqual(run('ui.monster.id'),'romar');
      assert.equal(run('getRomarDiscoveries().'+key),limit+2+i);
      run('fleeBattle()');
    }
    sequence(run,[.99,.99,.99,.999999,0]);run('explorarMapa(0)');
    assert.equal(run('getRomarDiscoveries().'+key),0);
    assert.equal(run(encounter?'ui.monster.id==="romar"':'!!getRomarDiscoveries().pending'),true);
  });
}
test('eligibility switches counter only on next accepted exploration',()=>{
  const run=game();
  run('player.defeatedBosses=[0];getForestProgress().discoveries=3;getRomarDiscoveries().seen=["massacre","marcas"];getRomarDiscoveries().clueAttempts=5;');
  sequence(run,[.99,.99,.99,.999999,0]);run('explorarMapa(0)');
  assert.equal(run('getRomarDiscoveries().pending'),'runa');
  assert.equal(run('getRomarDiscoveries().clueAttempts'),0);
  assert.equal(run('getRomarDiscoveries().encounterAttempts'),0);
  assert.equal(run('ui.inBattle'),false);
  run('finishRomarDiscovery()');
  sequence(run,[.99,.99,.99]);run('explorarMapa(0)');
  assert.equal(run('getRomarDiscoveries().encounterAttempts'),1);
  assert.equal(run('getRomarDiscoveries().clueAttempts'),0);
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
