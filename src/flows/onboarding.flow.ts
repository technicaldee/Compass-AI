import { ProjectPayload, ProjectCategory, Priority } from '../types/schemas';
import { templateMatcherAgent, dataCollectorAgent, validatorAgent } from '../agents/onboarding';
import { projectMemory } from '../memory/project-memory';
import { logger } from '../utils/logger';
import { metrics, trackTiming } from '../utils/metrics';
import { randomUUID } from 'crypto';

interface OnboardingState {
  sessionId: string;
  currentStep: 'template-matching' | 'data-collection' | 'validation' | 'complete';
  projectData?: Partial<ProjectPayload>;
  templateId?: string;
  validationResult?: unknown;
}

export const onboardingFlow = {
  name: 'onboarding',
  description: 'Guides users through project onboarding with template matching and data collection',

  /**
   * Start onboarding flow with initial user input
   */
  async start(
    userInput: string,
    category?: string
  ): Promise<{
    sessionId: string;
    templateId: string;
    nextQuestion?: string;
  }> {
    return trackTiming('flow.onboarding.start', async () => {
      const sessionId = randomUUID();
      logger.info('Onboarding flow started', { sessionId, userInput });

      // Step 1: Template matching
      const templateMatch = await templateMatcherAgent.matchTemplate(
        userInput,
        category as ProjectCategory | undefined
      );
      if (!templateMatch.success) {
        throw new Error('Template matching failed');
      }

      const state: OnboardingState = {
        sessionId,
        currentStep: 'data-collection',
        templateId: templateMatch.data.templateId,
      };

      // Step 2: Initial data collection
      const collectionResult = await dataCollectorAgent.collectData(sessionId, userInput);
      if (!collectionResult.success) {
        throw new Error('Data collection failed');
      }

      state.projectData = collectionResult.data.state as Partial<ProjectPayload>;

      return {
        sessionId,
        templateId: templateMatch.data.templateId,
        nextQuestion: collectionResult.data.nextQuestion,
      };
    });
  },

  /**
   * Continue onboarding with additional user input
   */
  async continue(
    sessionId: string,
    userInput: string
  ): Promise<{
    nextQuestion?: string;
    isComplete: boolean;
    projectId?: string;
  }> {
    return trackTiming('flow.onboarding.continue', async () => {
      logger.info('Onboarding flow continued', { sessionId, userInput });

      // Get current state (in production, this would be stored)
      // For now, we'll collect data incrementally
      const collectionResult = await dataCollectorAgent.collectData(sessionId, userInput);

      if (!collectionResult.success) {
        throw new Error('Data collection failed');
      }

      if (collectionResult.data.isComplete) {
        // Step 3: Validation
        const projectPayload = this.buildProjectPayload(collectionResult.data.state);
        const validationResult = await validatorAgent.validate(projectPayload);

        if (!validationResult.success) {
          throw new Error('Validation failed');
        }

        if (validationResult.data.isValid) {
          // Save project
          const projectId = randomUUID();
          const finalProject: ProjectPayload = {
            ...projectPayload,
            metadata: {
              templateVersion: '1.0',
              completedAt: new Date(),
              confidence: validationResult.data.confidence,
            },
          } as ProjectPayload;

          projectMemory.saveProject(projectId, finalProject);

          metrics.increment('flow.onboarding.complete');
          logger.info('Onboarding flow completed', { sessionId, projectId });

          return {
            isComplete: true,
            projectId,
          };
        } else {
          // Return validation errors for user to fix
          return {
            isComplete: false,
            nextQuestion: `Please address these issues: ${validationResult.data.errors.map((e) => e.message).join(', ')}`,
          };
        }
      }

      return {
        nextQuestion: collectionResult.data.nextQuestion,
        isComplete: false,
      };
    });
  },

  buildProjectPayload(state: {
    projectName?: string;
    category?: string;
    goals?: Array<{
      id: string;
      description: string;
      priority: Priority;
      measurable: boolean;
      deadline?: Date;
    }>;
    owner?: { name: string; email?: string; role?: string };
    constraints?: string[];
    timeline?: { startDate?: Date; endDate?: Date };
  }): Partial<ProjectPayload> {
    return {
      projectName: state.projectName || 'Untitled Project',
      category: (state.category as ProjectCategory) || ProjectCategory.OTHER,
      goals: state.goals || [],
      owner: state.owner || { name: 'Unknown' },
      constraints: state.constraints?.map((c: string) => ({
        type: 'general',
        description: c,
        impact: Priority.MEDIUM,
      })),
      timeline: state.timeline
        ? {
            startDate: state.timeline.startDate || new Date(),
            endDate: state.timeline.endDate,
          }
        : undefined,
    };
  },
};
