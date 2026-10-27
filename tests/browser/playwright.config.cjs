const path = require('node:path');
const { defineConfig } = require('playwright/test');

const artifacts = process.env.AUL_PW_ARTIFACTS || path.join(__dirname, 'artifacts');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: ['post-playtest.spec.cjs', 'qa.spec.cjs', 'gorthak-reactions.spec.cjs', 'scout-reactions.spec.cjs', 'warrior-reactions.spec.cjs', 'captain-reactions.spec.cjs', 'butcher-reactions.spec.cjs'],
  outputDir: path.join(artifacts, 'test-results'),
  reporter: [['list']],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4179',
    headless: true,
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure',
    trace: 'off'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', launchOptions: process.env.AUL_CHROME_EXECUTABLE ? { executablePath: process.env.AUL_CHROME_EXECUTABLE } : {} } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ],
  webServer: {
    command: `"${process.execPath}" "${path.join(__dirname, 'server.cjs')}"`,
    url: 'http://127.0.0.1:4179/health',
    reuseExistingServer: false,
    timeout: 15_000,
    env: { AUL_QA_DIST: process.env.AUL_QA_DIST || '' }
  }
});
