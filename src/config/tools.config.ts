import { ToolConfig } from '../types/tools';

export const toolConfigs: Record<string, ToolConfig> = {
  github: {
    enabled: true,
    rateLimit: {
      maxRequests: 60,
      windowMs: 60000, // 1 minute
    },
    retry: {
      maxAttempts: 3,
      backoffMs: 1000,
    },
  },
  news: {
    enabled: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 86400000, // 24 hours
    },
    retry: {
      maxAttempts: 2,
      backoffMs: 2000,
    },
  },
  weather: {
    enabled: true,
    rateLimit: {
      maxRequests: 60,
      windowMs: 60000,
    },
    retry: {
      maxAttempts: 3,
      backoffMs: 1000,
    },
  },
};
