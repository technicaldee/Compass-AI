import { githubTool } from './github.tool';
import { newsTool } from './news.tool';
import { weatherTool } from './weather.tool';
import { DataTool } from '../../types/tools';
import { ProjectPayload } from '../../types/schemas';

export { githubTool, newsTool, weatherTool };

export const allDataTools: DataTool[] = [githubTool, newsTool, weatherTool];

/**
 * Selects relevant data tools based on project characteristics
 */
export const selectRelevantTools = (project: ProjectPayload): DataTool[] => {
  return allDataTools
    .map((tool) => ({
      tool,
      score: tool.relevanceScore(project),
    }))
    .filter(({ score }) => score > 0.3) // Only include tools with relevance > 30%
    .sort((a, b) => b.score - a.score)
    .map(({ tool }) => tool);
};
