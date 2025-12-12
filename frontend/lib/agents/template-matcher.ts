import { callAI } from '../ai-client'
import { AgentResponse, TemplateMatchResult, ProjectCategory } from '../types'
import { templates, getTemplateById } from '../templates'

export const templateMatcherAgent = {
  name: 'Template Matcher',

  async matchTemplate(
    userInput: string,
    category?: ProjectCategory
  ): Promise<AgentResponse<TemplateMatchResult>> {
    try {
      const prompt = `You are a template matching agent. Analyze the following user input and recommend the best project template.

Available templates:
${templates.map((t) => `- ${t.id}: ${t.name} (${t.category.join(', ')}) - ${t.description}`).join('\n')}

User input: "${userInput}"
${category ? `Suggested category: ${category}` : ''}

Respond with ONLY the template ID (one of: tech, community, creative) that best matches the user's project. Consider keywords, project type, and goals.`

      const response = await callAI(prompt, {
        temperature: 0.3,
        maxTokens: 100,
      })

      const matchedId = response.toLowerCase().trim().replace(/[^a-z]/g, '')
      const templateId = ['tech', 'community', 'creative'].includes(matchedId)
        ? matchedId
        : 'tech' // Default fallback

      const template = getTemplateById(templateId)
      if (!template) {
        throw new Error('Template not found')
      }

      const result: TemplateMatchResult = {
        templateId,
        confidence: 0.8,
        reasoning: `Matched "${template.name}" template based on user input analysis`,
        suggestedFields: ['projectName', 'category', 'goals', 'owner'],
      }

      return {
        success: true,
        data: result,
        confidence: result.confidence,
        reasoning: result.reasoning,
      }
    } catch (error) {
      return {
        success: false,
        data: {
          templateId: 'tech',
          confidence: 0,
          reasoning: 'Error occurred during template matching',
          suggestedFields: [],
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

