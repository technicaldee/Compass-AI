import { advisoryAgent } from '../agents/advisory'
import { fetchExternalData } from '../tools'
import { memory } from '../memory'
import { InsightReport, ProjectPayload } from '../types'

export const advisoryFlow = {
  name: 'advisory',

  async generateInsights(projectId: string, projectData?: ProjectPayload): Promise<InsightReport> {
    const startTime = Date.now()

    // Retrieve project - try multiple sources in order of reliability
    let project = await memory.getProject(projectId)
    
    // If not in projects map, try provided data
    if (!project && projectData) {
      project = projectData
      // Save it for future use
      await memory.saveProject(projectId, project)
    }
    
    // If still not found, use the improved session search method
    if (!project) {
      project = await memory.findProjectInSessions(projectId)
      if (project) {
        // Save it for future use
        await memory.saveProject(projectId, project)
      }
    }
    
    // Last resort: search all sessions for any complete project data
    // This handles cases where projectId might have been lost but data exists
    if (!project) {
      const allSessions = await memory.getAllSessions()
      for (const session of allSessions) {
        if (session.state && session.state.projectName && session.state.category && session.state.goals && session.state.owner) {
          // Only use if it looks like a complete project
          const state = session.state
          project = {
            projectName: state.projectName,
            category: state.category as any,
            goals: state.goals as any,
            owner: state.owner as any,
            constraints: state.constraints,
            timeline: state.timeline,
            metadata: {
              completedAt: new Date().toISOString(),
              confidence: 0.7,
            },
          } as ProjectPayload
          // Save with the requested projectId for future lookups
          await memory.saveProject(projectId, project)
          // Also update the session to link it properly
          if (session.sessionId) {
            await memory.saveSession(session.sessionId, { projectId, state: project })
          }
          break
        }
      }
    }
    
    // If still not found, this is a legitimate 404 - project doesn't exist
    // We'll let the route handler return proper 404 instead of throwing
    if (!project) {
      const error: any = new Error(`Project ${projectId} not found`)
      error.statusCode = 404
      error.code = 'PROJECT_NOT_FOUND'
      throw error
    }

    // Fetch external data
    const externalData = await fetchExternalData(project)

    // Generate suggestions using advisory agent
    const advisoryResult = await advisoryAgent.generateSuggestions(project, externalData)

    if (!advisoryResult.success) {
      throw new Error('Advisory generation failed')
    }

    // Build insight report
    const insightReport: InsightReport = {
      summary: {
        headline: advisoryResult.data.summary.split('.')[0] || 'Project insights generated',
        confidence: advisoryResult.confidence || 0.8,
        basedOn: [
          'project data',
          ...externalData.map((d) => d.source),
        ],
      },
      suggestions: advisoryResult.data.suggestions,
      metadata: {
        agentsInvolved: ['advisory-agent'],
        dataSourcesUsed: externalData.map((d) => d.source),
        processingTime: Date.now() - startTime,
      },
    }

    // Save insight report
    memory.saveInsight(projectId, insightReport)

    return insightReport
  },
}

