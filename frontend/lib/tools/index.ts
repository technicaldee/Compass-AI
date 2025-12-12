import { githubTool } from './github'
import { newsTool } from './news'
import { weatherTool } from './weather'
import { ProjectPayload, ExternalData } from '../types'

export interface DataTool {
  name: string
  description: string
  fetch: (project: ProjectPayload) => Promise<ExternalData | null>
  relevanceScore: (project: ProjectPayload) => number
}

export const allTools: DataTool[] = [githubTool, newsTool, weatherTool]

export async function fetchExternalData(project: ProjectPayload): Promise<ExternalData[]> {
  const relevantTools = allTools
    .map((tool) => ({
      tool,
      score: tool.relevanceScore(project),
    }))
    .filter(({ score }) => score > 0.3) // Only include tools with relevance > 30%
    .sort((a, b) => b.score - a.score)
    .slice(0, 2) // Limit to top 2 most relevant tools
    .map(({ tool }) => tool)

  const dataPromises = relevantTools.map(async (tool) => {
    try {
      return await tool.fetch(project)
    } catch (error) {
      console.error(`Failed to fetch data from ${tool.name}:`, error)
      return null
    }
  })

  const results = await Promise.all(dataPromises)
  return results.filter((r): r is ExternalData => r !== null)
}

