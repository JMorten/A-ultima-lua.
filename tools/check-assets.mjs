// Orçamento de assets para jogos web.
// Uso: node check-assets.mjs <pasta> [limitePorArquivoKB] [limiteTotalMB]
// Exemplo: node check-assets.mjs assets 500 15

import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] || "assets";
const maxFileKB = Number(process.argv[3] || 500);
const maxTotalMB = Number(process.argv[4] || 15);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile()) out.push({ path: p, size: statSync(p).size });
  }
  return out;
}

const files = walk(root).sort((a, b) => b.size - a.size);
const total = files.reduce((n, f) => n + f.size, 0);
const totalMB = total / 1024 / 1024;

console.log(`Pasta: ${root}`);
console.log(`Arquivos: ${files.length}`);
console.log(`Total: ${totalMB.toFixed(2)} MB (limite ${maxTotalMB} MB)`);
console.log("\nTop 10:");
for (const f of files.slice(0, 10)) {
  console.log(`  ${(f.size / 1024).toFixed(0).padStart(7)} KB  ${relative(root, f.path)}`);
}

let failed = false;
if (totalMB > maxTotalMB) {
  console.error(`\nFALHA: total ${totalMB.toFixed(2)} MB > ${maxTotalMB} MB`);
  failed = true;
}
for (const f of files) {
  if (f.size > maxFileKB * 1024) {
    console.error(`FALHA: ${relative(root, f.path)} = ${(f.size / 1024).toFixed(0)} KB > ${maxFileKB} KB`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("\nOK: orçamento de assets respeitado.");
