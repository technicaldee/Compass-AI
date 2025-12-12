import { ExternalData, ProjectPayload } from '../types'

export const weatherTool = {
  name: 'Weather',
  description: 'Fetches current weather information',

  async fetch(project: ProjectPayload): Promise<ExternalData | null> {
    try {
      // Mock weather data (in production, use OpenWeatherMap API)
      // Weather might be relevant for community events or outdoor projects
      const mockWeather = {
        temperature: 22,
        condition: 'Sunny',
        location: 'San Francisco',
      }

      return {
        source: 'Weather',
        data: mockWeather,
        timestamp: new Date().toISOString(),
        relevance: 0.3,
      }
    } catch (error) {
      console.error('Weather tool error:', error)
      return null
    }
  },

  relevanceScore(project: ProjectPayload): number {
    // Weather is most relevant for community events
    return project.category === 'community' ? 0.6 : 0.2
  },
}

