/**
 * All API endpoint constants and path builder functions for the Genie backend.
 * Reference: contract/openapi.yaml v0.1.1
 */

export const ENDPOINTS = {
  HEALTH: '/health',

  AUTH: {
    SESSIONS: '/auth/sessions',
    ME: '/me',
  },

  USERS: {
    LIST: '/users',
    CREATE: '/users',
  },

  REQUESTS: {
    LIST: '/requests',
    CREATE: '/requests',
    DETAIL: (id: string) => `/requests/${id}`,
    ASSIGNMENT: (id: string) => `/requests/${id}/assignment`,
    ESTIMATES: (id: string) => `/requests/${id}/estimates`,
    TRANSITIONS: (id: string) => `/requests/${id}/transitions`,
    OVERRIDE_REVIEW: (id: string) => `/requests/${id}/override-review`,
    HISTORY: (id: string) => `/requests/${id}/history`,
  },

  ESTIMATES: {
    CREATE: (requestId: string) => `/requests/${requestId}/estimates`,
    DECISION: (estimateId: string) => `/estimates/${estimateId}/decision`,
  },
} as const;

export type EndpointPaths = typeof ENDPOINTS;
