import { AgentResponse, RiskAssessmentResult, AnalysisResult } from '../../types/agents';
import { ProjectPayload } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

export const riskAgent = {
  name: agentConfigs.risk.name,
  config: agentConfigs.risk,

  /**
   * Identifies potential pitfalls and mitigation strategies
   */
  async assessRisks(
    project: ProjectPayload,
    analysis: AnalysisResult
  ): Promise<AgentResponse<RiskAssessmentResult>> {
    const startTime = Date.now();

    try {
      logger.info('Risk assessment started', { projectName: project.projectName });

      const risks = this.identifyRisks(project, analysis);
      const mitigations = this.generateMitigations(risks);
      const severity = this.assessSeverity(risks, project);

      const confidence = this.calculateConfidence(project, analysis);

      const result: RiskAssessmentResult = {
        risks,
        mitigations,
        severity,
        confidence,
      };

      metrics.timing('agent.risk.duration', Date.now() - startTime);
      metrics.increment('agent.risk.success');

      logger.info('Risk assessment completed', { result });

      return {
        success: true,
        data: result,
        confidence,
        reasoning: `Identified ${risks.length} risks with ${Object.keys(mitigations).length} mitigation strategies`,
      };
    } catch (error) {
      metrics.increment('agent.risk.error');
      logger.error('Risk assessment failed', { error });
      return {
        success: false,
        data: {
          risks: [],
          mitigations: {},
          severity: {},
          confidence: 0,
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  identifyRisks(project: ProjectPayload, analysis: AnalysisResult): string[] {
    const risks: string[] = [];

    // Convert threats to risks
    risks.push(...analysis.threats);

    // Timeline risks
    if (!project.timeline) {
      risks.push('Unclear timeline may lead to scope creep and delays');
    } else if (project.timeline.endDate) {
      const duration = project.timeline.endDate.getTime() - project.timeline.startDate.getTime();
      const days = duration / (1000 * 60 * 60 * 24);
      if (days < 30 && project.goals.length > 3) {
        risks.push('Aggressive timeline with multiple goals may be unrealistic');
      }
    }

    // Resource risks
    if (!project.owner) {
      risks.push('Lack of clear ownership may lead to accountability issues');
    }

    // Scope risks
    if (project.goals.length > 5) {
      risks.push('Too many goals may lead to resource dilution');
    }

    if (!project.constraints || project.constraints.length === 0) {
      risks.push('Lack of constraints may lead to scope creep');
    }

    // Category-specific risks
    if (project.category === 'tech') {
      risks.push('Technical complexity may lead to delays');
      risks.push('Dependency on external APIs or services');
    }

    if (project.category === 'business') {
      risks.push('Market conditions may change');
      risks.push('Competition may intensify');
    }

    return risks;
  },

  generateMitigations(risks: string[]): Record<string, string[]> {
    const mitigations: Record<string, string[]> = {};

    risks.forEach((risk) => {
      const mitigationsForRisk: string[] = [];

      if (risk.includes('timeline')) {
        mitigationsForRisk.push('Establish clear milestones and checkpoints');
        mitigationsForRisk.push('Build buffer time into schedule');
        mitigationsForRisk.push('Regular progress reviews');
      }

      if (risk.includes('scope')) {
        mitigationsForRisk.push('Define clear project boundaries');
        mitigationsForRisk.push('Implement change control process');
        mitigationsForRisk.push('Regular stakeholder alignment');
      }

      if (risk.includes('resource') || risk.includes('ownership')) {
        mitigationsForRisk.push('Assign clear roles and responsibilities');
        mitigationsForRisk.push('Establish communication protocols');
        mitigationsForRisk.push('Regular status updates');
      }

      if (risk.includes('technical') || risk.includes('complexity')) {
        mitigationsForRisk.push('Proof of concept for complex features');
        mitigationsForRisk.push('Technical architecture review');
        mitigationsForRisk.push('Regular code reviews');
      }

      if (risk.includes('market') || risk.includes('competition')) {
        mitigationsForRisk.push('Regular market research');
        mitigationsForRisk.push('Competitive analysis');
        mitigationsForRisk.push('Flexible strategy adaptation');
      }

      if (mitigationsForRisk.length === 0) {
        mitigationsForRisk.push('Regular monitoring and review');
        mitigationsForRisk.push('Contingency planning');
      }

      mitigations[risk] = mitigationsForRisk;
    });

    return mitigations;
  },

  assessSeverity(
    risks: string[],
    project: ProjectPayload
  ): Record<string, 'low' | 'medium' | 'high' | 'critical'> {
    const severity: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {};

    risks.forEach((risk) => {
      if (
        risk.includes('critical') ||
        risk.includes('unclear timeline') ||
        risk.includes('lack of')
      ) {
        severity[risk] = 'high';
      } else if (risk.includes('may lead') || risk.includes('complexity')) {
        severity[risk] = 'medium';
      } else {
        severity[risk] = 'low';
      }

      // Adjust based on project characteristics
      if (risk.includes('timeline') && !project.timeline) {
        severity[risk] = 'critical';
      }

      if (risk.includes('ownership') && !project.owner) {
        severity[risk] = 'high';
      }
    });

    return severity;
  },

  calculateConfidence(_project: ProjectPayload, analysis: AnalysisResult): number {
    // Higher confidence with more complete project data
    return analysis.confidence;
  },
};
