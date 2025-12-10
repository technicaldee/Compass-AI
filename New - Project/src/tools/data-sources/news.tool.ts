import axios from 'axios';
import { ProjectPayload, ProjectCategory, EnrichedData, ProjectContext } from '../../types/schemas';
import { DataTool, NewsArticle } from '../../types/tools';
import { config } from '../../config/app.config';
import { logger } from '../../utils/logger';
import { cacheManager } from '../../memory/cache-manager';

const fetchNews = async (query: string): Promise<NewsArticle[]> => {
  try {
    // Using a mock approach since NewsAPI requires API key
    // In production, replace with actual NewsAPI call
    const url = `${config.externalAPIs.news.baseUrl}/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&pageSize=10`;

    if (!config.externalAPIs.news.apiKey) {
      // Return mock data if no API key
      logger.warn('News API key not configured, returning mock data');
      return getMockNewsArticles(query);
    }

    const response = await axios.get(url, {
      headers: {
        'X-API-Key': config.externalAPIs.news.apiKey,
      },
    });

    const articles: NewsArticle[] = response.data.articles.map(
      (article: {
        title: string;
        description?: string;
        url: string;
        publishedAt: string;
        source: { name: string };
      }) => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        relevance: calculateRelevance(article, query),
      })
    );

    return articles;
  } catch (error) {
    logger.error('News API error', { error });
    // Return mock data on error
    return getMockNewsArticles(query);
  }
};

const getMockNewsArticles = (query: string): NewsArticle[] => {
  return [
    {
      title: `Latest trends in ${query}`,
      description: `Recent developments and insights about ${query} in the current market.`,
      url: 'https://example.com/news/1',
      publishedAt: new Date(),
      source: 'Tech News',
      relevance: 0.8,
    },
    {
      title: `Industry analysis: ${query}`,
      description: `Comprehensive analysis of ${query} and its impact on the industry.`,
      url: 'https://example.com/news/2',
      publishedAt: new Date(Date.now() - 86400000),
      source: 'Business Weekly',
      relevance: 0.7,
    },
  ];
};

const calculateRelevance = (
  article: { title?: string; description?: string; publishedAt?: string | Date },
  query: string
): number => {
  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const queryLower = query.toLowerCase();

  let score = 0;
  if (title.includes(queryLower)) score += 0.5;
  if (description.includes(queryLower)) score += 0.3;
  if (article.publishedAt) {
    const publishedDate =
      typeof article.publishedAt === 'string' ? new Date(article.publishedAt) : article.publishedAt;
    if (publishedDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) score += 0.2;
  }

  return Math.min(score, 1);
};

const getRelevanceScore = (project: ProjectPayload): number => {
  if (
    [ProjectCategory.BUSINESS, ProjectCategory.FINANCE, ProjectCategory.TECH].includes(
      project.category
    )
  ) {
    return 0.8;
  }
  return 0.5;
};

const buildQuery = (project: ProjectPayload): string => {
  const category = project.category;
  const keywords = project.goals.map((g) => g.description).join(' ');
  return `${category} ${keywords}`.substring(0, 100);
};

export const newsTool: DataTool = {
  name: 'news',
  description: 'Fetches relevant news articles based on project category and goals',
  relevanceScore: getRelevanceScore,
  fetch: async (context: ProjectContext): Promise<EnrichedData> => {
    const query = buildQuery(context.project);
    const cacheKey = `news:${query}`;
    const cached = cacheManager.get<EnrichedData>(cacheKey);

    if (cached) {
      logger.debug('News data retrieved from cache', { cacheKey });
      return cached;
    }

    const articles = await fetchNews(query);
    const relevance = getRelevanceScore(context.project);

    const enrichedData: EnrichedData = {
      source: 'news',
      data: articles,
      relevanceScore: relevance,
      timestamp: new Date(),
      metadata: {
        query,
        count: articles.length,
      },
    };

    cacheManager.set(cacheKey, enrichedData, 1800); // Cache for 30 minutes
    return enrichedData;
  },
  cache: {
    ttl: 1800,
    key: (context) => `news:${buildQuery(context.project)}`,
    enabled: true,
  },
};
