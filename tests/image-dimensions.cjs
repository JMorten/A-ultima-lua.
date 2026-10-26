const fs = require("node:fs");
const assert = require("node:assert/strict");

function readWebpDimensions(file) {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", `RIFF ausente: ${file}`);
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", `WEBP ausente: ${file}`);
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  }
  if (chunk === "VP8 ") {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`Chunk WebP não suportado (${chunk}): ${file}`);
}

function assertWebp(file, width, height) {
  const size = readWebpDimensions(file);
  if (width !== undefined) assert.equal(size.width, width, `largura: ${file}`);
  if (height !== undefined) assert.equal(size.height, height, `altura: ${file}`);
}

module.exports = { readWebpDimensions, assertWebp };
