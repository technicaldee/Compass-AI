import { ExternalData, ProjectPayload } from '../types'

export const newsTool = {
  name: 'News',
  description: 'Fetches latest news headlines',

  async fetch(project: ProjectPayload): Promise<ExternalData | null> {
    try {
      // Using a free news API (NewsAPI.org) - requires API key in production
      // For demo, we'll use a mock response
      const category = project.category === 'tech' ? 'technology' : 'general'
      
      // Mock news data (in production, use NewsAPI)
      const mockNews = {
        articles: [
          {
            title: `Latest trends in ${project.category} projects`,
            description: `Recent developments in ${project.category} sector`,
            url: 'https://example.com/news',
            publishedAt: new Date().toISOString(),
          },
        ],
      }

      return {
        source: 'News',
        data: mockNews.articles[0],
        timestamp: new Date().toISOString(),
        relevance: 0.6,
      }
    } catch (error) {
      console.error('News tool error:', error)
      return null
    }
  },

  relevanceScore(project: ProjectPayload): number {
    // News is relevant for business and tech projects
    return ['business', 'tech'].includes(project.category) ? 0.7 : 0.4
  },
}

