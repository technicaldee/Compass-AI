import axios from 'axios';
import { ProjectPayload, ProjectCategory, EnrichedData, ProjectContext } from '../../types/schemas';
import { DataTool, GitHubTrend } from '../../types/tools';
import { config } from '../../config/app.config';
import { logger } from '../../utils/logger';
import { cacheManager } from '../../memory/cache-manager';
import { ExternalAPIError } from '../../utils/error-handler';

const fetchGitHubTrends = async (language?: string): Promise<GitHubTrend[]> => {
  try {
    const url = language
      ? `${config.externalAPIs.github.baseUrl}/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=10`
      : `${config.externalAPIs.github.baseUrl}/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=10`;

    const response = await axios.get(url, {
      headers: {
        Authorization: config.externalAPIs.github.apiKey
          ? `token ${config.externalAPIs.github.apiKey}`
          : undefined,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const trends: GitHubTrend[] = response.data.items.map(
      (item: {
        full_name: string;
        stargazers_count: number;
        language: string | null;
        description: string | null;
        html_url: string;
      }) => ({
        repository: item.full_name,
        stars: item.stargazers_count,
        language: item.language || 'Unknown',
        description: item.description || '',
        url: item.html_url,
        trendScore: calculateTrendScore(item),
      })
    );

    return trends;
  } catch (error) {
    logger.error('GitHub API error', { error });
    throw new ExternalAPIError('GitHub', 'Failed to fetch trending repositories', error);
  }
};

const calculateTrendScore = (repo: { stargazers_count?: number }): number => {
  // Simple trend score based on stars and recent activity
  const stars = repo.stargazers_count || 0;
  const normalizedStars = Math.min(stars / 10000, 1); // Normalize to 0-1
  return normalizedStars * 100;
};

const getRelevanceScore = (project: ProjectPayload): number => {
  // Tech projects are highly relevant
  if (project.category === ProjectCategory.TECH) {
    return 0.9;
  }
  // Business projects might use tech tools
  if (project.category === ProjectCategory.BUSINESS) {
    return 0.6;
  }
  // Other categories have lower relevance
  return 0.3;
};

export const githubTool: DataTool = {
  name: 'github',
  description: 'Fetches trending GitHub repositories relevant to the project',
  relevanceScore: getRelevanceScore,
  fetch: async (context: ProjectContext): Promise<EnrichedData> => {
    const cacheKey = `github:${context.project.category}`;
    const cached = cacheManager.get<EnrichedData>(cacheKey);

    if (cached) {
      logger.debug('GitHub data retrieved from cache', { cacheKey });
      return cached;
    }

    // Determine language from project goals
    const techKeywords = ['javascript', 'typescript', 'python', 'react', 'node', 'api'];
    const projectText = JSON.stringify(context.project).toLowerCase();
    const relevantLanguage = techKeywords.find((keyword) => projectText.includes(keyword));

    const trends = await fetchGitHubTrends(relevantLanguage);
    const relevance = getRelevanceScore(context.project);

    const enrichedData: EnrichedData = {
      source: 'github',
      data: trends,
      relevanceScore: relevance,
      timestamp: new Date(),
      metadata: {
        language: relevantLanguage,
        count: trends.length,
      },
    };

    cacheManager.set(cacheKey, enrichedData, 3600); // Cache for 1 hour
    return enrichedData;
  },
  cache: {
    ttl: 3600,
    key: (context) => `github:${context.project.category}`,
    enabled: true,
  },
};
