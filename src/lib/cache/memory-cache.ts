// This is a simple in-memory cache implementation
// For production, you would want to replace this with Redis or another caching solution

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    
    // Check if the entry has expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }
  
  async invalidateByPrefix(prefix: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new MemoryCache();

export async function getCachedData<T>(
  key: string, 
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300 // 5 minutes
): Promise<T> {
  try {
    const cachedData = await cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }
  } catch (error) {
    console.warn('Cache read failed:', error);
  }
  
  const data = await fetchFn();
  
  try {
    await cache.set(key, data, ttlSeconds);
  } catch (error) {
    console.warn('Cache write failed:', error);
  }
  
  return data;
}
