/**
 * Represents a cached entry with its value and expiration timestamp
 */
type CacheEntry<T> = { value: T; expiresAt: number };

/**
 * In-memory cache service with Time-To-Live (TTL) support.
 *
 * This service provides a simple in-memory caching mechanism for storing and retrieving
 * data with automatic expiration. It's used throughout the application to cache:
 * - AI-generated reports and context analyses
 * - Processed topic analysis data (sentiment, mentions, geographic distribution)
 * - News article search results
 *
 * Key Features:
 * - Automatic expiration: Entries are automatically invalidated after their TTL expires
 * - Type-safe: Generic support for strongly-typed cached values
 * - Lazy cleanup: Expired entries are removed on access, not via background job
 * - Different TTLs: Supports current-day data (short TTL) vs historical data (long TTL)
 *
 * Limitations:
 * - In-memory only: Cache is lost on server restart
 * - Single-instance: Not shared across multiple server instances
 * - No size limits: No automatic eviction based on memory usage
 *
 * For production with multiple instances, consider replacing with Redis or similar.
 *
 * @example
 * // Cache a report for 1 hour
 * cache.set('report:topic:2024-01-01', reportData, 3600);
 *
 * // Retrieve from cache
 * const cached = cache.get<string>('report:topic:2024-01-01');
 * if (cached) {
 *   return cached; // Cache hit
 * }
 */
export class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Creates a new CacheService instance
   * @param now - Function to get current timestamp (for testing)
   */
  constructor(private readonly now: () => number = () => Date.now()) {}

  /**
   * Retrieves a value from the cache
   * @param key - Cache key to look up
   * @returns The cached value if found and not expired, undefined otherwise
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (this.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Stores a value in the cache with a TTL
   * @param key - Cache key to store under
   * @param value - Value to cache
   * @param ttlSeconds - Time-to-live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = this.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }
}

/**
 * Global cache instance used throughout the application
 */
export const cache = new CacheService();

