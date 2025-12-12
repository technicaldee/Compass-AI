import { advisoryAgent } from '../agents/advisory'
import { fetchExternalData } from '../tools'
import { memory } from '../memory'
import { InsightReport, ProjectPayload } from '../types'

export const advisoryFlow = {
  name: 'advisory',

  async generateInsights(projectId: string, projectData?: ProjectPayload): Promise<InsightReport> {
    const startTime = Date.now()

    // Retrieve project - try memory first, then use provided data, then check session
    let project = memory.getProject(projectId)
    
    if (!project && projectData) {
      project = projectData
      // Save it for future use
      memory.saveProject(projectId, project)
    }
    
    // If still not found, search sessions for one with this projectId
    if (!project) {
      const session = memory.findSessionByProjectId(projectId)
      if (session?.state) {
        // Convert partial state to full ProjectPayload if it has required fields
        const state = session.state
        if (state.projectName && state.category && state.goals && state.owner) {
          project = state as ProjectPayload
          memory.saveProject(projectId, project)
        }
      }
    }
    
    if (!project) {
      throw new Error(`Project ${projectId} not found. Please provide project data in the request body: { "projectData": { "projectName": "...", "category": "...", "goals": [...], "owner": {...} } }`)
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

