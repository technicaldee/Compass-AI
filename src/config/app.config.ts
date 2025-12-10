import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mastra: {
    apiKey: process.env.MASTRA_API_KEY || '',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  externalAPIs: {
    github: {
      apiKey: process.env.GITHUB_API_KEY || '',
      baseUrl: 'https://api.github.com',
    },
    news: {
      apiKey: process.env.NEWS_API_KEY || '',
      baseUrl: 'https://newsapi.org/v2',
    },
    weather: {
      apiKey: process.env.WEATHER_API_KEY || '',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
