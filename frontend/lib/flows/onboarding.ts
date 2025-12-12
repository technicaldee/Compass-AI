import { templateMatcherAgent } from '../agents/template-matcher'

function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
import { dataCollectorAgent } from '../agents/data-collector'
import { validatorAgent } from '../agents/validator'
import { memory } from '../memory'
import { ProjectPayload, ProjectCategory, Priority } from '../types'

export const onboardingFlow = {
  name: 'onboarding',

  async start(
    userInput: string,
    category?: ProjectCategory
  ): Promise<{
    sessionId: string
    templateId: string
    nextQuestion?: string
  }> {
    const sessionId = randomUUID()

    // Step 1: Template matching
    const templateMatch = await templateMatcherAgent.matchTemplate(userInput, category)
    if (!templateMatch.success) {
      throw new Error('Template matching failed')
    }

    const templateId = templateMatch.data.templateId

    // Step 2: Initial data collection
    const collectionResult = await dataCollectorAgent.collectData(sessionId, userInput)
    if (!collectionResult.success) {
      throw new Error('Data collection failed')
    }

    // Save session state
    memory.saveSession(sessionId, {
      state: collectionResult.data.state as Partial<ProjectPayload>,
    })

    return {
      sessionId,
      templateId,
      nextQuestion: collectionResult.data.nextQuestion,
      currentState: collectionResult.data.state, // Include state for client to maintain
    }
  },

  async continue(
    sessionId: string,
    userInput: string,
    currentState?: Partial<ProjectPayload>
  ): Promise<{
    nextQuestion?: string
    isComplete: boolean
    projectId?: string
    currentState?: Partial<ProjectPayload>
    project?: ProjectPayload
  }> {
    // Try to get session from memory, or use provided state
    const session = memory.getSession(sessionId)
    const stateToUse = currentState || session?.state

    if (!stateToUse) {
      // If no state available, start fresh collection with empty state
      // This allows the flow to continue even if session is lost
      const emptyState: Partial<ProjectPayload> = { goals: [] }
      const collectionResult = await dataCollectorAgent.collectData(sessionId, userInput, emptyState as any)
      
      if (!collectionResult.success) {
        throw new Error('Data collection failed. Please restart onboarding.')
      }

      // Save the new state
      memory.saveSession(sessionId, {
        state: collectionResult.data.state as Partial<ProjectPayload>,
      })

      return {
        nextQuestion: collectionResult.data.nextQuestion,
        isComplete: collectionResult.data.isComplete,
        currentState: collectionResult.data.state,
      }
    }

    // Continue data collection
    const collectionResult = await dataCollectorAgent.collectData(
      sessionId,
      userInput,
      stateToUse as any
    )

    if (!collectionResult.success) {
      throw new Error('Data collection failed')
    }

    // Update session state
    memory.saveSession(sessionId, {
      ...(session || {}),
      state: collectionResult.data.state as Partial<ProjectPayload>,
    })

      if (collectionResult.data.isComplete) {
        // Step 3: Deduplicate goals before validation
        const deduplicatedState = { ...collectionResult.data.state }
        if (deduplicatedState.goals) {
          const seenDescriptions = new Set<string>()
          const seenIds = new Set<string>()
          deduplicatedState.goals = deduplicatedState.goals.filter((g: any) => {
            const descKey = g.description?.toLowerCase().trim() || ''
            if (seenDescriptions.has(descKey) || seenIds.has(g.id)) {
              return false
            }
            seenDescriptions.add(descKey)
            seenIds.add(g.id)
            return true
          })
        }
        
        // Step 3: Validation
        const projectPayload = this.buildProjectPayload(deduplicatedState)
        const validationResult = await validatorAgent.validate(projectPayload)

      if (!validationResult.success) {
        throw new Error('Validation failed')
      }

      if (validationResult.data.isValid) {
        // Save project
        const projectId = randomUUID()
        const finalProject: ProjectPayload = {
          ...projectPayload,
          metadata: {
            completedAt: new Date().toISOString(),
            confidence: validationResult.data.confidence,
          },
        }

        memory.saveProject(projectId, finalProject)
        memory.saveSession(sessionId, { projectId, state: finalProject })

        return {
          isComplete: true,
          projectId,
          currentState: finalProject,
          project: finalProject, // Include full project for client to use
        }
      } else {
        // Return validation errors
        return {
          isComplete: false,
          nextQuestion: `Please address these issues: ${validationResult.data.errors.map((e) => e.message).join(', ')}`,
          currentState: collectionResult.data.state as Partial<ProjectPayload>,
        }
      }
    }

    return {
      nextQuestion: collectionResult.data.nextQuestion,
      isComplete: false,
      currentState: collectionResult.data.state as Partial<ProjectPayload>, // Include updated state for client
    }
  },

  buildProjectPayload(state: {
    projectName?: string
    category?: string
    goals?: Array<{ id: string; description: string; priority: Priority }>
    owner?: { name: string; email?: string; role?: string }
    constraints?: string[]
  }): Partial<ProjectPayload> {
    return {
      projectName: state.projectName || 'Untitled Project',
      category: (state.category as ProjectCategory) || ProjectCategory.OTHER,
      goals: state.goals || [],
      owner: state.owner || { name: 'Unknown' },
      constraints: state.constraints,
    }
  },
}

