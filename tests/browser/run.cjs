const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const repo = path.resolve(__dirname, '..', '..');
const mode = process.argv[2] || 'all';
if (!['all', 'chromium', 'webkit'].includes(mode)) throw new Error('Usage: node run.cjs [all|chromium|webkit]');

function locatePlaywright() {
  const candidates = [
    path.join(__dirname, 'node_modules'),
    path.join(repo, 'node_modules'),
    process.env.AUL_PLAYWRIGHT_NODE_MODULES,
    path.resolve(path.dirname(process.execPath), '..', 'node_modules')
  ].filter(Boolean);
  for (const modules of candidates) {
    const packageJson = path.join(modules, 'playwright', 'package.json');
    if (!fs.existsSync(packageJson)) continue;
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    if (pkg.version !== '1.62.1') throw new Error(`Expected Playwright 1.62.1, found ${pkg.version} at ${packageJson}`);
    return { modules, root: path.dirname(packageJson), pkg };
  }
  throw new Error('Playwright 1.62.1 was not found. No installation was attempted. Set AUL_PLAYWRIGHT_NODE_MODULES to an existing node_modules folder or install the pinned package inside tests/browser.');
}

function copyProjectForQa(tempRoot) {
  for (const name of ['index.html', 'src', 'styles', 'assets', '_qa']) {
    const source = path.join(repo, name);
    if (!fs.existsSync(source)) throw new Error(`Required QA build input is missing: ${source}`);
    fs.cpSync(source, path.join(tempRoot, name), { recursive: true, errorOnExist: true });
  }
  const { build } = require(path.join(tempRoot, '_qa', 'build.cjs'));
  return build(tempRoot);
}

function hasWebkitExecutable(playwrightRoot) {
  const { webkit } = require(path.join(playwrightRoot, 'index.js'));
  const executable = webkit.executablePath();
  return { executable, available: fs.existsSync(executable) };
}

const pw = locatePlaywright();
const qaTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'a-ultima-lua-qa-'));
const artifacts = path.join(__dirname, 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const localChrome = process.env.AUL_CHROME_EXECUTABLE || [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].find(candidate => fs.existsSync(candidate));
try {
  const qaDist = copyProjectForQa(qaTemp);
  const webkit = hasWebkitExecutable(pw.root);
  const engines = mode === 'all' ? (webkit.available ? ['chromium', 'webkit'] : ['chromium']) : [mode];
  if (mode === 'all' && !webkit.available) console.log(`SKIP webkit: Playwright browser binary is unavailable (${webkit.executable}). No browser was downloaded.`);
  if (mode === 'webkit' && !webkit.available) {
    console.error(`WebKit browser binary is unavailable (${webkit.executable}). No browser was downloaded.`);
    process.exitCode = 2;
  } else {
    let failed = false;
    for (const engine of engines) {
      const env = {
        ...process.env,
        NODE_PATH: [pw.modules, process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
        AUL_QA_DIST: qaDist,
        AUL_PW_ARTIFACTS: artifacts,
        ...(localChrome ? { AUL_CHROME_EXECUTABLE: localChrome } : {})
      };
      const cli = path.join(pw.root, 'cli.js');
      const args = [cli, 'test', '--config', path.join(__dirname, 'playwright.config.cjs'), `--project=${engine}`, '--workers=1'];
      console.log(`\nRunning ${engine} against disposable QA build: ${pathToFileURL(qaDist).href}`);
      const result = spawnSync(process.execPath, args, { cwd: __dirname, env, stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) failed = true;
    }
    if (failed) process.exitCode = 1;
  }
} finally {
  fs.rmSync(qaTemp, { recursive: true, force: true });
}
