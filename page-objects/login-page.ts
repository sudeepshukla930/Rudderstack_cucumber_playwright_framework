// File: page-objects/login-page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  private emailInput = () => this.page.locator('input[type="email"]');
  private passwordInput = () => this.page.locator('input[type="password"]');
  private loginButton = () => this.page.getByRole('button', { name: /^Log in$/i });
  private connectionsHeader = () => this.page.getByRole('heading', { name: 'Connections' });
  private laterLink = () => this.page.locator(`a:text("I'll do this later")`);
  private goToDashboardButton = () => this.page.locator('button:has-text("Go to dashboard")');
  private closeButton = () => this.page.getByTitle('Close');

  // --- NEW METHOD ---
  async isDashboardVisible(): Promise<boolean> {
    return await this.connectionsHeader().isVisible({ timeout: 5000 });
  }

  async navigateToLoginPage() {
    await this.page.goto('https://app.rudderstack.com/login');
    await expect(this.emailInput()).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.emailInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
    
  }

  async skip2FA() {
    if (await this.laterLink().isVisible({ timeout: 10000 })) {
      console.log('2FA setup page detected. Skipping 2FA...');
      await this.laterLink().click();
      await this.goToDashboardButton().click();
      
    }
  }

  async closePopup() {
    if (await this.closeButton().isVisible({ timeout: 5000 })) {
      console.log('Popup detected. Closing popup...');
      await this.closeButton().click();
      await this.page.waitForTimeout(500);
    }
  }

  async verifyLoginSuccess() {
    await expect(this.connectionsHeader()).toBeVisible({ timeout: 50000 });
  }

   async handleSequentialPostLogin() {
    console.log('Checking for post-login screens...');
    
    // Step 1: 2FA page ko handle karein (agar maujood hai)
    try {
      console.log('Waiting for 2FA screen...');
      await this.laterLink().waitFor({ state: 'visible', timeout: 15000 });
      console.log('2FA setup page detected. Skipping 2FA...');
      await this.laterLink().click();
      await this.goToDashboardButton().click();
    } catch (e) {
      console.log('2FA screen not detected. Proceeding...');
    }

    // Step 2: Dashboard ke load hone ka wait karein
    console.log('Waiting for the dashboard to load...');
    await expect(this.connectionsHeader()).toBeVisible({ timeout: 30000 });
    console.log('Dashboard is now visible.');

    // Step 3: Popup ko handle karein (agar maujood hai)
    try {
      console.log('Checking for a popup on the dashboard...');
      await this.closeButton().waitFor({ state: 'visible', timeout: 10000 });
      console.log('Popup detected. Closing popup...');
      await this.closeButton().click();
    } catch (e) {
      console.log('No popup detected. Proceeding...');
    }
  }
}