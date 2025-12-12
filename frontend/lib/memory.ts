import { ProjectPayload, InsightReport } from './types'

// In-memory storage (in production, use a database)
const projects = new Map<string, ProjectPayload>()
const insights = new Map<string, InsightReport>()
const sessions = new Map<string, { projectId?: string; state: Partial<ProjectPayload> }>()

export const memory = {
  // Project storage
  saveProject(projectId: string, project: ProjectPayload): void {
    projects.set(projectId, project)
  },

  getProject(projectId: string): ProjectPayload | undefined {
    return projects.get(projectId)
  },

  // Insight storage
  saveInsight(projectId: string, insight: InsightReport): void {
    insights.set(projectId, insight)
  },

  getInsight(projectId: string): InsightReport | undefined {
    return insights.get(projectId)
  },

  // Session storage
  saveSession(sessionId: string, data: { projectId?: string; state: Partial<ProjectPayload> }): void {
    sessions.set(sessionId, data)
  },

  getSession(sessionId: string): { projectId?: string; state: Partial<ProjectPayload> } | undefined {
    return sessions.get(sessionId)
  },

  // Cleanup (optional)
  clearSession(sessionId: string): void {
    sessions.delete(sessionId)
  },

  // Find session by projectId
  findSessionByProjectId(projectId: string): { projectId?: string; state: Partial<ProjectPayload> } | undefined {
    for (const [sessionId, session] of sessions.entries()) {
      if (session.projectId === projectId) {
        return session
      }
    }
    return undefined
  },
}

