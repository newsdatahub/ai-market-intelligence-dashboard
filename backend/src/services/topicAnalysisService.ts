import { ProcessedTopicData } from '../types';
import { cache } from './cacheService';
import { calculateCacheTTL } from '../utils/cacheUtils';
import { fetchAllTopicArticles, fetchAllTopicArticlesWithTier } from '../utils/newsUtils';
import { extractTopEntities } from './entityExtractionService';
import { normalizeSearchQuery } from '../utils/helpers';
import { ApiTier } from '../utils/tierUtils';
import {
  aggregateMentionsByDay,
  calculateAverageSentiment,
  aggregatePoliticalLeaning,
  aggregateTopKeywords,
  aggregateTopSources,
  aggregateGeographicDistribution,
  selectRepresentativeArticles,
  generateTopicAnalysisCacheKey,
} from '../utils/analysisUtils';
import {
  isDemoMode,
  getDemoTopicData,
  getDemoCacheKey,
  getDemoMainReport,
  getDemoGeoReport,
  getDemoTimelineReport,
  getDemoSearchArticles,
  getDemoCountryArticles,
  DEMO_CACHE_TTL,
} from './demoDataService';

/**
 * Analyzes news coverage for a specific topic over a date range.
 * Provides comprehensive metrics including sentiment, geographic distribution,
 * top sources, daily trends, and representative articles.
 *
 * Results are cached to reduce API calls and improve performance.
 * Cache TTL varies based on whether the date range includes current day data.
 *
 * @param params - Analysis parameters including topic, date range, and language filter
 * @returns Processed topic data with all aggregated metrics
 *
 * @example
 * const analysis = await analyzeTopicCoverage({
 *   topic: 'artificial intelligence',
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   language: 'en'
 * });
 */
export async function analyzeTopicCoverage(params: {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
}): Promise<ProcessedTopicData> {
  const { topic, startDate, endDate, language } = params;

  // Check for demo mode - return saved data immediately
  if (isDemoMode(topic)) {
    const demoData = getDemoTopicData(topic, startDate, endDate);
    if (demoData) {
      return demoData;
    }
  }

  // Check cache to avoid redundant processing
  const cacheKey = generateTopicAnalysisCacheKey({ topic, startDate, endDate, language });
  const cachedAnalysis = cache.get<ProcessedTopicData>(cacheKey);
  if (cachedAnalysis) {
    return cachedAnalysis;
  }

  // Fetch all articles for the topic with tier detection
  const { articles, apiTier } = await fetchAllTopicArticlesWithTier({
    topic,
    startDate,
    endDate,
    language,
  });

  // Cache the full article list separately for efficient country filtering.
  // This allows the country-coverage endpoint to reuse these articles instead of
  // re-fetching from NewsDataHub API, saving 1-40 API calls per country click.
  // Use normalized topic for consistent cache keys
  const normalizedTopic = normalizeSearchQuery(topic);
  const articlesCacheKey = `articles:${normalizedTopic}:${startDate}:${endDate}:${language || ''}`;
  const cacheTTL = calculateCacheTTL(endDate);
  cache.set(articlesCacheKey, articles, cacheTTL);

  // Aggregate metrics from articles
  const mentionsByDay = aggregateMentionsByDay(articles);
  const sentimentAverage = calculateAverageSentiment(articles);
  const politicalLeaningDistribution = aggregatePoliticalLeaning(articles);
  const topKeywords = aggregateTopKeywords(articles, 10);

  const topSources = aggregateTopSources(articles);
  const geographicDistribution = aggregateGeographicDistribution(articles);
  const topArticles = selectRepresentativeArticles(articles);

  // Extract top entities using AI (async, with caching)
  const topEntities = await extractTopEntities({
    topic,
    startDate,
    endDate,
    language,
    articles,
  });

  // Assemble final result
  const analysisResult: ProcessedTopicData = {
    topic,
    totalMentions: articles.length,
    dateRange: { start: startDate, end: endDate },
    sentimentAverage,
    politicalLeaningDistribution,
    topEntities,
    topKeywords,
    mentionsByDay,
    topSources,
    geographicDistribution,
    topArticles,
    apiTier,
  };

  // Cache result with appropriate TTL (shorter for current data, longer for historical)
  cache.set(cacheKey, analysisResult, cacheTTL);

  return analysisResult;
}

