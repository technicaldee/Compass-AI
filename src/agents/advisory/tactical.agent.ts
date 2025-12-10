import { AgentResponse, TacticalResult, StrategyResult } from '../../types/agents';
import { ProjectPayload } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

export const tacticalAgent = {
  name: agentConfigs.tactical.name,
  config: agentConfigs.tactical,

  /**
   * Breaks strategies into actionable steps
   */
  async createActionPlan(
    project: ProjectPayload,
    strategy: StrategyResult
  ): Promise<AgentResponse<TacticalResult>> {
    const startTime = Date.now();

    try {
      logger.info('Tactical planning started', { projectName: project.projectName });

      const actions = this.generateActions(project, strategy);
      const sequence = this.determineSequence(actions);
      const dependencies = this.identifyDependencies(actions);
      const estimates = this.estimateTime(actions, project);

      const confidence = this.calculateConfidence(project, strategy);

      const result: TacticalResult = {
        actions,
        sequence,
        dependencies,
        estimates,
        confidence,
      };

      metrics.timing('agent.tactical.duration', Date.now() - startTime);
      metrics.increment('agent.tactical.success');

      logger.info('Tactical planning completed', { result });

      return {
        success: true,
        data: result,
        confidence,
        reasoning: `Created ${actions.length} actionable steps with ${dependencies.length} dependencies`,
      };
    } catch (error) {
      metrics.increment('agent.tactical.error');
      logger.error('Tactical planning failed', { error });
      return {
        success: false,
        data: {
          actions: [],
          sequence: [],
          dependencies: [],
          estimates: {},
          confidence: 0,
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  generateActions(project: ProjectPayload, strategy: StrategyResult): string[] {
    const actions: string[] = [];

    // Initial setup actions
    actions.push('Define project scope and objectives');
    actions.push('Set up project management tools and tracking');
    actions.push('Assemble project team and assign roles');

    // Strategy-based actions
    strategy.strategies.forEach((strategyText) => {
      if (strategyText.includes('agile')) {
        actions.push('Set up sprint planning and backlog');
        actions.push('Establish daily standup meetings');
      }
      if (strategyText.includes('market research')) {
        actions.push('Conduct competitor analysis');
        actions.push('Survey target audience');
      }
    });

    // Goal-based actions
    project.goals.forEach((goal, index) => {
      actions.push(`Work on goal ${index + 1}: ${goal.description.substring(0, 50)}...`);
    });

    // Priority-based actions
    const highPriorityGoals = project.goals.filter((g) => g.priority === 'high');
    if (highPriorityGoals.length > 0) {
      actions.push('Focus on high-priority goals first');
    }

    return actions;
  },

  determineSequence(actions: string[]): string[] {
    // Simple sequencing: setup first, then execution
    const setupActions = actions.filter(
      (a) =>
        a.toLowerCase().includes('set up') ||
        a.toLowerCase().includes('define') ||
        a.toLowerCase().includes('assemble')
    );
    const executionActions = actions.filter((a) => !setupActions.includes(a));

    return [...setupActions, ...executionActions];
  },

  identifyDependencies(actions: string[]): string[] {
    const dependencies: string[] = [];

    // Identify logical dependencies
    const setupAction = actions.find((a) => a.includes('Set up project management'));
    const teamAction = actions.find((a) => a.includes('Assemble project team'));

    if (setupAction && teamAction) {
      dependencies.push(`${teamAction} should happen before ${setupAction}`);
    }

    const scopeAction = actions.find((a) => a.includes('Define project scope'));
    const goalActions = actions.filter((a) => a.includes('Work on goal'));

    if (scopeAction && goalActions.length > 0) {
      dependencies.push(`${scopeAction} must be completed before starting goal work`);
    }

    return dependencies;
  },

  estimateTime(actions: string[], project: ProjectPayload): Record<string, string> {
    const estimates: Record<string, string> = {};

    actions.forEach((action) => {
      if (action.includes('Set up') || action.includes('Define')) {
        estimates[action] = '1-2 days';
      } else if (action.includes('Assemble') || action.includes('Establish')) {
        estimates[action] = '2-3 days';
      } else if (action.includes('Work on goal')) {
        estimates[action] = project.timeline ? '1-2 weeks' : '2-4 weeks';
      } else if (action.includes('research') || action.includes('analysis')) {
        estimates[action] = '1 week';
      } else {
        estimates[action] = '3-5 days';
      }
    });

    return estimates;
  },

  calculateConfidence(_project: ProjectPayload, strategy: StrategyResult): number {
    return strategy.confidence * 0.9; // Slightly lower confidence for tactical planning
  },
};
