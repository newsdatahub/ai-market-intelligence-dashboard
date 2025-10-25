/**
 * Analysis thresholds and configuration constants.
 * Centralizes magic numbers used throughout the application.
 */

/**
 * Minimum number of articles required for valid analysis.
 */
export const MIN_ARTICLES_FOR_ANALYSIS = 5;

/**
 * Number of days before and after a selected date for timeline analysis.
 */
export const TIMELINE_DATE_RANGE_DAYS = 1;

/**
 * Minimum number of articles before fetching related articles.
 */
export const MIN_ARTICLES_BEFORE_FETCHING_RELATED = 3;

/**
 * Maximum number of articles to include in AI analysis.
 */
export const MAX_ARTICLES_FOR_AI_ANALYSIS = 20;

/**
 * Maximum number of articles to fetch for related content.
 */
export const MAX_RELATED_ARTICLES_TO_FETCH = 2;

/**
 * Sentiment score thresholds for filtering.
 */
export const SENTIMENT_THRESHOLDS = {
  /**
   * Minimum score for positive/negative sentiment to be considered significant.
   */
  SIGNIFICANCE: 0.3,
} as const;
