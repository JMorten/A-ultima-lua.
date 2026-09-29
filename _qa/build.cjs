const fs=require('node:fs');
const path=require('node:path');
function build(root=path.resolve(__dirname,'..')){
  const out=path.join(root,'_qa-dist');
  // Only this fixed, generated directory may be replaced.
  fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
  for(const dir of ['src','styles','assets'])fs.cpSync(path.join(root,dir),path.join(out,dir),{recursive:true});
  let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  if(!html.includes('</head>')||!html.includes('</body>'))throw Error('HTML de entrada inesperado');
  html=html.replace('</head>','<link rel="stylesheet" href="qa/debug.css">\n</head>')
    .replace('</body>','<script src="qa/debug.js"></script>\n</body>');
  fs.writeFileSync(path.join(out,'index.html'),html);
  fs.mkdirSync(path.join(out,'qa'));
  for(const file of ['debug.js','debug.css'])fs.copyFileSync(path.join(root,'_qa',file),path.join(out,'qa',file));
  return out;
}
if(require.main===module)console.log(build());
module.exports={build};
