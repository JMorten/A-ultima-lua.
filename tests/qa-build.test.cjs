const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {build}=require('../_qa/build.cjs');
const root=path.resolve(__dirname,'..');
test('QA artifact is generated; all shared scripts/assets are byte-identical and source HTML untouched',()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'lua-qa-'));
 try{
  for(const dir of ['src','styles','assets','_qa'])fs.cpSync(path.join(root,dir),path.join(fixture,dir),{recursive:true});
  fs.copyFileSync(path.join(root,'index.html'),path.join(fixture,'index.html'));
  const original=fs.readFileSync(path.join(fixture,'index.html'));
  const out=build(fixture),html=fs.readFileSync(path.join(out,'index.html'),'utf8');
  assert.ok(html.indexOf('qa/debug.js')>html.indexOf('src/persistence.js'));
  assert.ok(html.includes('qa/debug.css'));assert.ok(!original.includes('qa/debug'));
  for(const dir of ['src','styles','assets'])for(const file of fs.readdirSync(path.join(fixture,dir),{recursive:true}).filter(file=>fs.statSync(path.join(fixture,dir,file)).isFile()))assert.deepEqual(fs.readFileSync(path.join(out,dir,file)),fs.readFileSync(path.join(fixture,dir,file)));
  assert.deepEqual(fs.readFileSync(path.join(fixture,'index.html')),original);
  assert.ok(!fs.existsSync(path.join(out,'qa/build.cjs')));
  build(fixture);assert.equal(fs.readFileSync(path.join(out,'index.html'),'utf8'),html);
 }finally{fs.rmSync(fixture,{recursive:true,force:true});}
});
test('production has no Debug entry and explicitly excludes both QA source and generated artifact',()=>{
 assert.ok(!fs.existsSync(path.join(root,'.nojekyll')));
 const config=fs.readFileSync(path.join(root,'_config.yml'),'utf8');
 for(const dir of ['_qa','_qa-dist','tests/qa-debug.test.cjs','tests/qa-build.test.cjs'])assert.ok(config.split('\n').includes('  - '+dir));
 for(const file of ['index.html','src/game.js','src/persistence.js','styles/game.css'])assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/QADebug|qa\/debug|MODO QA/);
});
