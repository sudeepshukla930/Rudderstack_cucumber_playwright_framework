import { test, expect } from '@playwright/test';
import { RudderstackClient } from '../../helpers/api-client';
import { EventFactory } from '../../helpers/event-factory';

test.describe('Rudderstack API Verification', () => {
  let rudderstackClient: RudderstackClient;
  
  test.beforeAll(async () => {
    console.log('[API Test] Setting up API client from environment variables...');
    console.log(`[API Test] RUDDERSTACK_DATAPLANE_URL: ${process.env.RUDDERSTACK_DATAPLANE_URL}`);
    console.log(`[API Test] RUDDERSTACK_WRITE_KEY: ${process.env.RUDDERSTACK_WRITE_KEY ? '****** (redacted)' : 'Not found'}`);
    
    rudderstackClient = await RudderstackClient.create(
      process.env.RUDDERSTACK_WRITE_KEY!,
      process.env.RUDDERSTACK_DATAPLANE_URL!
    );
  });

  test.afterAll(async () => {
    console.log('[API Test] Disposing of API client context...');
    await rudderstackClient.dispose();
  });
  
  test('should successfully send an identify event', async () => {
    console.log('[API Test] Starting test: "should successfully send an identify event"');
    const identifyEvent = EventFactory.createIdentifyEventBody();
    console.log('[API Test] Sending an identify event...');
    const apiResponse = await rudderstackClient.sendEvent('identify', identifyEvent);
    console.log(`[API Test] Response status for identify event: ${apiResponse.status()}`);
    expect(apiResponse.status()).toBe(200);
  });

  test('should successfully send a track event', async () => {
    console.log('[API Test] Starting test: "should successfully send a track event"');
    const trackEvent = EventFactory.createTrackEventBody('test_track_event', { key: 'value' });
    console.log('[API Test] Sending a track event...');
    const apiResponse = await rudderstackClient.sendEvent('track', trackEvent);
    console.log(`[API Test] Response status for track event: ${apiResponse.status()}`);
    expect(apiResponse.status()).toBe(200);
  });
});