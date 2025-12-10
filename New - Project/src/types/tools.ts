import { ProjectPayload, EnrichedData, ProjectContext } from './schemas';

export interface DataTool {
  name: string;
  description: string;
  relevanceScore: (project: ProjectPayload) => number;
  fetch: (context: ProjectContext) => Promise<EnrichedData>;
  cache: CacheStrategy;
}

export interface CacheStrategy {
  ttl: number; // Time to live in seconds
  key: (context: ProjectContext) => string;
  enabled: boolean;
}

export interface ToolResponse<T = unknown> {
  success: boolean;
  data: T;
  cached: boolean;
  timestamp: Date;
  error?: string;
}

export interface GitHubTrend {
  repository: string;
  stars: number;
  language: string;
  description: string;
  url: string;
  trendScore: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  source: string;
  relevance: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  forecast: string[];
  recommendations: string[];
}

export interface ToolConfig {
  enabled: boolean;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
}
