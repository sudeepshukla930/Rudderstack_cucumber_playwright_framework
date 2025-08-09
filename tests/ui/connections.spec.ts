import { test, expect } from '@playwright/test';
import { ConnectionsPage } from '../../page-objects/connection-page';
import { RudderstackClient } from '../../helpers/api-client';
import { EventFactory } from '../../helpers/event-factory';
import { LoginPage } from '../../page-objects/login-page';

test.describe('Connections UI and API Verification', () => {
  // Test Case 1: Verifies the event count on the connections page after an API call.
  test('should increase delivered event count after sending an identify event', async ({ page }) => {
    console.log('Starting test: "should increase delivered event count after sending an identify event"');
    const connectionsPage = new ConnectionsPage(page);
    const loginPage = new LoginPage(page);

     console.log('Verifying that the test starts on the Connections page.');
    await connectionsPage.navigateToConnectionsPage();
    await loginPage.isDashboardVisible();
    console.log('Navigating to the source page to get API credentials...');
    const dataPlaneUrl = await connectionsPage.getDataPlaneUrlFromUI();
    await connectionsPage.navigateToSourcePage();
    const writeKey = await connectionsPage.getWriteKeyFromUI();
   
    console.log(`Successfully retrieved writeKey: ${writeKey} and dataPlaneUrl: ${dataPlaneUrl}`);

    console.log('Initializing Rudderstack API client...');
    const rudderstackClient = await RudderstackClient.create(writeKey!, dataPlaneUrl!);
    console.log('Rudderstack API client initialized.');

    console.log('Navigating to webhook events tab to check initial event count...');
    await connectionsPage.navigateToWebhookEventsTab();
    const initialDeliveredCount = await connectionsPage.getDeliveredEventsCount();
    console.log(`Initial delivered event count: ${initialDeliveredCount}`);
    
    console.log('Sending an "identify" API event...');
    const identifyEvent = EventFactory.createIdentifyEventBody();
    const apiResponse = await rudderstackClient.sendEvent('identify', identifyEvent);
    expect(apiResponse.status()).toBe(200);
    console.log('API event sent successfully with status 200.');

    console.log('Clicking the refresh button to update the UI...');
    await connectionsPage.clickRefreshButton();
    console.log(`Starting dynamic wait for delivered count to increase... Initial count was: ${initialDeliveredCount}`);
      
      await expect(async () => {
        // 1. Refresh the UI on each retry.
        await connectionsPage.clickRefreshButton();
        console.log('Refreshed the event list.');
    
        // 2. Get the count from the refreshed UI.
        const newDeliveredCount = await connectionsPage.getDeliveredEventsCount();
        console.log(`Checking count... current count is ${newDeliveredCount}`);
    
        // 3. Assert the count.
        expect(newDeliveredCount).toBe(initialDeliveredCount + 1);
      }).toPass({ timeout: 860000 });
   
    console.log('Verified that the delivered event count increased by 1.');

    await rudderstackClient.dispose();
    console.log('Test finished successfully.');
  });

  // Test Case 2: Verifies basic navigation and content on the connections page.
  test('should successfully navigate to the connections page and verify content', async ({ page }) => {
    console.log('Starting test: "should successfully navigate to the connections page and verify content"');
    const connectionsPage = new ConnectionsPage(page);

    console.log('Navigating directly to the connections page using the pre-authenticated session...');
    await connectionsPage.navigateToConnectionsPage();

    console.log('Verifying key elements on the page...');
    await expect(page.locator('text=Connections')).toBeVisible();
    console.log('"Connections" header is visible.');
    await expect(page.locator('text=Sources')).toBeVisible();
    console.log('"Sources" link is visible.');
    await expect(page.locator('text=Destinations')).toBeVisible();
    console.log('"Destinations" link is visible.');

    console.log('Test finished successfully.');
  });
});