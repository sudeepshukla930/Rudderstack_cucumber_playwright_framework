// File: page-objects/connections-page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ConnectionsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  private httpTestSourceRow = () => this.page.getByRole('row', { name: /HTTP Test/ });
  private webhookTestDestinationRow = () => this.page.getByRole('row', { name: /Webhook Test/ });
  private setupTab = () => this.page.getByRole('tab', { name: 'Setup' });
  private eventsTab = () => this.page.getByRole('tab', { name: 'Events', exact: true });
  private httpSetupHeader = () => this.page.locator('h3', { hasText: 'HTTP setup' });
  private deliveredCountElement = () => this.page.locator('text=Delivered').locator('..').locator('h2 > span');
  private dataPlaneUrlLocator = () => this.page.locator('div > span').filter({ hasText: /^https?:\/\/[\w.-]+/ });
  private writeKeyContainer = () => this.page.locator('p:has-text("Write key")').locator('..');
  private refreshButton = () => this.page.locator('button:has-text("Refresh")');
  private sourcesLink = () => this.page.locator('a[href="/sources"]');
  private destinationsLink = () => this.page.locator('a[href="/destinations"]');

  async navigateToConnectionsPage() {
    await this.page.goto('https://app.rudderstack.com/');
    
  }

  async navigateToSourcePage() {
    await this.sourcesLink().click();
    console.log('Clicking on the "HTTP Test" source link.');
    await this.httpTestSourceRow().click();
    await this.setupTab().click();
    await this.httpSetupHeader().waitFor({ state: 'visible' });
  }

  async navigateToWebhookEventsTab() {
    await this.destinationsLink().click();
    console.log('Clicking on the "webhook test" destination link.');
    await this.webhookTestDestinationRow().click();
    await this.page.waitForSelector('text=Sources');
    await this.eventsTab().click();
  }

  async getDeliveredEventsCount(): Promise<number> {
    await this.deliveredCountElement().waitFor({ state: 'visible' });
    const countText = await this.deliveredCountElement().textContent();
    return parseInt(countText?.trim() || '0', 10);
  }
  
  async getWriteKeyFromUI(): Promise<string | null> {
    try {
      const fullText = await this.writeKeyContainer().textContent();
      const writeKey = fullText?.replace('Write key', '').trim();
      return writeKey || null;
    } catch (e) {
      return null;
    }
  }

  async getDataPlaneUrlFromUI(): Promise<string | null> {
    try {
      await this.dataPlaneUrlLocator().first().waitFor({ state: 'visible' });
      const url = await this.dataPlaneUrlLocator().first().textContent();
      return url?.trim() || null;
    } catch (e) {
      return null;
    }
  }

  async clickRefreshButton(): Promise<void> {
    await this.refreshButton().click();
    await this.page.waitForTimeout(3000);
  }
}