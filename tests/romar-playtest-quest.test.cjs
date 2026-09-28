const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const {execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
function game(){
 const el={style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}};
 const c=vm.createContext({console,Date,Math:Object.create(Math),setTimeout(){},clearTimeout(){},setInterval(){},document:{getElementById:()=>el,querySelectorAll:()=>[],createElement:()=>({...el})}});
 vm.runInContext(source,c);vm.runInContext('render=()=>{};popNotif=()=>{};Math.random=()=>0.99;',c);
 return s=>vm.runInContext(s,c);
}
test('quest fragment is displayed only after attacked route, unique and actionless',()=>{
 for(const choice of ['spared','attacked']){
 const r=game();r('newPlayer("cavaleiro");player.level=7;recomputeStats();startRomarEncounter();resolvePlayerHit(99999,false);chooseRomarFirst("'+choice+'")');
 const html=r('renderQuestItems()');
 assert.ok(html.includes('ITENS DE MISSÃO'));assert.equal(html.includes('Fragmento de Ferro Rúnico'),choice==='attacked');
 assert.ok(!html.includes('onclick'));assert.ok(!html.includes('<button'));
 const before=r('JSON.stringify(player)');
 r('chooseRomarFirst("'+choice+'")');assert.equal(r('JSON.stringify(player)'),before);
 if(choice==='attacked'){
 assert.equal(r('Object.keys(player.questItems).length'),1);
 r('sellItem("fragmento_ferro_runico");equipItem("fragmento_ferro_runico")');
 assert.equal(r('JSON.stringify(player)'),before);
 assert.ok(r('renderInventarioTab()').includes('Você não sabe quem poderia trabalhar algo assim.'));
 }
 }
});
test('legacy quest flag renders without modifying existing state',()=>{
 const r=game();r('newPlayer("cavaleiro");player.questItems={fragmento_ferro_runico:{name:"Fragmento de Ferro Rúnico",questClue:true}}');
 const before=r('JSON.stringify(player)');assert.ok(r('renderQuestItems()').includes('Marcas avermelhadas'));
 assert.equal(r('JSON.stringify(player)'),before);
});
test('entire Romar combat implementation matches requested bff8a72 baseline',()=>{
 const old=execFileSync('git',['show','bff8a72ab1ccb0be7122a2d9d3c7f8ae6b3260cd:src/game.js'],{cwd:root,encoding:'utf8'});
 const segment=s=>s.slice(s.indexOf('function startRomarEncounter(){'),s.indexOf('function tickCooldowns(){')).replace(/\r\n/g,'\n');
 assert.equal(segment(source),segment(old));
});
