import { callAIStructured } from '../ai-client'
import { AgentResponse, ProjectPayload } from '../types'

export const validatorAgent = {
  name: 'Validator',

  async validate(project: Partial<ProjectPayload>): Promise<AgentResponse<{ isValid: boolean; errors: Array<{ field: string; message: string }>; confidence: number }>> {
    try {
      // Auto-deduplicate goals before validation
      if (project.goals && project.goals.length > 0) {
        const seenDescriptions = new Set<string>()
        const seenIds = new Set<string>()
        const deduplicatedGoals = project.goals.filter(g => {
          const descKey = g.description?.toLowerCase().trim() || ''
          if (seenDescriptions.has(descKey) || seenIds.has(g.id)) {
            return false
          }
          seenDescriptions.add(descKey)
          seenIds.add(g.id)
          return true
        })
        project.goals = deduplicatedGoals
      }

      const validationPrompt = `Validate the following project data. Check if all required fields are present and valid.

Project data:
${JSON.stringify(project, null, 2)}

Required fields:
- projectName: string (non-empty)
- category: one of: tech, business, community, creative, education, healthcare, finance, other
- goals: array with at least one goal
- owner: object with at least a "name" field

Respond with a JSON object:
{
  "isValid": boolean,
  "errors": [{"field": "string", "message": "string"}],
  "confidence": number (0-1)
}`

      const schema = `{
  "isValid": "boolean",
  "errors": [{"field": "string", "message": "string"}],
  "confidence": "number"
}`

      const validation = await callAIStructured<{
        isValid: boolean
        errors: Array<{ field: string; message: string }>
        confidence: number
      }>(validationPrompt, schema, {
        temperature: 0.1,
        maxTokens: 500,
      })

      return {
        success: true,
        data: validation,
        confidence: validation.confidence || 0.8,
      }
    } catch (error) {
      // Fallback validation
      const errors: Array<{ field: string; message: string }> = []
      if (!project.projectName) errors.push({ field: 'projectName', message: 'Project name is required' })
      if (!project.category) errors.push({ field: 'category', message: 'Category is required' })
      if (!project.goals || project.goals.length === 0) {
        errors.push({ field: 'goals', message: 'At least one goal is required' })
      }
      if (!project.owner || !project.owner.name) {
        errors.push({ field: 'owner', message: 'Owner name is required' })
      }

      return {
        success: true,
        data: {
          isValid: errors.length === 0,
          errors,
          confidence: errors.length === 0 ? 0.9 : 0.5,
        },
      }
    }
  },
}

