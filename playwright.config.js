// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',

  /* 📌 กำหนด Global Setup และ Global Teardown */
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://share-ed-frontend-gamma.vercel.app',

    /* 📌 โหลด Session Authentication จาก Global Setup มาใช้โดยอัตโนมัติ */
    storageState: path.join(__dirname, 'playwright/.auth/user.json'),

    /* Collect trace for all tests. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    /* บันทึกภาพ Screenshot อัตโนมัติ: 'on' (ทุกเคส) | 'off' | 'only-on-failure' (เฉพาะตอนพัง) */
    screenshot: 'on',

    /* บันทึกวิดีโออัตโนมัติ: 'on' (ทุกเคส) | 'off' | 'retain-on-failure' (เฉพาะตอนพัง) */
    video: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
