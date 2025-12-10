import { z } from 'zod';

// Enums
export enum ProjectCategory {
  TECH = 'tech',
  BUSINESS = 'business',
  COMMUNITY = 'community',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  CREATIVE = 'creative',
  OTHER = 'other',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RecommendationCategory {
  QUICK_WIN = 'quick-win',
  STRATEGIC = 'strategic',
  LONG_TERM = 'long-term',
}

// Zod Schemas
export const GoalSchema = z.object({
  id: z.string(),
  description: z.string().min(10),
  priority: z.nativeEnum(Priority),
  measurable: z.boolean(),
  deadline: z.date().optional(),
});

export const OwnerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  role: z.string().optional(),
});

export const ConstraintSchema = z.object({
  type: z.string(),
  description: z.string(),
  impact: z.nativeEnum(Priority),
});

export const TimelineSchema = z.object({
  startDate: z.date(),
  endDate: z.date().optional(),
  milestones: z.array(z.string()).optional(),
});

export const ProjectPayloadSchema = z.object({
  projectName: z.string().min(1),
  category: z.nativeEnum(ProjectCategory),
  goals: z.array(GoalSchema).min(1),
  owner: OwnerSchema,
  constraints: z.array(ConstraintSchema).optional(),
  timeline: TimelineSchema.optional(),
  metadata: z.object({
    templateVersion: z.string(),
    completedAt: z.date(),
    confidence: z.number().min(0).max(1),
  }),
});

// TypeScript Types
export type Goal = z.infer<typeof GoalSchema>;
export type Owner = z.infer<typeof OwnerSchema>;
export type Constraint = z.infer<typeof ConstraintSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type ProjectPayload = z.infer<typeof ProjectPayloadSchema>;

export interface DataPoint {
  source: string;
  value: string | number;
  timestamp: Date;
  relevance: number;
}

export interface Alternative {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: RecommendationCategory;
  confidence: number;
  reasoning: string;
  supportingData: DataPoint[];
  alternatives: Alternative[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  mitigation: string[];
  impact: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedTime: string;
  dependencies: string[];
  assignee?: string;
}

export interface ReasoningStep {
  agent: string;
  step: number;
  input: unknown;
  output: unknown;
  reasoning: string;
  timestamp: Date;
}

export interface InsightReport {
  summary: {
    headline: string;
    confidence: number;
    basedOn: string[];
  };
  recommendations: Recommendation[];
  risks: Risk[];
  actionPlan: ActionItem[];
  metadata: {
    agentsInvolved: string[];
    dataSourcesUsed: string[];
    processingTime: number;
    reasoningPath: ReasoningStep[];
  };
}

export interface ProjectContext {
  project: ProjectPayload;
  sessionId: string;
  userId?: string;
}

export interface EnrichedData {
  source: string;
  data: unknown;
  relevanceScore: number;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
