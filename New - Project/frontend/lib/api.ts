import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface OnboardResponse {
  success: boolean
  data: {
    sessionId: string
    templateId: string
    nextQuestion?: string
  }
}

export interface ContinueOnboardResponse {
  success: boolean
  data: {
    nextQuestion?: string
    isComplete: boolean
    projectId?: string
  }
}

export interface InsightReport {
  summary: {
    headline: string
    confidence: number
    basedOn: string[]
  }
  recommendations: Recommendation[]
  risks: Risk[]
  actionPlan: ActionItem[]
  metadata: {
    agentsInvolved: string[]
    dataSourcesUsed: string[]
    processingTime: number
    reasoningPath: ReasoningStep[]
  }
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: number
  category: 'quick-win' | 'strategic' | 'long-term'
  confidence: number
  reasoning: string
  supportingData: DataPoint[]
  alternatives: Alternative[]
}

export interface Risk {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  mitigation: string[]
  impact: string
}

export interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
  dependencies: string[]
  assignee?: string
}

export interface ReasoningStep {
  agent: string
  step: number
  input: unknown
  output: unknown
  reasoning: string
  timestamp: string
}

export interface DataPoint {
  source: string
  value: string | number
  timestamp: string
  relevance: number
}

export interface Alternative {
  title: string
  description: string
  pros: string[]
  cons: string[]
}

export const apiClient = {
  onboard: async (userInput: string, category?: string): Promise<OnboardResponse> => {
    const response = await api.post('/onboard', { userInput, category })
    return response.data
  },

  continueOnboard: async (sessionId: string, userInput: string): Promise<ContinueOnboardResponse> => {
    const response = await api.post(`/onboard/${sessionId}`, { userInput })
    return response.data
  },

  generateInsights: async (projectId: string): Promise<{ success: boolean; data: InsightReport }> => {
    const response = await api.post(`/advice/${projectId}`)
    return response.data
  },

  getInsights: async (projectId: string): Promise<{ success: boolean; data: InsightReport }> => {
    const response = await api.get(`/advice/${projectId}`)
    return response.data
  },

  getProject: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
  },
}

