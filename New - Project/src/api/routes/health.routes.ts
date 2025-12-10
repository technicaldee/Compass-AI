import { Router, Request, Response } from 'express';
import { cacheManager } from '../../memory/cache-manager';
import { metrics } from '../../utils/metrics';

const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/', async (_req: Request, res: Response) => {
  const cacheStats = cacheManager.getStats();
  const systemMetrics = metrics.getMetrics();

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      keys: cacheStats.keys,
    },
    metrics: {
      total: systemMetrics.length,
      recent: systemMetrics.slice(-10),
    },
  });
});

/**
 * GET /api/v1/metrics
 * Get system metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  const systemMetrics = metrics.getMetrics();
  const cacheStats = cacheManager.getStats();

  res.json({
    success: true,
    data: {
      metrics: systemMetrics,
      cache: cacheStats,
    },
  });
});

export default router;
