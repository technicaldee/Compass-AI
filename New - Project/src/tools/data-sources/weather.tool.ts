import axios from 'axios';
import { ProjectPayload, ProjectCategory, EnrichedData, ProjectContext } from '../../types/schemas';
import { DataTool, WeatherData } from '../../types/tools';
import { config } from '../../config/app.config';
import { logger } from '../../utils/logger';
import { cacheManager } from '../../memory/cache-manager';

const fetchWeather = async (location: string = 'New York'): Promise<WeatherData> => {
  try {
    if (!config.externalAPIs.weather.apiKey) {
      logger.warn('Weather API key not configured, returning mock data');
      return getMockWeatherData(location);
    }

    const url = `${config.externalAPIs.weather.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${config.externalAPIs.weather.apiKey}&units=metric`;

    const response = await axios.get(url);

    const weather: WeatherData = {
      location: response.data.name,
      temperature: response.data.main.temp,
      condition: response.data.weather[0].main,
      forecast: generateForecast(response.data),
      recommendations: generateRecommendations(response.data),
    };

    return weather;
  } catch (error) {
    logger.error('Weather API error', { error });
    return getMockWeatherData(location);
  }
};

const getMockWeatherData = (location: string): WeatherData => {
  return {
    location,
    temperature: 22,
    condition: 'Clear',
    forecast: ['Sunny', 'Partly Cloudy', 'Clear'],
    recommendations: ['Good weather for outdoor activities', 'Consider indoor backup plan'],
  };
};

const generateForecast = (_data: unknown): string[] => {
  return ['Clear', 'Partly Cloudy', 'Sunny'];
};

const generateRecommendations = (data: {
  main: { temp: number };
  weather: Array<{ main: string }>;
}): string[] => {
  const temp = data.main.temp;
  const condition = data.weather[0].main.toLowerCase();

  const recommendations: string[] = [];

  if (temp < 10) {
    recommendations.push('Cold weather - consider indoor venue');
  } else if (temp > 30) {
    recommendations.push('Hot weather - ensure adequate cooling');
  }

  if (condition.includes('rain')) {
    recommendations.push('Rain expected - have indoor backup plan');
  }

  if (condition.includes('clear') || condition.includes('sun')) {
    recommendations.push('Good weather for outdoor events');
  }

  return recommendations.length > 0 ? recommendations : ['Weather conditions are favorable'];
};

const getRelevanceScore = (project: ProjectPayload): number => {
  // Community and event-related projects benefit from weather data
  if (project.category === ProjectCategory.COMMUNITY) {
    return 0.9;
  }
  // Check if project goals mention events, outdoor activities, etc.
  const goalsText = project.goals.map((g) => g.description.toLowerCase()).join(' ');
  if (goalsText.includes('event') || goalsText.includes('outdoor') || goalsText.includes('venue')) {
    return 0.8;
  }
  return 0.3;
};

export const weatherTool: DataTool = {
  name: 'weather',
  description: 'Fetches weather data and forecasts for event planning',
  relevanceScore: getRelevanceScore,
  fetch: async (context: ProjectContext): Promise<EnrichedData> => {
    // Try to extract location from project data
    const location = extractLocation(context.project) || 'New York';
    const cacheKey = `weather:${location}`;
    const cached = cacheManager.get<EnrichedData>(cacheKey);

    if (cached) {
      logger.debug('Weather data retrieved from cache', { cacheKey });
      return cached;
    }

    const weather = await fetchWeather(location);
    const relevance = getRelevanceScore(context.project);

    const enrichedData: EnrichedData = {
      source: 'weather',
      data: weather,
      relevanceScore: relevance,
      timestamp: new Date(),
      metadata: {
        location,
      },
    };

    cacheManager.set(cacheKey, enrichedData, 1800); // Cache for 30 minutes
    return enrichedData;
  },
  cache: {
    ttl: 1800,
    key: (context) => `weather:${extractLocation(context.project) || 'default'}`,
    enabled: true,
  },
};

const extractLocation = (project: ProjectPayload): string | null => {
  // Try to find location in constraints or goals
  const allText = [
    ...(project.constraints || []).map((c) => c.description),
    ...project.goals.map((g) => g.description),
  ].join(' ');

  // Simple location extraction (in production, use NLP)
  const locationKeywords = ['new york', 'london', 'san francisco', 'tokyo', 'paris'];
  for (const keyword of locationKeywords) {
    if (allText.toLowerCase().includes(keyword)) {
      return keyword;
    }
  }

  return null;
};
