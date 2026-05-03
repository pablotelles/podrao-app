import { Redis } from '@upstash/redis';
import type { ICacheProvider, CacheSetOptions } from '@/domain/interfaces/ICacheProvider';

export class UpstashCacheProvider implements ICacheProvider {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get<T>(key);
    return value ?? null;
  }

  async set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    if (options?.ttl) {
      await this.redis.set(key, value, { ex: options.ttl });
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    // Upstash suporta SCAN — varre as chaves e deleta em lote
    let cursor = 0;
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = Number(nextCursor);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== 0);
  }
}
