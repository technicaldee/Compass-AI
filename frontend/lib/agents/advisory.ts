import { callAIStructured } from '../ai-client'
import { AgentResponse, ProjectPayload, Suggestion, ExternalData } from '../types'

export const advisoryAgent = {
  name: 'Advisory Agent',

  async generateSuggestions(
    project: ProjectPayload,
    externalData: ExternalData[]
  ): Promise<AgentResponse<{ suggestions: Suggestion[]; summary: string }>> {
    try {
      const externalDataSummary = externalData
        .map((d) => `- ${d.source}: ${JSON.stringify(d.data)}`)
        .join('\n')

      const prompt = `You are an advisory agent that provides actionable suggestions for projects.

Project Information:
- Name: ${project.projectName}
- Category: ${project.category}
- Goals: ${project.goals.map((g) => g.description).join(', ')}
- Owner: ${project.owner.name}
${project.constraints ? `- Constraints: ${project.constraints.join(', ')}` : ''}

External Data Available:
${externalDataSummary || 'No external data available'}

Generate 1-3 actionable suggestions for this project. Each suggestion should:
1. Be specific and actionable
2. Include a clear reason why it's relevant
3. Reference the source of information (project data or external data)

Return a JSON object with:
{
  "suggestions": [
    {
      "suggestion": "string (actionable advice)",
      "reason": "string (why this is relevant)",
      "source": "string (where this insight came from)"
    }
  ],
  "summary": "string (1-2 paragraph summary of the overall recommendations)"
}`

      const schema = `{
  "suggestions": [
    {
      "suggestion": "string",
      "reason": "string",
      "source": "string"
    }
  ],
  "summary": "string"
}`

      const result = await callAIStructured<{ suggestions: Suggestion[]; summary: string }>(
        prompt,
        schema,
        { temperature: 0.6, maxTokens: 1500 }
      )

      return {
        success: true,
        data: result,
        confidence: 0.8,
        reasoning: 'Generated suggestions based on project data and external sources',
      }
    } catch (error: any) {
      // Don't use fallback for rate limit errors - let them propagate
      if (error?.isRateLimit || error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
        throw error
      }
      
      // Fallback suggestions for other errors
      return {
        success: true,
        data: {
          suggestions: [
            {
              suggestion: 'Start by breaking down your goals into smaller, measurable milestones',
              reason: 'This helps track progress and maintain focus',
              source: 'project goals analysis',
            },
          ],
          summary: 'Consider breaking down your project goals into smaller milestones to track progress effectively.',
        },
        confidence: 0.5,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

