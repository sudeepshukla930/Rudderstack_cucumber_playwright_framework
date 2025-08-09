import { v4 as uuidv4 } from 'uuid';

export interface EventProperties {
  [key: string]: any;
}

// Factory Pattern: Centralized creation of event bodies.
// This ensures consistent data generation and reduces boilerplate.
export const EventFactory = {
  createIdentifyEventBody: (options?: { userId?: string; anonymousId?: string; traits?: EventProperties }) => {
    return {
      userId: options?.userId || uuidv4(),
      anonymousId: options?.anonymousId || `anon-${uuidv4()}`,
      context: {
        traits: {
          trait1: `new-val-${Date.now()}`,
          ...options?.traits,
        },
        ip: '14.5.67.21',
        library: {
          name: 'http',
        },
      },
      timestamp: new Date().toISOString(),
    };
  },

  createTrackEventBody: (event: string, properties: EventProperties) => {
    return {
      userId: uuidv4(),
      event: event,
      properties: properties,
      context: {
        ip: '14.5.67.21',
      },
      timestamp: new Date().toISOString(),
    };
  },

  createPageEventBody: (pageName: string, properties: EventProperties) => {
    return {
      userId: uuidv4(),
      anonymousId: `anon-${uuidv4()}`,
      name: pageName,
      properties: properties,
      context: {
        ip: '14.5.67.21',
        library: {
          name: 'http',
        },
      },
      timestamp: new Date().toISOString(),
    };
  },
};