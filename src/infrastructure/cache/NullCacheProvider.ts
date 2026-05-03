import type { ICacheProvider, CacheSetOptions } from '@/domain/interfaces/ICacheProvider';

/** No-op cache — usado quando as credenciais do Redis não estão configuradas.
 *  Garante que o app funcione sem Upstash (sem cache, mas sem erro). */
export class NullCacheProvider implements ICacheProvider {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }
  async set<T>(_key: string, _value: T, _options?: CacheSetOptions): Promise<void> {}
  async del(_key: string): Promise<void> {}
  async deletePattern(_pattern: string): Promise<void> {}
}
