import { logger } from './logger';

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private readonly maxMetrics = 1000;

  record(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      tags,
    });

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    logger.debug('Metric recorded', { name, value, tags });
  }

  increment(name: string, tags?: Record<string, string>): void {
    this.record(name, 1, tags);
  }

  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    this.record(name, durationMs, { ...tags, unit: 'ms' });
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): Metric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  getAverage(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

export const trackTiming = async <T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    metrics.timing(name, Date.now() - start, { ...tags, success: 'true' });
    return result;
  } catch (error) {
    metrics.timing(name, Date.now() - start, { ...tags, success: 'false' });
    throw error;
  }
};
