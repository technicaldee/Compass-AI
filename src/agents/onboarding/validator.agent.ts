import { AgentResponse, ValidationResult, ValidationError } from '../../types/agents';
import { ProjectPayload } from '../../types/schemas';
import { agentConfigs } from '../../config/agents.config';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

export const validatorAgent = {
  name: agentConfigs.validator.name,
  config: agentConfigs.validator,

  /**
   * Validates and suggests improvements to project data
   */
  async validate(project: Partial<ProjectPayload>): Promise<AgentResponse<ValidationResult>> {
    const startTime = Date.now();

    try {
      logger.info('Validation started', { projectName: project.projectName });

      const errors: ValidationError[] = [];
      const suggestions: string[] = [];

      // Validate project name
      if (!project.projectName || project.projectName.length < 3) {
        errors.push({
          field: 'projectName',
          message: 'Project name must be at least 3 characters long',
          severity: 'error',
        });
      }

      // Validate category
      if (!project.category) {
        errors.push({
          field: 'category',
          message: 'Project category is required',
          severity: 'error',
        });
      }

      // Validate goals
      if (!project.goals || project.goals.length === 0) {
        errors.push({
          field: 'goals',
          message: 'At least one goal is required',
          severity: 'error',
        });
      } else {
        project.goals.forEach((goal, index) => {
          if (goal.description.length < 10) {
            errors.push({
              field: `goals[${index}].description`,
              message: 'Goal description should be at least 10 characters',
              severity: 'warning',
            });
          }

          if (!goal.measurable) {
            suggestions.push(
              `Consider making goal "${goal.description.substring(0, 50)}..." measurable with specific metrics`
            );
          }
        });
      }

      // Validate owner
      if (!project.owner || !project.owner.name) {
        errors.push({
          field: 'owner',
          message: 'Project owner name is required',
          severity: 'error',
        });
      }

      // Quality suggestions
      if (!project.constraints || project.constraints.length === 0) {
        suggestions.push('Consider adding constraints or limitations to help with planning');
      }

      if (!project.timeline) {
        suggestions.push('Adding a timeline with start and end dates would improve planning');
      }

      // Calculate confidence based on completeness
      const requiredFields = ['projectName', 'category', 'goals', 'owner'];
      const completedFields = requiredFields.filter((field) => {
        if (field === 'goals') return project.goals && project.goals.length > 0;
        return project[field as keyof ProjectPayload] !== undefined;
      });

      const confidence = completedFields.length / requiredFields.length;
      const hasErrors = errors.some((e) => e.severity === 'error');

      metrics.timing('agent.validator.duration', Date.now() - startTime);
      metrics.increment(hasErrors ? 'agent.validator.errors' : 'agent.validator.success');

      const result: ValidationResult = {
        isValid: !hasErrors,
        errors,
        suggestions,
        confidence,
      };

      logger.info('Validation completed', { result });

      return {
        success: true,
        data: result,
        confidence,
        reasoning: hasErrors
          ? `Found ${errors.length} error(s) that need to be fixed`
          : `Validation passed with ${suggestions.length} suggestion(s)`,
      };
    } catch (error) {
      metrics.increment('agent.validator.error');
      logger.error('Validation failed', { error });
      return {
        success: false,
        data: {
          isValid: false,
          errors: [
            {
              field: 'unknown',
              message: 'Validation process encountered an error',
              severity: 'error',
            },
          ],
          suggestions: [],
          confidence: 0,
        },
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
