import { APIRequestContext, request } from '@playwright/test';
import { Buffer } from 'buffer';

// A helper client to handle all API communication with Rudderstack.
// This separates API logic from test steps.
export class RudderstackClient {
  private requestContext!: APIRequestContext;
  private readonly writeKey: string;
  private readonly dataPlaneUrl: string;

  constructor(writeKey: string, dataPlaneUrl: string) {
    if (!writeKey || !dataPlaneUrl) {
      throw new Error('Write key and Data Plane URL must be provided.');
    }
    this.writeKey = writeKey;
    this.dataPlaneUrl = dataPlaneUrl;
  }
  
  // A static factory method to create the client asynchronously
  static async create(writeKey: string, dataPlaneUrl: string): Promise<RudderstackClient> {
    const client = new RudderstackClient(writeKey, dataPlaneUrl);
    client.requestContext = await request.newContext();
    return client;
  }

  private createBasicAuthHeader(): string {
    const credentials = `${this.writeKey}:`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  async sendEvent(eventType: 'identify' | 'track' | 'page', eventBody: object) {
    const authHeader = this.createBasicAuthHeader();
    const eventUrl = `${this.dataPlaneUrl}/v1/${eventType}`;

    const response = await this.requestContext.post(eventUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      data: eventBody,
    });
    return response;
  }

  async dispose() {
    // Properly close the context after each test to release resources.
    await this.requestContext.dispose();
  }
}