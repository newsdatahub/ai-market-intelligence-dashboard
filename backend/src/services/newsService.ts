import { cache } from './cacheService';
import { NewsQueryParams, NewsService } from './types';
import { NewsResponse, RelatedArticlesResponse } from '../types';
import { NEWSDATAHUB_BASE_URL, NEWSDATAHUB_API_KEY, CACHE_TTL_HISTORICAL, CACHE_TTL_CURRENT_DAY, validateEnvironmentVariables } from '../config/env';
import { buildQueryString } from '../utils/queryStringUtils';
import { fetchJSON } from '../utils/httpUtils';
import { calculateCacheTTL } from '../utils/cacheUtils';
import { logger } from '../utils/logger';

/**
 * Generates a cache key for news query parameters.
 * Uses JSON serialization to create a unique key based on all parameters.
 *
 * @param params - News query parameters
 * @returns A unique cache key string
 */
function generateNewsCacheKey(params: NewsQueryParams): string {
  return `news:${JSON.stringify(params)}`;
}

/**
 * Generates a cache key for related articles query.
 *
 * @param articleId - The article ID
 * @param perPage - Number of results per page
 * @param fields - Optional comma-separated fields to return
 * @returns A unique cache key string
 */
function generateRelatedArticlesCacheKey(articleId: string, perPage: number, fields?: string): string {
  return `related:${articleId}:${perPage}:${fields || ''}`;
}

/**
 * NewsDataHub API service implementation.
 * Handles fetching news articles and related content with caching support.
 */
export class NewsDataHubService implements NewsService {
  /**
   * Fetches news articles based on query parameters.
   * Results are cached with TTL based on whether the query includes current day data.
   *
   * @param params - Query parameters for news search
   * @returns News response with articles and pagination info
   */
  async getNews(params: NewsQueryParams): Promise<NewsResponse> {
    const missingVars = validateEnvironmentVariables();
    if (missingVars.length > 0) {
      throw new Error(
        `Missing API configuration. Please set the following environment variables: ${missingVars.join(', ')}`
      );
    }

    const cacheKey = generateNewsCacheKey(params);

    // Check cache first
    const cachedNews = cache.get<NewsResponse>(cacheKey);
    if (cachedNews) {
      return cachedNews;
    }

    // Build request URL
    const queryString = buildQueryString(params as Record<string, unknown>);
    const url = `${NEWSDATAHUB_BASE_URL}/v1/news${queryString}`;

    // Fetch from API
    const newsResponse = await fetchJSON<NewsResponse>(url, {
      'X-API-Key': NEWSDATAHUB_API_KEY,
    });

    // Cache with appropriate TTL (shorter for current day, longer for historical)
    const cacheTTL = calculateCacheTTL(params.end_date);
    cache.set(cacheKey, newsResponse, cacheTTL);

    return newsResponse;
  }

  /**
   * Fetches articles related to a specific article.
   * Results are cached with historical TTL since related articles don't change frequently.
   *
   * @param articleId - The ID of the article to find related content for
   * @param perPage - Number of related articles to return (default: 5)
   * @param fields - Optional comma-separated list of fields to include
   * @returns Related articles response
   */
  async getRelated(articleId: string, perPage = 5, fields?: string): Promise<RelatedArticlesResponse> {
    const cacheKey = generateRelatedArticlesCacheKey(articleId, perPage, fields);

    // Check cache first
    const cachedRelated = cache.get<RelatedArticlesResponse>(cacheKey);
    if (cachedRelated) {
      return cachedRelated;
    }

    // Build request URL
    const queryString = buildQueryString({ per_page: perPage, fields });
    const url = `${NEWSDATAHUB_BASE_URL}/v1/news/${articleId}/related${queryString}`;

    // Fetch from API
    const relatedArticlesResponse = await fetchJSON<RelatedArticlesResponse>(url, {
      'X-API-Key': NEWSDATAHUB_API_KEY,
    });

    // Cache with historical TTL (related articles don't change often)
    cache.set(cacheKey, relatedArticlesResponse, CACHE_TTL_HISTORICAL);

    return relatedArticlesResponse;
  }
}

/**
 * Global news service instance
 */
export const newsService = new NewsDataHubService();
