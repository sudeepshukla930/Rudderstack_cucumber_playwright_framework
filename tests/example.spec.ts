// File: tests/setup/auth.setup.ts

import { test, expect } from '@playwright/test';
import { ConnectionsPage } from '../page-objects/connection-page';
import { EventFactory } from '../helpers/event-factory';
import { RudderstackClient } from '../helpers/api-client';

test.describe('Authentication Flow Verification', () => {

  test('should allow a user to log in successfully', async ({ page }) => {
    console.log('Starting dedicated login test: Navigating to login page.');
    await page.goto('https://app.rudderstack.com/login');
    
    // Add a wait to see the login page
    await page.waitForTimeout(1000); 

    if (!process.env.RUDDERSTACK_USERNAME || !process.env.RUDDERSTACK_PASSWORD) {
      throw new Error('RUDDERSTACK_USERNAME and RUDDERSTACK_PASSWORD must be set in the .env file for login test.');
    }
const connectionsPage = new ConnectionsPage(page);
    console.log('Filling in login credentials...');
    await page.fill('input[type="email"]', process.env.RUDDERSTACK_USERNAME);
    await page.fill('input[type="password"]', process.env.RUDDERSTACK_PASSWORD);
    
    // Add a wait to see the filled-in form
    await page.waitForTimeout(1000); 
    
    console.log('Clicking the login button...');
    await page.getByRole('button', { name: /^Log in$/i }).click();

    console.log('Waiting for "Connections" text to confirm successful login...');
    const isConnectionsPageVisible = await page.locator('text=Connections').isVisible({ timeout: 5000 });

    if (!isConnectionsPageVisible) {
      console.log('Connections page not immediately visible. Assuming 2FA setup page is active.');
      //await connectionsPage.skip2FA();
    }
    
    console.log('Waiting for "Connections" text to confirm successful navigation to the dashboard...');
    await expect(page.locator('text=Connections')).toBeVisible({ timeout: 30000 });
    console.log('Login successful! "Connections" text is visible.');
  
    
    // Add a wait after login
    await page.waitForTimeout(2000); 


    console.log('Navigating to source page to get credentials.');
    const dataPlaneUrl = await connectionsPage.getDataPlaneUrlFromUI();
    console.log(dataPlaneUrl);
    await page.waitForTimeout(2000); 
    await connectionsPage.navigateToSourcePage();
    
    // Add a wait to see the source page
    await page.waitForTimeout(1000); 

    const writeKey = await connectionsPage.getWriteKeyFromUI();
  console.log(writeKey);
    
    const rudderstackClient = await RudderstackClient.create(writeKey!, dataPlaneUrl!);

    console.log('Navigating to webhook events tab.');
    await connectionsPage.navigateToWebhookEventsTab();
    
    // Add a wait to see the webhook events tab
    await page.waitForTimeout(1000); 

    const initialDeliveredCount = await connectionsPage.getDeliveredEventsCount();
    console.log(`Initial delivered event count: ${initialDeliveredCount}`);
    
    console.log('Sending "identify" event via API.');
    const identifyEvent = EventFactory.createIdentifyEventBody();
    const apiResponse = await rudderstackClient.sendEvent('identify', identifyEvent);
    console.log(`[API Test] Response status for identify event: ${apiResponse.status()}`);
    expect(apiResponse.status()).toBe(200);


    // // Add a wait after the API call to see if the UI updates
    // await page.waitForTimeout(1000); 
    
    // console.log("Clicking on Refreshig button "); 

    // await connectionsPage.clickRefreshButton();

    // await page.reload();

    
    // const newDeliveredCount = await connectionsPage.getDeliveredEventsCount();
    // console.log(`New delivered event count is: ${newDeliveredCount}`);
    // expect(newDeliveredCount).toBe(initialDeliveredCount);

    await rudderstackClient.dispose();
  });
});