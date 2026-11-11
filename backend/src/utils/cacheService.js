// High-performance, zero-dependency In-Memory TTL Cache Designed for caching hot DB read queries (e.g. event details, platform stats, admin summaries)
class CacheService {
    constructor({ defaultTtlSeconds = 60, maxEntries = 500 } = {}) {
        this.cache = new Map();
        this.defaultTtl = defaultTtlSeconds * 1000;
        this.maxEntries = maxEntries;
        this.hits = 0;
        this.misses = 0;
        // Periodic cleanup of expired entries every 60 seconds
        this.cleanupInterval = setInterval(() => {
            this.purgeExpired();
        }, 60000);
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref(); // Don't hold Node event loop open
        }
    }
    // Get a cached item by key Returns null if missing or expired
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.misses++;
            return null;
        }
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        this.hits++;
        return item.value;
    }
    // Set an item with optional custom TTL in seconds
    set(key, value, ttlSeconds) {
        if (this.cache.size >= this.maxEntries) {
            // Evict oldest entry (first key in insertion order)
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }
        const ttlMs = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl);
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
            createdAt: Date.now()
        });
    }
    // Delete an item by key
    del(key) {
        return this.cache.delete(key);
    }
    // Invalidate all keys matching a prefix (e.g., 'event:34' or 'event:')
    delByPrefix(prefix) {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }
    // Clear all cached items
    flush() {
        this.cache.clear();
    }
    // Remove all expired entries
    purgeExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
    // Cache metrics and statistics
    getStats() {
        return {
            size: this.cache.size,
            maxEntries: this.maxEntries,
            hits: this.hits,
            misses: this.misses,
            hitRatio: this.hits + this.misses > 0
                ? `${((this.hits / (this.hits + this.misses)) * 100).toFixed(1)}%`
                : '0.0%'
        };
    }
}
// Export singleton instance
const cacheService = new CacheService({ defaultTtlSeconds: 60, maxEntries: 1000 });
module.exports = cacheService;
