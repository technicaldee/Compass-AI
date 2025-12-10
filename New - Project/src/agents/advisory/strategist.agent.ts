import { AgentResponse, StrategyResult, AnalysisResult } from '../../types/agents';
import { ProjectPayload } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

export const strategistAgent = {
  name: agentConfigs.strategist.name,
  config: agentConfigs.strategist,

  /**
   * Generates high-level strategic recommendations
   */
  async generateStrategy(
    project: ProjectPayload,
    analysis: AnalysisResult
  ): Promise<AgentResponse<StrategyResult>> {
    const startTime = Date.now();

    try {
      logger.info('Strategy generation started', { projectName: project.projectName });

      const strategies = this.generateStrategies(project, analysis);
      const priorities = this.determinePriorities(project, analysis);
      const timeline = this.suggestTimeline(project);
      const resources = this.identifyResources(project, analysis);

      const confidence = this.calculateConfidence(project, analysis);

      const result: StrategyResult = {
        strategies,
        priorities,
        timeline,
        resources,
        confidence,
      };

      metrics.timing('agent.strategist.duration', Date.now() - startTime);
      metrics.increment('agent.strategist.success');

      logger.info('Strategy generation completed', { result });

      return {
        success: true,
        data: result,
        confidence,
        reasoning: `Generated ${strategies.length} strategic recommendations with ${priorities.length} priority areas`,
      };
    } catch (error) {
      metrics.increment('agent.strategist.error');
      logger.error('Strategy generation failed', { error });
      return {
        success: false,
        data: {
          strategies: [],
          priorities: [],
          timeline: '',
          resources: [],
          confidence: 0,
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  generateStrategies(project: ProjectPayload, analysis: AnalysisResult): string[] {
    const strategies: string[] = [];

    // Leverage strengths
    if (analysis.strengths.length > 0) {
      strategies.push(`Build on identified strengths: ${analysis.strengths[0]}`);
    }

    // Address weaknesses
    if (analysis.weaknesses.length > 0) {
      strategies.push(`Address critical weakness: ${analysis.weaknesses[0]}`);
    }

    // Exploit opportunities
    if (analysis.opportunities.length > 0) {
      strategies.push(`Pursue opportunity: ${analysis.opportunities[0]}`);
    }

    // Mitigate threats
    if (analysis.threats.length > 0) {
      strategies.push(`Mitigate threat: ${analysis.threats[0]}`);
    }

    // Category-specific strategies
    if (project.category === 'tech') {
      strategies.push('Adopt agile development methodology');
      strategies.push('Implement continuous integration and deployment');
    }

    if (project.category === 'business') {
      strategies.push('Develop comprehensive business plan');
      strategies.push('Conduct market research and validation');
    }

    return strategies;
  },

  determinePriorities(project: ProjectPayload, analysis: AnalysisResult): string[] {
    const priorities: string[] = [];

    // High-priority goals
    const highPriorityGoals = project.goals.filter((g) => g.priority === 'high');
    if (highPriorityGoals.length > 0) {
      priorities.push(`Focus on high-priority goals: ${highPriorityGoals.length} identified`);
    }

    // Address critical weaknesses
    const criticalWeaknesses = analysis.weaknesses.filter(
      (w) => w.toLowerCase().includes('critical') || w.toLowerCase().includes('missing')
    );
    if (criticalWeaknesses.length > 0) {
      priorities.push(`Address critical gaps: ${criticalWeaknesses[0]}`);
    }

    // Quick wins
    if (analysis.opportunities.length > 0) {
      priorities.push(`Pursue quick wins: ${analysis.opportunities[0]}`);
    }

    return priorities;
  },

  suggestTimeline(project: ProjectPayload): string {
    if (project.timeline && project.timeline.endDate) {
      const duration = project.timeline.endDate.getTime() - project.timeline.startDate.getTime();
      const days = duration / (1000 * 60 * 60 * 24);

      if (days < 30) {
        return 'Sprint-based approach with weekly milestones';
      } else if (days < 90) {
        return 'Phased approach with monthly milestones';
      } else {
        return 'Quarterly milestones with regular reviews';
      }
    }

    return 'Establish clear timeline with defined milestones';
  },

  identifyResources(project: ProjectPayload, analysis: AnalysisResult): string[] {
    const resources: string[] = [];

    if (project.category === 'tech') {
      resources.push('Development team and technical expertise');
      resources.push('Development tools and infrastructure');
    }

    if (project.category === 'business') {
      resources.push('Business advisors and mentors');
      resources.push('Market research and analysis tools');
    }

    if (project.category === 'community') {
      resources.push('Community volunteers and organizers');
      resources.push('Venue and logistics support');
    }

    if (analysis.weaknesses.some((w) => w.includes('timeline'))) {
      resources.push('Project management tools and expertise');
    }

    return resources;
  },

  calculateConfidence(project: ProjectPayload, analysis: AnalysisResult): number {
    // Base confidence on analysis confidence and project completeness
    return (analysis.confidence + this.projectCompleteness(project)) / 2;
  },

  projectCompleteness(project: ProjectPayload): number {
    let score = 0;
    if (project.projectName) score += 0.2;
    if (project.category) score += 0.2;
    if (project.goals && project.goals.length > 0) score += 0.2;
    if (project.owner) score += 0.2;
    if (project.timeline) score += 0.1;
    if (project.constraints && project.constraints.length > 0) score += 0.1;
    return score;
  },
};
