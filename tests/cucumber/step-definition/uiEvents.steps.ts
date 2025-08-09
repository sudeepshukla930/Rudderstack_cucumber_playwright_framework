import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ConnectionsPage } from '../../../page-objects/connection-page';
import { LoginPage } from '../../../page-objects/login-page'; // LoginPage bhi use hoga
import { RudderstackClient } from '../../../helpers/api-client';
import { EventFactory, EventProperties } from '../../../helpers/event-factory';

let connectionsPage: ConnectionsPage;
let loginPage: LoginPage; // Login page object bhi declare kiya
let rudderstackClient: RudderstackClient;
let initialDeliveredCount: number;
let currentEventName: string; // Current event name ko store karne ke liye

Given('a user is logged in and on the Connections dashboard', async function () {
  connectionsPage = new ConnectionsPage(this.page);
  loginPage = new LoginPage(this.page); // Instantiate LoginPage
  
  // global setup se login ho chuka hai, bas Connections page par navigate aur verify karein
  console.log('Verifying that the test starts on the Connections page.');
  await connectionsPage.navigateToConnectionsPage();
  await loginPage.verifyLoginSuccess(); // IsDashboardVisible ka enhanced version
  console.log('User is on the Connections dashboard.');
});

When('the user retrieves data plane URL from the dashboard', async function () {
  const dataPlaneUrl = await connectionsPage.getDataPlaneUrlFromUI();
  this.dataPlaneUrl = dataPlaneUrl; // Store in Cucumber world for later use
  console.log(`Retrieved Data Plane URL: ${this.dataPlaneUrl}`);
});

When('navigates to the HTTP test source page', async function () {
  await connectionsPage.navigateToSourcePage();
  console.log('Navigated to HTTP test source page.');
});

When('retrieves write key from the source page', async function () {
  const writeKey = await connectionsPage.getWriteKeyFromUI();
  this.writeKey = writeKey; // Store in Cucumber world
  console.log(`Retrieved Write Key: ${this.writeKey}`);
});

When('initializes the API client', async function () {
  rudderstackClient = await RudderstackClient.create(this.writeKey!, this.dataPlaneUrl!);
  console.log('Rudderstack API client initialized.');
});

When('navigates to the Webhook Events tab', async function () {
  await connectionsPage.navigateToWebhookEventsTab();
  initialDeliveredCount = await connectionsPage.getDeliveredEventsCount();
  console.log(`Navigated to Webhook Events tab. Initial delivered count: ${initialDeliveredCount}`);
});

When('sends an {string} event via the API', async function (eventType: string) {
  const eventBody = EventFactory.createIdentifyEventBody();
  currentEventName = "identify"; // Default for identify event in UI
  const apiResponse = await rudderstackClient.sendEvent('identify', eventBody);
  expect(apiResponse.status()).toBe(200);
  console.log(`Sent '${eventType}' event via API.`);
});

When('sends a {string} event with event name {string} and properties', async function (eventType: string, eventName: string, datatable: any) {
  const properties: EventProperties = datatable.rowsHash();
  const eventBody = EventFactory.createTrackEventBody(eventName, properties);
  currentEventName = eventName; // Store event name for later verification
  const apiResponse = await rudderstackClient.sendEvent('track', eventBody);
  expect(apiResponse.status()).toBe(200);
  console.log(`Sent '${eventType}' event with name '${eventName}' and properties.`);
});

When('sends a {string} event with page name {string} and properties', async function (eventType: string, pageName: string, datatable: any) {
  const properties: EventProperties = datatable.rowsHash();
  const eventBody = EventFactory.createPageEventBody(pageName, properties);
  currentEventName = pageName; // Store page name for later verification
  const apiResponse = await rudderstackClient.sendEvent('page', eventBody);
  expect(apiResponse.status()).toBe(200);
  console.log(`Sent '${eventType}' event with page name '${pageName}' and properties.`);
});

When('refreshes the event list', async function () {
  await connectionsPage.clickRefreshButton();
  console.log('Refreshed the event list.');
});

Then('the delivered event count should increase by 1', async function () {
//   const newDeliveredCount = await connectionsPage.getDeliveredEventsCount();
//   expect(newDeliveredCount).toBe(initialDeliveredCount);
//   console.log('Verified delivered event count increased by 1.');


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
  }).toPass({ timeout: 860000 }); // 6-minute timeout

  console.log('Success! Delivered event count has increased by 1.');
    
});

Then('the {string} event should appear in the events list', async function (expectedEventName: string) {
  // Use the event name passed from the feature file
  await expect(this.page.locator(`text=\"${expectedEventName}\"`)).toBeVisible({ timeout: 20000 });
  console.log(`Verified '${expectedEventName}' appears in the events list.`);
});