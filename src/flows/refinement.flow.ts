import { ProjectPayload, InsightReport } from '../types/schemas';
import { advisoryFlow } from './advisory.flow';
import { projectMemory } from '../memory/project-memory';
import { logger } from '../utils/logger';
import { metrics, trackTiming } from '../utils/metrics';

export const refinementFlow = {
  name: 'refinement',
  description: 'Refines insights based on updated project data or feedback',

  /**
   * Refine insights with updated project data
   */
  async refine(projectId: string, updates: Partial<ProjectPayload>): Promise<InsightReport> {
    return trackTiming('flow.refinement.refine', async () => {
      logger.info('Refinement flow started', { projectId, updates });

      // Get existing project
      const existingProject = projectMemory.getProject(projectId);
      if (!existingProject) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Merge updates
      const updatedProject: ProjectPayload = {
        ...existingProject,
        ...updates,
        metadata: {
          ...existingProject.metadata,
          completedAt: new Date(),
        },
      };

      // Save updated project
      projectMemory.saveProject(projectId, updatedProject);

      // Regenerate insights
      const newInsights = await advisoryFlow.generateInsights(projectId);

      metrics.increment('flow.refinement.complete');
      logger.info('Refinement flow completed', { projectId });

      return newInsights;
    });
  },

  /**
   * Get reasoning path for a project's insights
   */
  async getReasoningPath(projectId: string): Promise<InsightReport['metadata']['reasoningPath']> {
    const insight = projectMemory.getInsight(projectId);
    if (!insight) {
      throw new Error(`Insight for project ${projectId} not found`);
    }

    return insight.metadata.reasoningPath;
  },
};
