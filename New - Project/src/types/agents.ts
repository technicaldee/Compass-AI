// Type definitions for agents

export interface AgentConfig {
  name: string;
  description: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AgentResponse<T = unknown> {
  success: boolean;
  data: T;
  confidence: number;
  reasoning?: string;
  error?: string;
}

export interface TemplateMatchResult {
  templateId: string;
  confidence: number;
  reasoning: string;
  suggestedFields: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  suggestions: string[];
  confidence: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AnalysisResult {
  patterns: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  confidence: number;
}

export interface StrategyResult {
  strategies: string[];
  priorities: string[];
  timeline: string;
  resources: string[];
  confidence: number;
}

export interface TacticalResult {
  actions: string[];
  sequence: string[];
  dependencies: string[];
  estimates: Record<string, string>;
  confidence: number;
}

export interface RiskAssessmentResult {
  risks: string[];
  mitigations: Record<string, string[]>;
  severity: Record<string, 'low' | 'medium' | 'high' | 'critical'>;
  confidence: number;
}

export interface SynthesisInput {
  analysis: AnalysisResult;
  strategy: StrategyResult;
  tactical: TacticalResult;
  risks: RiskAssessmentResult;
  externalData: unknown[];
}
