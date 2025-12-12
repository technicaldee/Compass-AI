import { callAI, callAIStructured } from '../ai-client'
import { AgentResponse, ProjectPayload, Priority } from '../types'

interface CollectionState {
  projectName?: string
  category?: string
  goals: Array<{ id: string; description: string; priority: Priority }>
  owner?: { name: string; email?: string; role?: string }
  constraints?: string[]
}

export const dataCollectorAgent = {
  name: 'Data Collector',

  async collectData(
    sessionId: string,
    userInput: string,
    currentState?: CollectionState
  ): Promise<AgentResponse<{ state: CollectionState; nextQuestion?: string; isComplete: boolean }>> {
    try {
      const state: CollectionState = currentState || { goals: [] }

      // Determine what we're likely asking for based on what's missing
      const needsCategory = !state.category
      const needsProjectName = !state.projectName || state.projectName.trim().length === 0
      const needsOwner = !state.owner || !state.owner.name
      const needsGoals = state.goals.length === 0

      const trimmed = userInput.trim().toLowerCase()
      
      // Check if input matches a valid category
      const validCategories = ['tech', 'business', 'community', 'creative', 'education', 'healthcare', 'finance', 'other']
      if (needsCategory && validCategories.includes(trimmed)) {
        state.category = trimmed
        // If projectName or owner was incorrectly set to this category value, clear it
        if (state.projectName?.toLowerCase() === trimmed) {
          state.projectName = undefined
        }
        if (state.owner?.name?.toLowerCase() === trimmed) {
          state.owner = undefined
        }
      }
      // If we're asking for category and input is a valid category, don't set as projectName
      else if (needsProjectName && !needsCategory && trimmed.length > 2 && trimmed.length < 100 && !trimmed.includes('?') && !trimmed.startsWith('i want') && !trimmed.startsWith('my goal') && !validCategories.includes(trimmed)) {
        // Only set as projectName if we're not asking for category AND it's not a valid category
        state.projectName = userInput.trim()
      }
      
      // Store the original projectName before AI extraction to prevent overwriting
      const originalProjectName = state.projectName

      // Use AI to extract structured information
      const extractionPrompt = `Extract project information from the following user input. Be smart about inferring project names - if the user mentions "I want to build X" or "Create X", X could be the project name.

Current state:
${JSON.stringify(state, null, 2)}

User input: "${userInput}"

Extract and update any of these fields if mentioned or can be inferred:
- projectName: string (extract from phrases like "build X", "create X", "project called X", or infer from context)
- category: string (one of: tech, business, community, creative, education, healthcare, finance, other)
- goals: array of { id: string, description: string, priority: "high" | "medium" | "low" }
- owner: { name: string, email?: string, role?: string } (extract names from phrases like "I am X", "owner is X", "my name is X", or just a name by itself)
- constraints: array of strings

IMPORTANT: Only return fields that are NEWLY mentioned or can be inferred from this input. Do NOT return fields that are already in the current state unless they are being updated.

For owner: If the user provides just a name (like "John" or "Lina"), extract it as the owner name.

Return a JSON object with only the fields that were mentioned or updated in this input.`

      const schema = `{
  "projectName": "string (optional)",
  "category": "string (optional)",
  "goals": [{"id": "string", "description": "string", "priority": "high|medium|low"}],
  "owner": {"name": "string", "email": "string (optional)", "role": "string (optional)"},
  "constraints": ["string"]
}`

      const extracted = await callAIStructured<Partial<CollectionState>>(
        extractionPrompt,
        schema,
        { temperature: 0.2, maxTokens: 500 }
      )

      // Merge extracted data into state (preserve existing values)
      // Only override projectName if we didn't have one before AND AI extracted one
      // This prevents overwriting user-provided project names
      if (extracted.projectName && (!originalProjectName || originalProjectName.trim().length === 0)) {
        state.projectName = extracted.projectName
      }
      // Category: prefer direct match over AI extraction if it's a valid category
      if (extracted.category && !state.category) {
        state.category = extracted.category
      }
      if (extracted.goals && extracted.goals.length > 0) {
        // Merge goals, avoiding duplicates by both ID and description
        const existingGoalIds = new Set(state.goals.map(g => g.id))
        const existingGoalDescriptions = new Set(state.goals.map(g => g.description.toLowerCase().trim()))
        
        const newGoals = extracted.goals.filter(g => {
          const hasDuplicateId = existingGoalIds.has(g.id)
          const hasDuplicateDescription = existingGoalDescriptions.has(g.description.toLowerCase().trim())
          return !hasDuplicateId && !hasDuplicateDescription
        })
        
        // Ensure new goals have unique IDs
        const maxExistingId = state.goals.length > 0 
          ? Math.max(...state.goals.map(g => {
              const match = g.id.match(/\d+/)
              return match ? parseInt(match[0]) : 0
            }))
          : 0
        
        const goalsWithUniqueIds = newGoals.map((g, index) => ({
          ...g,
          id: g.id && !existingGoalIds.has(g.id) ? g.id : `goal_${maxExistingId + index + 1}`,
        }))
        
        state.goals = [...state.goals, ...goalsWithUniqueIds]
      }
      
      // Deduplicate goals after merging
      const seenDescriptions = new Set<string>()
      const seenIds = new Set<string>()
      state.goals = state.goals.filter(g => {
        const descKey = g.description.toLowerCase().trim()
        if (seenDescriptions.has(descKey) || seenIds.has(g.id)) {
          return false
        }
        seenDescriptions.add(descKey)
        seenIds.add(g.id)
        return true
      })
      if (extracted.owner) {
        state.owner = { ...(state.owner || {}), ...extracted.owner }
      }
      if (extracted.constraints) {
        state.constraints = [...(state.constraints || []), ...extracted.constraints]
      }

      // Handle "skip" for owner
      if (userInput.toLowerCase().trim() === 'skip' && !state.owner) {
        state.owner = { name: 'Project Owner' }
      }

      // If user input looks like just a name and we don't have owner, extract it
      // But don't do this if it's a valid category (categories shouldn't be treated as names)
      const isCategory = validCategories.includes(userInput.trim().toLowerCase())
      
      if (!state.owner && !isCategory && userInput.trim().length < 50 && !userInput.toLowerCase().includes('project') && !userInput.toLowerCase().includes('goal') && userInput.toLowerCase().trim() !== 'skip') {
        // Simple heuristic: if input is short and looks like a name, treat it as owner
        const trimmed = userInput.trim()
        if (trimmed.split(' ').length <= 3 && /^[A-Za-z\s]+$/.test(trimmed)) {
          state.owner = { name: trimmed }
        }
      }

      // If we have goals and owner but no project name, try to generate one using AI
      if (!state.projectName && state.goals.length > 0 && state.owner) {
        try {
          const namePrompt = `Based on these project goals: ${state.goals.map(g => g.description).join(', ')}
          
Generate a short, descriptive project name (2-4 words max). Return ONLY the project name, nothing else, no quotes, no explanation.`

          const generatedName = await callAI(namePrompt, { temperature: 0.5, maxTokens: 50 })
          
          if (generatedName) {
            // Clean up the response - remove quotes, extra text
            const cleaned = generatedName.replace(/["']/g, '').trim().split('\n')[0].trim()
            if (cleaned.length > 0 && cleaned.length < 50) {
              state.projectName = cleaned
            }
          }
        } catch (error) {
          // Fallback: use first goal as name
          const firstGoal = state.goals[0].description
          const words = firstGoal.split(' ').slice(0, 3).join(' ')
          state.projectName = words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()
        }
      }

      // Determine next question
      const nextQuestion = this.determineNextQuestion(state)
      const isComplete = !nextQuestion

      return {
        success: true,
        data: {
          state,
          nextQuestion,
          isComplete,
        },
        confidence: isComplete ? 0.9 : 0.6,
        reasoning: isComplete
          ? 'All required data collected'
          : `Need more information: ${nextQuestion}`,
      }
    } catch (error) {
      return {
        success: false,
        data: {
          state: currentState || { goals: [] },
          isComplete: false,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  determineNextQuestion(state: CollectionState): string | undefined {
    // Ask for project name first if missing or empty
    // Make the question more contextual if we already have some info
    if (!state.projectName || state.projectName.trim().length === 0) {
      if (state.goals.length > 0 || state.owner) {
        return "What would you like to name this project? (You can provide a name or we can suggest one based on your goals)"
      }
      return "What's the name of your project?"
    }

    // Then category
    if (!state.category) {
      return 'What category does this project fall into? (tech, business, community, creative, etc.)'
    }

    // Then goals
    if (state.goals.length === 0) {
      return 'What are your main goals for this project?'
    }

    // Finally owner - make it optional if we have other essential info
    if (!state.owner || !state.owner.name) {
      // If we have project name, category, and goals, we can use a default owner
      if (state.projectName && state.category && state.goals.length > 0) {
        state.owner = { name: 'Project Owner' }
        return undefined // Complete with default owner
      }
      return 'Who is the project owner? Please provide a name (or say "skip" to use default).'
    }

    // All required fields collected
    return undefined
  },
}

