import { ExternalData, ProjectPayload } from '../types'

export const githubTool = {
  name: 'GitHub',
  description: 'Fetches trending GitHub repositories',

  async fetch(project: ProjectPayload): Promise<ExternalData | null> {
    try {
      // Fetch trending repos (simplified - in production use GitHub API)
      const response = await fetch('https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=5', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('GitHub API request failed')
      }

      const data = await response.json()
      const repos = data.items || []

      // Find relevant repo based on project category
      const relevantRepo = repos.find((repo: { name: string; description: string }) =>
        repo.description?.toLowerCase().includes(project.category.toLowerCase())
      ) || repos[0]

      return {
        source: 'GitHub',
        data: {
          name: relevantRepo?.name,
          description: relevantRepo?.description,
          stars: relevantRepo?.stargazers_count,
          url: relevantRepo?.html_url,
        },
        timestamp: new Date().toISOString(),
        relevance: 0.7,
      }
    } catch (error) {
      console.error('GitHub tool error:', error)
      return null
    }
  },

  relevanceScore(project: ProjectPayload): number {
    // GitHub is relevant for tech projects
    return project.category === 'tech' ? 0.8 : 0.3
  },
}

