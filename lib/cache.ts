import { LRUCache } from 'lru-cache';

// Cache for media files / image bytes (up to 50MB in memory, fast binary serving)
interface CachedMedia {
  filename: string;
  mimeType: string;
  data: Buffer;
  size: number;
}

const mediaCache = new LRUCache<string, CachedMedia>({
  max: 200,
  maxSize: 50 * 1024 * 1024, // 50MB
  sizeCalculation: (entry) => entry.data.length || 1,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

export function getCachedMedia(id: string | number): CachedMedia | undefined {
  return mediaCache.get(String(id));
}

export function setCachedMedia(id: string | number, media: CachedMedia): void {
  mediaCache.set(String(id), media);
}

export function invalidateMediaCache(id?: string | number): void {
  if (id !== undefined) {
    mediaCache.delete(String(id));
  } else {
    mediaCache.clear();
  }
}

// General purpose data cache (queries, stats, blog lists)
const queryCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes TTL
});

export function getCachedQuery<T = any>(key: string): T | undefined {
  return queryCache.get(key) as T | undefined;
}

export function setCachedQuery<T = any>(key: string, data: T, ttlMs?: number): void {
  queryCache.set(key, data, { ttl: ttlMs });
}

export function invalidateQueryCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    queryCache.clear();
    return;
  }
  for (const key of queryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      queryCache.delete(key);
    }
  }
}
