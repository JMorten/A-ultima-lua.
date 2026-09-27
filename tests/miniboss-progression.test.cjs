const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function game(){
  const element = {style:{},classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}};
  const context = vm.createContext({
    console, Date, Math:Object.create(Math), setTimeout(){}, setInterval(){},
    document:{getElementById:()=>element,querySelectorAll:()=>[],createElement:()=>({...element})}
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/game.js'),'utf8'),context);
  vm.runInContext('render=()=>{}; popNotif=()=>{}; newPlayer("cavaleiro"); Math.random=()=>0.99; isXpEventActive=()=>false;',context);
  return code=>vm.runInContext(code,context);
}

for(const [region,index,getter,target,challenge] of [
  ['forest',0,'getForestProgress','getForestMiniBossTarget','desafiarMiniBossFloresta'],
  ['swamp',1,'getSwampProgress','getSwampMiniBossTarget','desafiarMiniBossPantano']
]){
  test(region+': first hunt, three repeat cycles and surplus historical kills',()=>{
    const run=game();
    run('ui.mapIndex='+index);
    const win=kind=>run('handleVictory(MAPS['+index+'].'+kind+')');
    const count=()=>run(getter+'().commonKills');
    const ready=()=>run(getter+'().commonKills>='+target+'()');
    const display=value=>assert.ok(run('renderMapaTab()').includes('<b>'+value+'</b>'));
    const blocked=()=>{
      run('var starts=0; startBattle=()=>{starts++}; '+challenge+'()');
      assert.equal(run('starts'),0);
    };
    for(let i=0;i<13;i++)win('monsters[0]');
    display('13/14'); assert.equal(ready(),false); blocked();
    win('monsters[0]'); display('14/14'); assert.equal(ready(),true);
    // Reproduces the original bug: player keeps exploring before fighting.
    for(let i=0;i<20;i++)win('monsters[0]');
    for(let cycle=0;cycle<3;cycle++){
      const historical=count();
      win('miniBoss');
      assert.equal(count(),historical); display('0/7'); blocked();
      assert.equal(run(getter+'().commonKillsAtLastMiniBossVictory'),historical);
      for(let i=1;i<=6;i++){win('monsters[0]');display(i+'/7');assert.equal(ready(),false);}
      blocked(); win('monsters[0]'); display('7/7'); assert.equal(ready(),true);
      run(challenge+'()');assert.equal(run('starts'),1);
      if(cycle===1)for(let i=0;i<9;i++)win('monsters[0]');
    }
    win('miniBoss');display('0/7');assert.equal(ready(),false);
    assert.equal(run(getter+'().miniBossKills'),4);
  });
  test(region+': legacy states migrate once without losing history or unlocks',()=>{
    const run=game();
    run('player.'+region+'Progress={commonKills:60,miniBossDefeated:true};');
    assert.equal(run(target+'()'),67);
    assert.equal(run(getter+'().commonKills'),60);
    assert.equal(run(getter+'().miniBossDefeated'),true);
    assert.equal(run(getter+'().miniBossKills'),1);
    run(getter+'().commonKills+=6');
    assert.equal(run(target+'()'),67);
    const saved=run('JSON.stringify(player.'+region+'Progress)');
    run('player.'+region+'Progress='+saved);
    assert.equal(run(target+'()'),67);
    run('delete player.'+region+'Progress.commonKillsAtLastMiniBossVictory; player.'+region+'Progress.miniBossKills=5;');
    assert.equal(run(target+'()'),73);
    run('player.'+region+'Progress={commonKills:13,miniBossDefeated:false,miniBossKills:0}');
    assert.equal(run(target+'()'),14);
    for(const bad of ['null','-1','999','"bad"']){
      run('player.'+region+'Progress={commonKills:50,miniBossDefeated:true,miniBossKills:2,commonKillsAtLastMiniBossVictory:'+bad+'}');
      assert.equal(run(target+'()'),57);
    }
  });
  test(region+': territorial boss and Romar do not advance hunt',()=>{
    const run=game();
    run('ui.mapIndex='+index+'; '+getter+'().commonKills=40; handleVictory(MAPS['+index+'].miniBoss)');
    const before=run('JSON.stringify('+getter+'())');
    run('handleVictory(MAPS['+index+'].boss)');
    assert.equal(run('JSON.stringify('+getter+'())'),before);
    run('ui.inBattle=false;startRomarEncounter();resolvePlayerHit(1000,false);chooseRomarFirst("spared")');
    assert.equal(run('JSON.stringify('+getter+'())'),before);
  });
}
