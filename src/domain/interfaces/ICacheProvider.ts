export interface CacheSetOptions {
  ttl?: number; // segundos
}

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
  del(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
}
