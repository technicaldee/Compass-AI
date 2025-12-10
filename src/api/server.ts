import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/app.config';
import { logger } from '../utils/logger';
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import projectsRoutes from './routes/projects.routes';
import templatesRoutes from './routes/templates.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/templates', templatesRoutes);
app.use('/api/v1/health', healthRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Mastra Insight Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      projects: '/api/v1/projects',
      templates: '/api/v1/templates',
      docs: '/api/v1/docs',
    },
  });
});

// Error handling (must be last)
app.use(errorHandler);

export const startServer = (): void => {
  const port = config.port;
  const server = app.listen(port, () => {
    logger.info(`Server started on port ${port}`, {
      port,
      environment: config.nodeEnv,
    });
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(
        `Port ${port} is already in use. Please stop the other process or use a different port.`,
        {
          port,
          error: error.message,
        }
      );
      process.exit(1);
    } else {
      logger.error('Server error', { error });
      throw error;
    }
  });
};

export default app;
