import { ProjectPayload, InsightReport } from './types'
import { promises as fs } from 'fs'
import path from 'path'

// File-based persistence for projects (survives server restarts)
const STORAGE_DIR = path.join(process.cwd(), '.data')
const PROJECTS_FILE = path.join(STORAGE_DIR, 'projects.json')
const SESSIONS_FILE = path.join(STORAGE_DIR, 'sessions.json')

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist, ignore
  }
}

// Load projects from disk
async function loadProjects(): Promise<Map<string, ProjectPayload>> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return new Map(Object.entries(parsed))
  } catch (error) {
    // File doesn't exist yet, return empty map
    return new Map()
  }
}

// Save projects to disk
async function saveProjects(projects: Map<string, ProjectPayload>) {
  try {
    await ensureStorageDir()
    const data = Object.fromEntries(projects)
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save projects to disk:', error)
    // Don't throw - in-memory storage still works
  }
}

// Load sessions from disk
async function loadSessions(): Promise<Map<string, { projectId?: string; state: Partial<ProjectPayload> }>> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return new Map(Object.entries(parsed))
  } catch (error) {
    // File doesn't exist yet, return empty map
    return new Map()
  }
}

// Save sessions to disk
async function saveSessions(sessions: Map<string, { projectId?: string; state: Partial<ProjectPayload> }>) {
  try {
    await ensureStorageDir()
    const data = Object.fromEntries(sessions)
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save sessions to disk:', error)
    // Don't throw - in-memory storage still works
  }
}

// Initialize storage - load from disk
let projects: Map<string, ProjectPayload>
let sessions: Map<string, { projectId?: string; state: Partial<ProjectPayload> }>

// Initialize asynchronously
const initPromise = (async () => {
  projects = await loadProjects()
  sessions = await loadSessions()
  console.log(`Loaded ${projects.size} projects and ${sessions.size} sessions from disk`)
})()

// In-memory storage (also persisted to disk)
const insights = new Map<string, InsightReport>()

export const memory = {
  // Initialize - call this before using memory (or wait for initPromise)
  async initialize(): Promise<void> {
    await initPromise
  },

  // Project storage
  async saveProject(projectId: string, project: ProjectPayload): Promise<void> {
    await initPromise
    projects.set(projectId, project)
    await saveProjects(projects)
  },

  async getProject(projectId: string): Promise<ProjectPayload | undefined> {
    await initPromise
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
  async saveSession(sessionId: string, data: { projectId?: string; state: Partial<ProjectPayload> }): Promise<void> {
    await initPromise
    sessions.set(sessionId, data)
    await saveSessions(sessions)
  },

  async getSession(sessionId: string): Promise<{ projectId?: string; state: Partial<ProjectPayload> } | undefined> {
    await initPromise
    return sessions.get(sessionId)
  },

  // Cleanup (optional)
  async clearSession(sessionId: string): Promise<void> {
    await initPromise
    sessions.delete(sessionId)
    await saveSessions(sessions)
  },

  // Find session by projectId
  async findSessionByProjectId(projectId: string): Promise<{ projectId?: string; state: Partial<ProjectPayload> } | undefined> {
    await initPromise
    for (const [sessionId, session] of sessions.entries()) {
      if (session.projectId === projectId) {
        return session
      }
    }
    return undefined
  },

  // Get all sessions (for debugging/searching)
  async getAllSessions(): Promise<Array<{ sessionId: string; projectId?: string; state: Partial<ProjectPayload> }>> {
    await initPromise
    return Array.from(sessions.entries()).map(([sessionId, data]) => ({
      sessionId,
      ...data,
    }))
  },

  // Find project by searching all sessions - more comprehensive search
  async findProjectInSessions(projectId: string): Promise<ProjectPayload | undefined> {
    await initPromise
    // First, check if any session has this projectId and complete state
    for (const [sessionId, session] of sessions.entries()) {
      if (session.projectId === projectId && session.state) {
        const state = session.state
        // Check if state has all required fields
        if (state.projectName && state.category && state.goals && state.owner) {
          return {
            projectName: state.projectName,
            category: state.category as any,
            goals: state.goals as any,
            owner: state.owner as any,
            constraints: state.constraints,
            timeline: state.timeline,
            metadata: {
              completedAt: new Date().toISOString(),
              confidence: 0.8,
            },
          } as ProjectPayload
        }
      }
    }
    return undefined
  },

  // Get all projects (for searching)
  async getAllProjects(): Promise<Array<{ projectId: string; project: ProjectPayload }>> {
    await initPromise
    return Array.from(projects.entries()).map(([projectId, project]) => ({
      projectId,
      project,
    }))
  },
}

