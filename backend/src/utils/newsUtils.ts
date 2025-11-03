import { newsService } from '../services/newsService';
import { NewsArticle } from '../types';
import { NEWS_API_CONSTANTS } from '../config/constants';
import { cache } from '../services/cacheService';
import { logger } from './logger';
import { normalizeSearchQuery } from './helpers';
import { isDemoMode, getDemoCacheKey } from '../services/demoDataService';
import { ApiTier, sanitizeArticlesForTier } from './tierUtils';

/**
 * Deduplicates articles based on title.
 * Keeps the first occurrence of each unique title.
 *
 * @param articles - Array of articles to deduplicate
 * @returns Deduplicated array of articles
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Map<string, NewsArticle>();

  for (const article of articles) {
    const normalizedTitle = article.title?.toLowerCase().trim();
    if (normalizedTitle && !seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, article);
    }
  }

  return Array.from(seen.values());
}

/**
 * Result from fetchAllTopicArticles that includes API tier information
 */
export interface FetchArticlesResult {
  articles: NewsArticle[];
  apiTier?: ApiTier;
}

/**
 * Fetches all articles for a topic across multiple pages using cursor pagination.
 * Automatically handles pagination to retrieve complete dataset.
 * Deduplicates articles by title to remove redundant entries.
 *
 * @param params - Search parameters including topic, date range, and filters
 * @returns Complete array of deduplicated articles matching the search criteria
 */
export async function fetchAllTopicArticles(params: {
  topic: string;
  startDate: string;
  endDate: string;
  country?: string;
  language?: string;
  maxLoops?: number;
}): Promise<NewsArticle[]> {
  const result = await fetchAllTopicArticlesWithTier(params);
  return result.articles;
}

/**
 * Fetches all articles for a topic with API tier detection.
 * Sanitizes articles for free tier by removing unavailable fields.
 *
 * @param params - Search parameters including topic, date range, and filters
 * @returns Object containing articles and detected API tier
 */
export async function fetchAllTopicArticlesWithTier(params: {
  topic: string;
  startDate: string;
  endDate: string;
  country?: string;
  language?: string;
  maxLoops?: number;
}): Promise<FetchArticlesResult> {
  const {
    topic,
    startDate,
    endDate,
    country,
    language,
    maxLoops = NEWS_API_CONSTANTS.MAX_PAGINATION_LOOPS,
  } = params;

  // Normalize search query to replace smart/curly quotes with straight quotes
  // This prevents API errors from mixed quote types
  const normalizedTopic = normalizeSearchQuery(topic);

  let cursor: string | undefined = undefined;
  const allArticles: NewsArticle[] = [];
  let loopCount = 0;
  let detectedTier: ApiTier | undefined;

  do {
    const response = await newsService.getNewsWithTier({
      q: normalizedTopic,
      start_date: startDate,
      end_date: endDate,
      language,
      country,
      per_page: NEWS_API_CONSTANTS.MAX_ARTICLES_PER_PAGE,
      cursor,
      media_type: 'digital_native,newspaper,magazine,mainstream_news,specialty_news',
      fields:
        'title,source_title,source_link,article_link,description,topics,keywords,pub_date,creator,content,media_url,media_type,language,sentiment,source',
    });

    // Capture tier from first response
    if (loopCount === 0 && response.apiTier) {
      detectedTier = response.apiTier;
    }

    allArticles.push(...response.data);
    cursor = response.next_cursor ?? undefined;
    loopCount += 1;

    // Prevent infinite loops from API issues or unexpectedly large datasets
    if (loopCount > maxLoops) break;
  } while (cursor);

  // Deduplicate articles by title before sanitization
  const deduplicated = deduplicateArticles(allArticles);

  if (deduplicated.length < allArticles.length) {
    logger.info('Deduplicated articles', {
      original: allArticles.length,
      deduplicated: deduplicated.length,
      removed: allArticles.length - deduplicated.length,
    });
  }

  // Sanitize articles for free tier to remove unavailable fields
  const sanitizedArticles = detectedTier
    ? sanitizeArticlesForTier(deduplicated, detectedTier)
    : deduplicated;

  if (detectedTier === 'free') {
    logger.info('Free tier detected - sanitized article fields', {
      topic,
      articleCount: sanitizedArticles.length,
    });
  }

  return {
    articles: sanitizedArticles,
    apiTier: detectedTier,
  };
}

/**
 * Filters articles by source country
 */
export function filterArticlesByCountry(articles: NewsArticle[], country: string): NewsArticle[] {
  const uppercaseCountry = country.toUpperCase();
  return articles.filter((article) => {
    const sourceCountry = article.source?.country || 'ZZ';
    return sourceCountry.toUpperCase() === uppercaseCountry;
  });
}

/**
 * Gets cached articles or fetches them if not available.
 * Optimizes API usage by reusing articles from topic analysis cache.
 *
 * @param params - Search parameters
 * @returns Articles array (from cache or fresh fetch)
 */
export async function getCachedOrFetchArticles(params: {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
}): Promise<NewsArticle[]> {
  const { topic, startDate, endDate, language } = params;

  // Normalize topic for consistent cache keys
  const normalizedTopic = normalizeSearchQuery(topic);

  // Generate cache key matching the one used in topic analysis
  const articlesCacheKey = `articles:${normalizedTopic}:${startDate}:${endDate}:${language || ''}`;

  // Check demo cache first if in demo mode
  if (isDemoMode(topic)) {
    const demoCacheKey = getDemoCacheKey(articlesCacheKey);
    const demoCachedArticles = cache.get<NewsArticle[]>(demoCacheKey);
    if (demoCachedArticles) {
      logger.info('Using demo cached articles', {
        topic,
        startDate,
        endDate,
        cachedCount: demoCachedArticles.length,
      });
      return demoCachedArticles;
    }
  }

  // Check regular cache
  const cachedArticles = cache.get<NewsArticle[]>(articlesCacheKey);

  if (cachedArticles) {
    logger.info('Using cached articles', {
      topic,
      startDate,
      endDate,
      cachedCount: cachedArticles.length,
    });
    return cachedArticles;
  }

  logger.info('Articles not in cache, fetching from API', {
    topic,
    startDate,
    endDate,
  });

  return fetchAllTopicArticles(params);
}
