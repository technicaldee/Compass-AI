// Types and schemas for the Insight Assistant

export enum ProjectCategory {
  TECH = 'tech',
  BUSINESS = 'business',
  COMMUNITY = 'community',
  CREATIVE = 'creative',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  OTHER = 'other',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface ProjectTemplate {
  id: string
  name: string
  category: ProjectCategory[]
  description: string
  fields: {
    projectName: string
    category: string
    goals: string[]
    owner: string
    [key: string]: unknown
  }
}

export interface ProjectPayload {
  projectName: string
  category: ProjectCategory
  goals: Array<{
    id: string
    description: string
    priority: Priority
  }>
  owner: {
    name: string
    email?: string
    role?: string
  }
  constraints?: string[]
  timeline?: {
    startDate?: string
    endDate?: string
  }
  metadata?: {
    templateId?: string
    completedAt?: string
    confidence?: number
  }
}

export interface Suggestion {
  suggestion: string
  reason: string
  source: string
}

export interface InsightReport {
  summary: {
    headline: string
    confidence: number
    basedOn: string[]
  }
  suggestions: Suggestion[]
  metadata: {
    agentsInvolved: string[]
    dataSourcesUsed: string[]
    processingTime: number
  }
}

export interface AgentResponse<T = unknown> {
  success: boolean
  data: T
  confidence?: number
  reasoning?: string
  error?: string
}

export interface TemplateMatchResult {
  templateId: string
  confidence: number
  reasoning: string
  suggestedFields: string[]
}

export interface ExternalData {
  source: string
  data: unknown
  timestamp: string
  relevance: number
}

