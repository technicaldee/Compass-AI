import NodeCache from 'node-cache';
import { logger } from '../utils/logger';
import { config } from '../config/app.config';

class CacheManager {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.checkPeriod,
      useClones: false,
    });

    this.cache.on('set', (key) => {
      logger.debug('Cache set', { key });
    });

    this.cache.on('del', (key) => {
      logger.debug('Cache deleted', { key });
    });

    this.cache.on('expired', (key) => {
      logger.debug('Cache expired', { key });
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      logger.debug('Cache hit', { key });
    } else {
      logger.debug('Cache miss', { key });
    }
    return value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || config.cache.ttl);
    logger.debug('Cache set result', { key, success });
    return success;
  }

  delete(key: string): number {
    return this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
    logger.info('Cache cleared');
  }

  getStats() {
    return this.cache.getStats();
  }
}

export const cacheManager = new CacheManager();
