import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/templates
 * List available templates
 */
router.get('/', async (_req: Request, res: Response) => {
  const templates = [
    {
      id: 'tech-startup',
      name: 'Tech Startup',
      category: ['tech', 'business'],
      description: 'For technology startups and software projects',
      requiredFields: ['projectName', 'goals', 'owner', 'timeline'],
    },
    {
      id: 'community-event',
      name: 'Community Event',
      category: ['community'],
      description: 'For organizing community events and gatherings',
      requiredFields: ['projectName', 'goals', 'owner', 'timeline', 'constraints'],
    },
    {
      id: 'business-strategy',
      name: 'Business Strategy',
      category: ['business', 'finance'],
      description: 'For business planning and strategic initiatives',
      requiredFields: ['projectName', 'goals', 'owner', 'constraints'],
    },
    {
      id: 'educational-program',
      name: 'Educational Program',
      category: ['education'],
      description: 'For educational programs and learning initiatives',
      requiredFields: ['projectName', 'goals', 'owner', 'timeline'],
    },
  ];

  res.json({ success: true, data: templates });
});

/**
 * POST /api/v1/templates
 * Create custom template (stub - in production would persist)
 */
router.post('/', async (req: Request, res: Response) => {
  const template = req.body;
  res.json({
    success: true,
    message: 'Template created (stub - not persisted)',
    data: template,
  });
});

export default router;
