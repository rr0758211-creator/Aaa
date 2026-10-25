/**
 * Coil Image Caching Simulator for Jetpack Compose Web Equivalent.
 * Mimics Coil's ImageLoader with MemoryCache (LRU) and DiskCache (CacheStorage/Blobs).
 */

class CoilImageCache {
  private memoryCache = new Map<string, string>();
  private maxMemoryEntries = 120;
  private cacheStats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Pre-fetches or loads an image and stores it in memory cache.
   */
  async getOrLoadImage(url: string): Promise<string> {
    if (this.memoryCache.has(url)) {
      this.cacheStats.hits++;
      return this.memoryCache.get(url)!;
    }

    this.cacheStats.misses++;

    try {
      // Check Cache API if supported
      if ('caches' in window) {
        const cache = await caches.open('depth-wallpaper-coil-v1');
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.addToMemory(url, objectUrl);
          this.cacheStats.hits++;
          return objectUrl;
        }

        // Fetch and put into cache
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) {
            cache.put(url, response.clone());
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            this.addToMemory(url, objectUrl);
            return objectUrl;
          }
        } catch {
          // Fall back to direct URL if fetch/CORS is restricted on direct CDN
          this.addToMemory(url, url);
          return url;
        }
      }
    } catch (e) {
      // Fallback
    }

    this.addToMemory(url, url);
    return url;
  }

  isCachedInMemory(url: string): boolean {
    return this.memoryCache.has(url);
  }

  private addToMemory(key: string, value: string) {
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      // Evict oldest item (LRU)
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        const oldVal = this.memoryCache.get(firstKey);
        if (oldVal && oldVal.startsWith('blob:')) {
          URL.revokeObjectURL(oldVal);
        }
        this.memoryCache.delete(firstKey);
      }
    }
    this.memoryCache.set(key, value);
  }

  getStats() {
    return {
      ...this.cacheStats,
      cachedCount: this.memoryCache.size,
    };
  }

  clear() {
    for (const val of this.memoryCache.values()) {
      if (val.startsWith('blob:')) {
        URL.revokeObjectURL(val);
      }
    }
    this.memoryCache.clear();
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
  }
}

export const coilCache = new CoilImageCache();
