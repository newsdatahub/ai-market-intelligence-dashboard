import { ProcessedTopicData, NewsArticle } from '../types';
import topicAnalysisData from '../demo-data/artificial-intelligence/topic-analysis.json';
import contextAnalysisData from '../demo-data/artificial-intelligence/context-analysis.json';
import contextGeoData from '../demo-data/artificial-intelligence/context-geo.json';
import contextSpikeData from '../demo-data/artificial-intelligence/context-spike.json';
import searchTopicData from '../demo-data/artificial-intelligence/search-topic.json';
import countryCoverageData from '../demo-data/artificial-intelligence/country-coverage.json';

/**
 * Demo mode configuration and utilities.
 * Allows users to try the application with precached data using the "-demo" suffix.
 */

export const DEMO_SUFFIX = '-demo';
export const DEMO_CACHE_TTL = 86400 * 7; // 7 days

/**
 * Checks if a topic string is in demo mode
 * @param topic - Topic string to check
 * @returns true if topic ends with -demo suffix
 *
 * @example
 * isDemoMode('artificial intelligence-demo') // true
 * isDemoMode('artificial intelligence') // false
 */
export function isDemoMode(topic: string): boolean {
  return topic.trim().endsWith(DEMO_SUFFIX);
}

/**
 * Extracts the base topic from a demo topic string
 * @param topic - Topic string with -demo suffix
 * @returns Base topic without the suffix
 *
 * @example
 * extractDemoTopic('artificial intelligence-demo') // 'artificial intelligence'
 */
export function extractDemoTopic(topic: string): string {
  return topic.replace(DEMO_SUFFIX, '').trim();
}

/**
 * Gets list of supported demo topics
 * @returns Array of supported demo topic names (without -demo suffix)
 */
export function getSupportedDemoTopics(): string[] {
  return ['artificial intelligence'];
}

/**
 * Gets demo topic analysis data
 * @param topic - Topic with -demo suffix
 * @param startDate - Start date for the analysis (used to match date range)
 * @param endDate - End date for the analysis (used to match date range)
 * @returns ProcessedTopicData or null if not available
 */
export function getDemoTopicData(
  topic: string,
  startDate: string,
  endDate: string
): ProcessedTopicData | null {
  const baseTopic = extractDemoTopic(topic).toLowerCase();

  if (baseTopic === 'artificial intelligence' || baseTopic === '"artificial intelligence"') {
    const data = topicAnalysisData.topic;
    console.log('Returning data for', baseTopic)
    // Return the data with the requested date range
    return {
      ...data,
      topic: baseTopic,
      dateRange: { start: startDate, end: endDate }
    };
  }

  return null;
}

/**
 * Gets demo main report (AI-Powered News Brief)
 * @param topic - Topic with -demo suffix
 * @returns Report markdown string or null
 */
export function getDemoMainReport(topic: string): string | null {
  const baseTopic = extractDemoTopic(topic).toLowerCase();

  if (baseTopic === 'artificial intelligence' || baseTopic === '"artificial intelligence"') {
    return contextAnalysisData.report;
  }

  return null;
}

/**
 * Gets demo geographic report (Regional Insights)
 * @param topic - Topic with -demo suffix
 * @returns Report markdown string or null
 */
export function getDemoGeoReport(topic: string): string | null {
  const baseTopic = extractDemoTopic(topic).toLowerCase();

  if (baseTopic === 'artificial intelligence' || baseTopic === '"artificial intelligence"') {
    return contextGeoData.summary;
  }

  return null;
}

/**
 * Gets demo timeline report (Timeline Insights)
 * @param topic - Topic with -demo suffix
 * @returns Report markdown string or null
 */
export function getDemoTimelineReport(topic: string): string | null {
  const baseTopic = extractDemoTopic(topic).toLowerCase();

  if (baseTopic === 'artificial intelligence' || baseTopic === '"artificial intelligence"') {
    return contextSpikeData.summary;
  }

  return null;
}

/**
 * Gets demo articles for search/timeline
 * @param topic - Topic with -demo suffix
 * @returns NewsArticle array or empty array
 */
export function getDemoSearchArticles(topic: string): NewsArticle[] {
  const baseTopic = extractDemoTopic(topic).toLowerCase();

  if (baseTopic === 'artificial intelligence' || baseTopic === '"artificial intelligence"') {
    return (searchTopicData as any).data || [];
  }

  return [];
}

/**
 * Gets demo articles for geographic coverage
 * @param topic - Topic with -demo suffix
 * @returns NewsArticle array or empty array
 */
export function getDemoCountryArticles(topic: string): NewsArticle[] {
  const baseTopic = extractDemoTopic(topic).toLowerCase();

  if (baseTopic === 'artificial intelligence' || baseTopic === '"artificial intelligence"') {
    return (countryCoverageData as any).data || [];
  }

  return [];
}

/**
 * Generates a demo cache key with special prefix
 * @param key - Original cache key
 * @returns Demo-prefixed cache key
 */
export function getDemoCacheKey(key: string): string {
  return `demo:${key}`;
}
