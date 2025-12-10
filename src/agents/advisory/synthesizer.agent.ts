import {
  AgentResponse,
  SynthesisInput,
  TacticalResult,
  RiskAssessmentResult,
} from '../../types/agents';
import {
  ProjectPayload,
  InsightReport,
  Recommendation,
  Risk,
  ActionItem,
  RecommendationCategory,
  Priority,
} from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

export const synthesizerAgent = {
  name: agentConfigs.synthesizer.name,
  config: agentConfigs.synthesizer,

  /**
   * Combines all perspectives into coherent advice
   */
  async synthesize(
    project: ProjectPayload,
    synthesisInput: SynthesisInput
  ): Promise<AgentResponse<InsightReport>> {
    const startTime = Date.now();

    try {
      logger.info('Synthesis started', { projectName: project.projectName });

      const recommendations = this.createRecommendations(project, synthesisInput);
      const risks = this.formatRisks(synthesisInput.risks);
      const actionPlan = this.createActionPlan(synthesisInput.tactical);
      const summary = this.createSummary(project, synthesisInput, recommendations);

      const reasoningPath = this.buildReasoningPath([
        synthesisInput.analysis,
        synthesisInput.strategy,
        synthesisInput.tactical,
        synthesisInput.risks,
      ]);

      const result: InsightReport = {
        summary,
        recommendations,
        risks,
        actionPlan,
        metadata: {
          agentsInvolved: ['analyzer', 'strategist', 'tactical', 'risk', 'synthesizer'],
          dataSourcesUsed: synthesisInput.externalData.map((d) => {
            const data = d as { source?: string };
            return data.source || 'unknown';
          }),
          processingTime: Date.now() - startTime,
          reasoningPath,
        },
      };

      metrics.timing('agent.synthesizer.duration', Date.now() - startTime);
      metrics.increment('agent.synthesizer.success');

      logger.info('Synthesis completed', { result });

      return {
        success: true,
        data: result,
        confidence: this.calculateConfidence(synthesisInput),
        reasoning: `Synthesized insights from ${reasoningPath.length} reasoning steps`,
      };
    } catch (error) {
      metrics.increment('agent.synthesizer.error');
      logger.error('Synthesis failed', { error });
      return {
        success: false,
        data: {
          summary: {
            headline: 'Failed to generate insights',
            confidence: 0,
            basedOn: [],
          },
          recommendations: [],
          risks: [],
          actionPlan: [],
          metadata: {
            agentsInvolved: [],
            dataSourcesUsed: [],
            processingTime: 0,
            reasoningPath: [],
          },
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  createRecommendations(project: ProjectPayload, input: SynthesisInput): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Convert strategies to recommendations
    input.strategy.strategies.forEach((strategy, index) => {
      recommendations.push({
        id: `rec-${index + 1}`,
        title: `Strategic Approach: ${strategy.substring(0, 50)}`,
        description: strategy,
        priority: index < 2 ? 1 : 2,
        category: index === 0 ? RecommendationCategory.QUICK_WIN : RecommendationCategory.STRATEGIC,
        confidence: input.strategy.confidence,
        reasoning: `Based on analysis of ${project.category} project characteristics`,
        supportingData: input.externalData.map((d) => {
          const data = d as { source?: string; data?: unknown; relevanceScore?: number };
          return {
            source: data.source || 'unknown',
            value: JSON.stringify(data.data).substring(0, 100),
            timestamp: new Date(),
            relevance: data.relevanceScore || 0.5,
          };
        }),
        alternatives: [],
      });
    });

    // Add tactical recommendations
    input.tactical.actions.slice(0, 3).forEach((action, index) => {
      recommendations.push({
        id: `rec-tactical-${index + 1}`,
        title: `Action: ${action.substring(0, 50)}`,
        description: action,
        priority: 2,
        category: RecommendationCategory.QUICK_WIN,
        confidence: input.tactical.confidence,
        reasoning: 'Immediate actionable step',
        supportingData: [],
        alternatives: [],
      });
    });

    return recommendations;
  },

  formatRisks(riskAssessment: RiskAssessmentResult): Risk[] {
    return riskAssessment.risks.map((risk, index) => ({
      id: `risk-${index + 1}`,
      title: risk.substring(0, 100),
      description: risk,
      severity: riskAssessment.severity[risk] || 'medium',
      probability: 0.5,
      mitigation: riskAssessment.mitigations[risk] || [],
      impact: this.assessImpact(risk, riskAssessment.severity[risk] || 'medium'),
    }));
  },

  assessImpact(_risk: string, severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const impactMap: Record<string, string> = {
      critical: 'Could derail project timeline and objectives',
      high: 'May significantly impact project success',
      medium: 'Could cause delays or require additional resources',
      low: 'Minor impact, manageable with proper planning',
    };
    return impactMap[severity] || impactMap.medium;
  },

  createActionPlan(tactical: TacticalResult): ActionItem[] {
    return tactical.actions.map((action, index) => ({
      id: `action-${index + 1}`,
      title: action.substring(0, 100),
      description: action,
      priority: index < 3 ? Priority.HIGH : Priority.MEDIUM,
      estimatedTime: tactical.estimates[action] || '1 week',
      dependencies: tactical.dependencies
        .filter((d) => d.includes(action))
        .map((d) => d.split(' ')[0]),
    }));
  },

  createSummary(
    project: ProjectPayload,
    input: SynthesisInput,
    _recommendations: Recommendation[]
  ): InsightReport['summary'] {
    const headline = `Strategic insights for ${project.projectName}`;
    const confidence = this.calculateConfidence(input);
    const basedOn = [
      `${input.analysis.patterns.length} patterns identified`,
      `${input.strategy.strategies.length} strategies recommended`,
      `${input.risks.risks.length} risks assessed`,
      `${input.externalData.length} data sources analyzed`,
    ];

    return {
      headline,
      confidence,
      basedOn,
    };
  },

  buildReasoningPath(agentOutputs: unknown[]): InsightReport['metadata']['reasoningPath'] {
    return agentOutputs.map((output, index) => ({
      agent: ['analyzer', 'strategist', 'tactical', 'risk'][index] || 'unknown',
      step: index + 1,
      input: {},
      output: output,
      reasoning: `Agent ${index + 1} analysis completed`,
      timestamp: new Date(),
    }));
  },

  calculateConfidence(input: SynthesisInput): number {
    const confidences = [
      input.analysis.confidence,
      input.strategy.confidence,
      input.tactical.confidence,
      input.risks.confidence,
    ];
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  },
};
