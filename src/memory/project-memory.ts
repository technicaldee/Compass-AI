import { ProjectPayload, InsightReport } from '../types/schemas';
import { cacheManager } from './cache-manager';
import { logger } from '../utils/logger';

class ProjectMemory {
  private readonly prefix = 'project:';

  saveProject(projectId: string, project: ProjectPayload): void {
    const key = `${this.prefix}${projectId}`;
    cacheManager.set(key, project);
    logger.info('Project saved to memory', { projectId });
  }

  getProject(projectId: string): ProjectPayload | undefined {
    const key = `${this.prefix}${projectId}`;
    const project = cacheManager.get<ProjectPayload>(key);
    if (project) {
      logger.debug('Project retrieved from memory', { projectId });
    }
    return project;
  }

  saveInsight(projectId: string, insight: InsightReport): void {
    const key = `${this.prefix}${projectId}:insight`;
    cacheManager.set(key, insight);
    logger.info('Insight saved to memory', { projectId });
  }

  getInsight(projectId: string): InsightReport | undefined {
    const key = `${this.prefix}${projectId}:insight`;
    const insight = cacheManager.get<InsightReport>(key);
    if (insight) {
      logger.debug('Insight retrieved from memory', { projectId });
    }
    return insight;
  }

  deleteProject(projectId: string): void {
    const projectKey = `${this.prefix}${projectId}`;
    const insightKey = `${this.prefix}${projectId}:insight`;
    cacheManager.delete(projectKey);
    cacheManager.delete(insightKey);
    logger.info('Project deleted from memory', { projectId });
  }
}

export const projectMemory = new ProjectMemory();
