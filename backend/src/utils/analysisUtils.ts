import { NewsArticle, ArticleSummary, PoliticalLeaning } from '../types';
import { ANALYSIS_CONSTANTS, DEFAULT_VALUES } from '../config/constants';
import { formatDateAsKey } from './dateUtils';
import { normalizeSearchQuery } from './helpers';

/**
 * Sentiment aggregation result
 */
export interface SentimentAggregation {
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * Source count entry
 */
export interface SourceCount {
  source: string;
  count: number;
}

/**
 * Geographic distribution entry
 */
export interface GeographicCount {
  country: string;
  count: number;
}

/**
 * Political leaning distribution entry
 */
export interface PoliticalLeaningCount {
  leaning: string;
  count: number;
  share: number; // percentage (0-1)
}

/**
 * Normalized political leaning categories for aggregation
 */
export type NormalizedPoliticalLeaning = 'left' | 'center_left' | 'center' | 'center_right' | 'right' | 'far_left' | 'far_right' | 'nonpartisan';

/**
 * Keyword count entry
 */
export interface KeywordCount {
  keyword: string;
  count: number;
}

/**
 * Aggregates mentions by day from a list of articles.
 * Used to identify trends and spikes in coverage over time.
 *
 * @param articles - Array of news articles
 * @returns Record mapping date strings (YYYY-MM-DD) to article counts
 */
export function aggregateMentionsByDay(articles: NewsArticle[]): Record<string, number> {
  const mentionsByDay: Record<string, number> = {};

  for (const article of articles) {
    const dayKey = formatDateAsKey(article.pub_date);
    mentionsByDay[dayKey] = (mentionsByDay[dayKey] || 0) + 1;
  }

  return mentionsByDay;
}

/**
 * Calculates average sentiment scores across articles.
 * Returns neutral (0/1/0) if no sentiment data is available to avoid divide-by-zero.
 *
 * @param articles - Array of news articles
 * @returns Average sentiment scores for positive, neutral, and negative
 */
export function calculateAverageSentiment(articles: NewsArticle[]): SentimentAggregation {
  let positiveSum = 0;
  let negativeSum = 0;
  let neutralSum = 0;
  let sentimentCount = 0;

  for (const article of articles) {
    if (article.sentiment) {
      positiveSum += article.sentiment.pos ?? 0;
      negativeSum += article.sentiment.neg ?? 0;
      neutralSum += article.sentiment.neu ?? 0;
      sentimentCount += 1;
    }
  }

  // Avoid division by zero when no sentiment data exists
  if (sentimentCount === 0) {
    return { positive: 0, neutral: 1, negative: 0 };
  }

  return {
    positive: +(positiveSum / sentimentCount).toFixed(ANALYSIS_CONSTANTS.SENTIMENT_PRECISION),
    neutral: +(neutralSum / sentimentCount).toFixed(ANALYSIS_CONSTANTS.SENTIMENT_PRECISION),
    negative: +(negativeSum / sentimentCount).toFixed(ANALYSIS_CONSTANTS.SENTIMENT_PRECISION),
  };
}

/**
 * Aggregates and ranks sources by article count.
 * Limits results to top sources to keep data manageable.
 *
 * @param articles - Array of news articles
 * @returns Array of sources sorted by count (descending), limited to top N
 */
export function aggregateTopSources(articles: NewsArticle[]): SourceCount[] {
  const sourceCounts = new Map<string, number>();

  for (const article of articles) {
    const sourceName = article.source_title || article.source?.id || DEFAULT_VALUES.UNKNOWN_SOURCE_NAME;
    sourceCounts.set(sourceName, (sourceCounts.get(sourceName) || 0) + 1);
  }

  return Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, ANALYSIS_CONSTANTS.TOP_SOURCES_LIMIT);
}

/**
 * Aggregates articles by source country and ranks by count.
 * Used to understand geographic distribution of coverage.
 *
 * @param articles - Array of news articles
 * @returns Array of countries sorted by article count (descending)
 */
export function aggregateGeographicDistribution(articles: NewsArticle[]): GeographicCount[] {
  const countryCounts = new Map<string, number>();

  for (const article of articles) {
    const countryCode = article.source?.country || DEFAULT_VALUES.UNKNOWN_COUNTRY_CODE;
    countryCounts.set(countryCode, (countryCounts.get(countryCode) || 0) + 1);
  }

  return Array.from(countryCounts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Selects representative articles for AI analysis.
 * Uses recency as a simple ranking heuristic - newer articles are more relevant.
 *
 * @param articles - Array of news articles
 * @returns Array of article summaries, sorted by publication date (newest first), limited to N articles
 */
export function selectRepresentativeArticles(articles: NewsArticle[]): ArticleSummary[] {
  return articles
    .slice()
    .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime())
    .slice(0, ANALYSIS_CONSTANTS.REPRESENTATIVE_ARTICLES_LIMIT)
    .map((article) => ({
      title: article.title,
      description: article.description,
      source: article.source_title,
      publishedDate: article.pub_date,
      sentiment: (article.sentiment?.pos || 0) - (article.sentiment?.neg || 0),
      articleUrl: article.article_link,
    }));
}

/**
 * Aggregates political leaning distribution across articles.
 * Normalizes granular leaning values into four categories: left, center, right, nonpartisan.
 * Returns counts and percentage shares for each category.
 *
 * @param articles - Array of news articles
 * @returns Array of political leaning distributions with counts and shares
 */
export function aggregatePoliticalLeaning(articles: NewsArticle[]): PoliticalLeaningCount[] {
  const leaningCounts = new Map<PoliticalLeaning, number>();

  // Initialize all categories to 0
  leaningCounts.set('left', 0);
  leaningCounts.set('center_left', 0);
  leaningCounts.set('center', 0);
  leaningCounts.set('right', 0);
  leaningCounts.set('center_right', 0);
  leaningCounts.set('far_left', 0);
  leaningCounts.set('far_right', 0);
  leaningCounts.set('nonpartisan', 0);

  // Count articles by normalized leaning
  for (const article of articles) {
    let politicalLeaning = article.source?.political_leaning;

    if (!politicalLeaning) {
      politicalLeaning = 'nonpartisan';
    }

    leaningCounts.set(politicalLeaning, (leaningCounts.get(politicalLeaning) || 0) + 1);
  }

  const total = articles.length || 1; // Avoid division by zero

  // Convert to array with shares
  return Array.from(leaningCounts.entries())
    .map(([leaning, count]) => ({
      leaning,
      count,
      share: +(count / total).toFixed(4), // 4 decimal places for precision
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Aggregates keywords from articles and returns top N by frequency.
 * Normalizes keywords (lowercase, trimmed) and counts occurrences.
 *
 * @param articles - Array of news articles
 * @param limit - Maximum number of keywords to return (default: 10)
 * @returns Array of keywords sorted by count (descending), limited to N
 */
export function aggregateTopKeywords(articles: NewsArticle[], limit = 10): KeywordCount[] {
  const keywordCounts = new Map<string, number>();

  for (const article of articles) {
    if (article.keywords && Array.isArray(article.keywords)) {
      for (const keyword of article.keywords) {
        // Normalize: lowercase and trim
        const normalized = keyword.toLowerCase().trim();
        if (normalized) {
          keywordCounts.set(normalized, (keywordCounts.get(normalized) || 0) + 1);
        }
      }
    }
  }

  // Convert to array, sort by count descending, and limit
  return Array.from(keywordCounts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Generates a cache key for processed topic analysis.
 *
 * @param params - Topic analysis parameters
 * @returns Unique cache key string
 */
export function generateTopicAnalysisCacheKey(params: {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
}): string {
  const { topic, startDate, endDate, language } = params;
  const normalizedTopic = normalizeSearchQuery(topic);
  return `processed:${normalizedTopic}:${startDate}:${endDate}:${language || ''}`;
}
