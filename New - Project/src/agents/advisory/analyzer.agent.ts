import { AgentResponse, AnalysisResult } from '../../types/agents';
import { ProjectPayload } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

export const analyzerAgent = {
  name: agentConfigs.analyzer.name,
  config: agentConfigs.analyzer,

  /**
   * Deep-dives into project data and identifies patterns
   */
  async analyze(project: ProjectPayload): Promise<AgentResponse<AnalysisResult>> {
    const startTime = Date.now();

    try {
      logger.info('Analysis started', { projectName: project.projectName });

      // Analyze project structure
      const patterns = this.identifyPatterns(project);
      const strengths = this.identifyStrengths(project);
      const weaknesses = this.identifyWeaknesses(project);
      const opportunities = this.identifyOpportunities(project);
      const threats = this.identifyThreats(project);

      const confidence = this.calculateConfidence(project);

      const result: AnalysisResult = {
        patterns,
        strengths,
        weaknesses,
        opportunities,
        threats,
        confidence,
      };

      metrics.timing('agent.analyzer.duration', Date.now() - startTime);
      metrics.increment('agent.analyzer.success');

      logger.info('Analysis completed', { result });

      return {
        success: true,
        data: result,
        confidence,
        reasoning: `Identified ${patterns.length} patterns, ${strengths.length} strengths, and ${opportunities.length} opportunities`,
      };
    } catch (error) {
      metrics.increment('agent.analyzer.error');
      logger.error('Analysis failed', { error });
      return {
        success: false,
        data: {
          patterns: [],
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: [],
          confidence: 0,
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  identifyPatterns(project: ProjectPayload): string[] {
    const patterns: string[] = [];

    // Goal patterns
    if (project.goals.length >= 3) {
      patterns.push('Multiple well-defined goals suggest comprehensive planning');
    }

    if (project.goals.every((g) => g.measurable)) {
      patterns.push('All goals are measurable, indicating strong planning discipline');
    }

    // Category patterns
    if (
      project.category === 'tech' &&
      project.goals.some((g) => g.description.toLowerCase().includes('api'))
    ) {
      patterns.push('Tech project with API focus suggests integration-heavy architecture');
    }

    // Timeline patterns
    if (project.timeline && project.timeline.endDate) {
      const duration = project.timeline.endDate.getTime() - project.timeline.startDate.getTime();
      const days = duration / (1000 * 60 * 60 * 24);
      if (days < 30) {
        patterns.push('Short timeline suggests agile, iterative approach');
      } else if (days > 180) {
        patterns.push('Extended timeline allows for comprehensive planning and execution');
      }
    }

    return patterns;
  },

  identifyStrengths(project: ProjectPayload): string[] {
    const strengths: string[] = [];

    if (project.goals.length >= 3) {
      strengths.push('Clear and multiple goals provide direction');
    }

    if (project.owner && project.owner.name) {
      strengths.push('Designated project owner ensures accountability');
    }

    if (project.constraints && project.constraints.length > 0) {
      strengths.push('Well-defined constraints help manage scope');
    }

    if (project.timeline) {
      strengths.push('Timeline provides structure and deadlines');
    }

    if (project.goals.some((g) => g.priority === 'high')) {
      strengths.push('Priority-based goal structure enables focus');
    }

    return strengths;
  },

  identifyWeaknesses(project: ProjectPayload): string[] {
    const weaknesses: string[] = [];

    if (project.goals.length < 2) {
      weaknesses.push('Limited number of goals may indicate incomplete planning');
    }

    if (!project.goals.some((g) => g.measurable)) {
      weaknesses.push('Lack of measurable goals makes progress tracking difficult');
    }

    if (!project.timeline) {
      weaknesses.push('Missing timeline makes scheduling and planning challenging');
    }

    if (!project.constraints || project.constraints.length === 0) {
      weaknesses.push('No defined constraints may lead to scope creep');
    }

    if (project.goals.every((g) => g.priority === 'medium' || !g.priority)) {
      weaknesses.push(
        'Lack of priority differentiation may lead to inefficient resource allocation'
      );
    }

    return weaknesses;
  },

  identifyOpportunities(project: ProjectPayload): string[] {
    const opportunities: string[] = [];

    if (project.category === 'tech') {
      opportunities.push('Leverage modern development tools and frameworks');
      opportunities.push('Consider open-source solutions to accelerate development');
    }

    if (project.category === 'business') {
      opportunities.push('Explore partnerships and collaborations');
      opportunities.push('Consider market research and competitive analysis');
    }

    if (project.category === 'community') {
      opportunities.push('Engage with local community organizations');
      opportunities.push('Leverage social media for outreach');
    }

    if (project.goals.length > 3) {
      opportunities.push('Multiple goals allow for phased implementation');
    }

    return opportunities;
  },

  identifyThreats(project: ProjectPayload): string[] {
    const threats: string[] = [];

    if (!project.timeline) {
      threats.push('Unclear timeline may lead to delays and missed deadlines');
    }

    if (project.constraints && project.constraints.some((c) => c.impact === 'high')) {
      threats.push('High-impact constraints may significantly limit project scope');
    }

    if (project.goals.length > 5) {
      threats.push('Too many goals may lead to resource dilution');
    }

    if (
      project.category === 'tech' &&
      !project.goals.some((g) => g.description.toLowerCase().includes('security'))
    ) {
      threats.push('Security considerations may be overlooked');
    }

    return threats;
  },

  calculateConfidence(project: ProjectPayload): number {
    let score = 0;

    // Completeness score
    if (project.projectName) score += 0.2;
    if (project.category) score += 0.2;
    if (project.goals && project.goals.length > 0) score += 0.2;
    if (project.owner) score += 0.2;
    if (project.timeline) score += 0.1;
    if (project.constraints && project.constraints.length > 0) score += 0.1;

    return Math.min(score, 1);
  },
};
