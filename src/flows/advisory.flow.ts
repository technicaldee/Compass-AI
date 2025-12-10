import { ProjectPayload, InsightReport } from '../types/schemas';
import {
  analyzerAgent,
  strategistAgent,
  tacticalAgent,
  riskAgent,
  synthesizerAgent,
} from '../agents/advisory';
import { selectRelevantTools } from '../tools/data-sources';
import { projectMemory } from '../memory/project-memory';
import { logger } from '../utils/logger';
import { metrics, trackTiming } from '../utils/metrics';
import { SynthesisInput } from '../types/agents';

export const advisoryFlow = {
  name: 'advisory',
  description: 'Generates comprehensive insights using multi-agent system',

  /**
   * Generate insights for a project
   */
  async generateInsights(projectId: string): Promise<InsightReport> {
    return trackTiming('flow.advisory.generate', async () => {
      logger.info('Advisory flow started', { projectId });

      // Retrieve project
      const project = projectMemory.getProject(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Stage 1: Parallel analysis and data fetching
      logger.info('Stage 1: Parallel analysis and data fetching', { projectId });
      const [analysisResult, externalData] = await Promise.all([
        analyzerAgent.analyze(project),
        this.fetchExternalData(project),
      ]);

      if (!analysisResult.success) {
        throw new Error('Analysis failed');
      }

      // Stage 2: Strategy generation
      logger.info('Stage 2: Strategy generation', { projectId });
      const strategyResult = await strategistAgent.generateStrategy(project, analysisResult.data);
      if (!strategyResult.success) {
        throw new Error('Strategy generation failed');
      }

      // Stage 3: Tactical breakdown
      logger.info('Stage 3: Tactical breakdown', { projectId });
      const tacticalResult = await tacticalAgent.createActionPlan(project, strategyResult.data);
      if (!tacticalResult.success) {
        throw new Error('Tactical planning failed');
      }

      // Stage 4: Risk assessment
      logger.info('Stage 4: Risk assessment', { projectId });
      const riskResult = await riskAgent.assessRisks(project, analysisResult.data);
      if (!riskResult.success) {
        throw new Error('Risk assessment failed');
      }

      // Stage 5: Synthesis
      logger.info('Stage 5: Synthesis', { projectId });
      const synthesisInput: SynthesisInput = {
        analysis: analysisResult.data,
        strategy: strategyResult.data,
        tactical: tacticalResult.data,
        risks: riskResult.data,
        externalData,
      };

      const synthesisResult = await synthesizerAgent.synthesize(project, synthesisInput);
      if (!synthesisResult.success) {
        throw new Error('Synthesis failed');
      }

      // Save insight report
      projectMemory.saveInsight(projectId, synthesisResult.data);

      metrics.increment('flow.advisory.complete');
      logger.info('Advisory flow completed', { projectId });

      return synthesisResult.data;
    });
  },

  /**
   * Fetch external data from relevant sources
   */
  async fetchExternalData(project: ProjectPayload): Promise<unknown[]> {
    const relevantTools = selectRelevantTools(project);
    logger.info('Fetching external data', { toolCount: relevantTools.length });

    const dataPromises = relevantTools.map(async (tool) => {
      try {
        const context = {
          project,
          sessionId: 'advisory-flow',
        };
        return await tool.fetch(context);
      } catch (error) {
        logger.error('Failed to fetch data from tool', { tool: tool.name, error });
        return null;
      }
    });

    const results = await Promise.all(dataPromises);
    return results.filter((r) => r !== null);
  },
};
