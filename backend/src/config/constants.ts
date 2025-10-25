/**
 * Application-wide constants
 */

/**
 * News API pagination and data fetching limits
 */
export const NEWS_API_CONSTANTS = {
  /**
   * Maximum articles per page supported by the News API.
   * Using the maximum reduces the number of API calls needed.
   */
  MAX_ARTICLES_PER_PAGE: 100,

  /**
   * Safety limit to prevent infinite loops when fetching paginated data.
   * Protects against API issues or unexpectedly large date ranges.
   */
  MAX_PAGINATION_LOOPS: 20,
} as const;

/**
 * Analysis and aggregation limits
 */
export const ANALYSIS_CONSTANTS = {
  /**
   * Number of top sources to include in analysis results.
   * Balances comprehensiveness with UI readability.
   */
  TOP_SOURCES_LIMIT: 10,

  /**
   * Number of representative articles to include in analysis.
   * Provides enough context for AI analysis without overwhelming the prompt.
   */
  REPRESENTATIVE_ARTICLES_LIMIT: 20,

  /**
   * Number of decimal places for sentiment score averages.
   * Three decimals provide sufficient precision for analysis.
   */
  SENTIMENT_PRECISION: 3,
} as const;

/**
 * Default values for missing or unknown data
 */
export const DEFAULT_VALUES = {
  /**
   * Fallback country code for articles with unknown source country.
   * ISO 3166-1 alpha-2 code for "user-assigned" territory.
   */
  UNKNOWN_COUNTRY_CODE: 'ZZ',

  /**
   * Fallback source name when no source information is available.
   */
  UNKNOWN_SOURCE_NAME: 'Unknown',
} as const;

/**
 * Date formatting constants
 */
export const DATE_CONSTANTS = {
  /**
   * Number of months in a year (for date calculations)
   */
  MONTHS_OFFSET: 1,

  /**
   * Minimum number of digits for month/day formatting (adds leading zeros)
   */
  DATE_PADDING: 2,

  /**
   * Character used to pad month/day values
   */
  PADDING_CHARACTER: '0',
} as const;

/**
 * Demo mode constants
 */
export const DEMO_CONSTANTS = {
  /**
   * Suffix to detect demo mode (e.g., "artificial intelligence-demo")
   */
  SUFFIX: '-demo',

  /**
   * Cache TTL for demo data (7 days)
   */
  CACHE_TTL: 86400 * 7,

  /**
   * Supported demo topics
   */
  SUPPORTED_TOPICS: ['artificial intelligence', '"artificial intelligence"'],
} as const;
