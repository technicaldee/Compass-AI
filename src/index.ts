import { startServer } from './api/server';
import { logger } from './utils/logger';
import { config } from './config/app.config';

// Validate required configuration
if (!config.mastra.apiKey && config.nodeEnv === 'production') {
  logger.warn('MASTRA_API_KEY not set - some features may not work');
}

// Start the server
try {
  startServer();
  logger.info('Application started successfully', {
    environment: config.nodeEnv,
    port: config.port,
  });
} catch (error) {
  logger.error('Failed to start application', { error });
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
