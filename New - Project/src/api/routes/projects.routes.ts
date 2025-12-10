import { Router, Request, Response } from 'express';
import { onboardingFlow, advisoryFlow, refinementFlow } from '../../flows';
import { projectMemory } from '../../memory/project-memory';
import { NotFoundError } from '../../utils/error-handler';
import { validatePartialProject } from '../validators/project.validator';

const router = Router();

/**
 * POST /api/v1/onboard
 * Start onboarding flow
 */
router.post('/onboard', async (req: Request, res: Response, next) => {
  try {
    const { userInput, category } = req.body;

    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'userInput is required', code: 'VALIDATION_ERROR' },
      });
    }

    const result = await onboardingFlow.start(userInput, category);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/onboard/:sessionId
 * Continue onboarding flow
 */
router.post('/onboard/:sessionId', async (req: Request, res: Response, next) => {
  try {
    const { sessionId } = req.params;
    const { userInput } = req.body;

    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'userInput is required', code: 'VALIDATION_ERROR' },
      });
    }

    const result = await onboardingFlow.continue(sessionId, userInput);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/advice/:projectId
 * Generate insights for a project
 */
router.post('/advice/:projectId', async (req: Request, res: Response, next) => {
  try {
    const { projectId } = req.params;
    const insight = await advisoryFlow.generateInsights(projectId);
    res.json({ success: true, data: insight });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/advice/:projectId
 * Get existing insights for a project
 */
router.get('/advice/:projectId', async (req: Request, res: Response, next) => {
  try {
    const { projectId } = req.params;
    const insight = projectMemory.getInsight(projectId);

    if (!insight) {
      throw new NotFoundError('Insight', projectId);
    }

    res.json({ success: true, data: insight });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/projects
 * List all projects (simplified - in production would have pagination, filtering)
 */
router.get('/projects', async (_req: Request, res: Response, next) => {
  try {
    // In production, this would query a database
    // For now, return empty array as projects are stored in memory cache
    return res.json({ success: true, data: [] });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/projects/:id
 * Get a specific project
 */
router.get('/projects/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const project = projectMemory.getProject(id);

    if (!project) {
      throw new NotFoundError('Project', id);
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/projects/:id/refine
 * Refine insights with updated project data
 */
router.post(
  '/projects/:id/refine',
  validatePartialProject,
  async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const insight = await refinementFlow.refine(id, updates);
      res.json({ success: true, data: insight });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/projects/:id/reasoning
 * Get reasoning path for a project
 */
router.get('/projects/:id/reasoning', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const reasoningPath = await refinementFlow.getReasoningPath(id);
    res.json({ success: true, data: reasoningPath });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/projects/:id/feedback
 * Submit feedback to improve system
 */
router.post('/projects/:id/feedback', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { feedback, rating } = req.body;

    // In production, this would store feedback for learning
    res.json({
      success: true,
      message: 'Feedback received',
      data: { projectId: id, feedback, rating },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
