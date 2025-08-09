import { BeforeAll, AfterAll, setDefaultTimeout, Before, After, ITestCaseHookParameter, AfterStep, BeforeStep } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../../page-objects/login-page';
const fs = require('fs');
require('dotenv').config(); // Ensure this is at the very top

// --- Add these lines for debugging ---
console.log('--- Debugging Environment Variables in hooks.ts ---');
console.log(`RUDDERSTACK_USERNAME (from process.env): ${process.env.RUDDERSTACK_USERNAME}`);
console.log(`RUDDERSTACK_PASSWORD (from process.env): ${process.env.RUDDERSTACK_PASSWORD}`);
console.log(`RUDDERSTACK_WRITE_KEY (from process.env): ${process.env.RUDDERSTACK_WRITE_KEY}`);
console.log(`RUDDERSTACK_DATAPLANE_URL (from process.env): ${process.env.RUDDERSTACK_DATAPLANE_URL}`);
setDefaultTimeout(60 * 1000);

let browser: Browser;
let context: BrowserContext;
let page: Page;

// 1. BeforeAll hook now only sets up the browser and login session
BeforeAll(async function () {
  console.log('Cucumber BeforeAll hook: Setting up browser and authentication state...');
  const videoDir = 'test-results/videos/';
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    const loginPage = new LoginPage(page);
    console.log('--- Debugging Environment Variables in hooks.ts 22 ---');
console.log(`RUDDERSTACK_USERNAME (from process.env): ${process.env.RUDDERSTACK_USERNAME}`);
console.log(`RUDDERSTACK_PASSWORD (from process.env): ${process.env.RUDDERSTACK_PASSWORD}`);
console.log(`RUDDERSTACK_WRITE_KEY (from process.env): ${process.env.RUDDERSTACK_WRITE_KEY}`);
console.log(`RUDDERSTACK_DATAPLANE_URL (from process.env): ${process.env.RUDDERSTACK_DATAPLANE_URL}`);
const username = process.env.RUDDERSTACK_USERNAME;
    const password = process.env.RUDDERSTACK_PASSWORD;

    if (!username || !password) {
      throw new Error("Rudderstack username or password environment variables are not set.");
    }
    console.log(`RUDDERSTACK_USERNAME (from username variable): ${username}`);
console.log(`RUDDERSTACK_PASSWORD (from password variable): ${password}`);
    await loginPage.navigateToLoginPage();
    await loginPage.login(
      username,
      password
    );
    await loginPage.handleSequentialPostLogin();
    await loginPage.verifyLoginSuccess();
    console.log('Login verification successful from Cucumber hook.');

    // Save a single auth state for all scenarios
    await context.storageState({ path: 'auth-state.json' });
    await context.close();
    await browser.close();

  } catch (error) {
    console.error('Cucumber global setup failed!', error);
    if (page) await page.screenshot({ path: `cucumber-setup-failure.png` });
    if (browser) await browser.close();
    throw error;
  }
  console.log('Authentication complete. Session is ready.');
});

// 2. Before hook now launches a new browser context for each scenario
Before(async function ({ pickle }: ITestCaseHookParameter) {
  // Use the tags from the scenario to determine the browser
  const browserName = pickle.tags?.find(tag => tag.name.startsWith('@browser='))?.name.split('=')[1] || 'chromium';
  console.log(`Launching browser for scenario: ${browserName}`);

  if (browserName === 'firefox') {
    browser = await firefox.launch();
  } else if (browserName === 'webkit') {
    browser = await webkit.launch();
  } else {
    browser = await chromium.launch();
  }

  // Use the saved authentication state
  context = await browser.newContext({
    recordVideo: {
      dir: 'test-results/videos/',
      size: { width: 1280, height: 720 }
    },
     storageState: 'auth-state.json' 
    });
  
  this.page = await context.newPage();
  this.browser = browser;
});

// 3. After hook closes the browser for each scenario
After(async function ({ pickle, result }: ITestCaseHookParameter) {
  const page = this.page as Page;
  const context = this.context as BrowserContext;
  if (result?.status === 'FAILED') {
    const screenshot = await page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
    await page.screenshot({ path: `test-results/screenshots/${pickle.name.replace(/\s+/g, '-')}-failed.png`, fullPage: true });
  }

  if (context) {
    
    await context.close();
  }
  await browser.close();
});

// AfterAll is no longer needed since browsers are closed in the After hook
AfterAll(async function () {
  // This hook can be removed or left empty
});