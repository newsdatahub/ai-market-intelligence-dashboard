import { NewsArticle } from '../types';

/**
 * API tier types
 */
export type ApiTier = 'free' | 'developer' | 'enterprise';

/**
 * Detects the API tier based on response headers.
 *
 * Detection logic:
 * 1. Check x-quota-limit header: if 100 AND x-quota-type is 'daily' => free tier
 * 2. Fallback: Check if topics/keywords contain placeholder text "Available on Developer plan and higher"
 *
 * @param headers - Response headers from the API
 * @param articles - Optional array of articles to check for placeholder values
 * @returns The detected API tier
 */
export function detectApiTier(headers: Headers, articles?: NewsArticle[]): ApiTier {
  // Primary detection: Check quota headers
  const quotaLimit = headers.get('x-quota-limit');
  const quotaType = headers.get('x-quota-type');

  if (quotaLimit === '100' && quotaType === 'daily') {
    return 'free';
  }

  // Fallback detection: Check for placeholder text in articles
  if (articles && articles.length > 0) {
    const hasPlaceholder = articles.some(article => {
      const topics = article.topics || [];
      const keywords = article.keywords || [];

      return (
        topics.some(t => t === 'Available on Developer plan and higher') ||
        keywords.some(k => k === 'Available on Developer plan and higher')
      );
    });

    if (hasPlaceholder) {
      return 'free';
    }
  }

  // Default to developer tier if no free tier indicators found
  return 'developer';
}

/**
 * Sanitizes article data for free tier by removing unavailable fields.
 * This prevents AI analysis from interpreting placeholder text as real data.
 *
 * @param article - The article to sanitize
 * @param tier - The detected API tier
 * @returns Sanitized article with unavailable fields removed/nullified
 */
export function sanitizeArticleForTier(article: NewsArticle, tier: ApiTier): NewsArticle {
  if (tier !== 'free') {
    return article;
  }

  // For free tier, remove fields that contain placeholder data
  const sanitized = { ...article };

  // Check and remove topics if they contain placeholder text
  if (sanitized.topics?.some(t => t === 'Available on Developer plan and higher')) {
    sanitized.topics = undefined;
  }

  // Check and remove keywords if they contain placeholder text
  if (sanitized.keywords?.some(k => k === 'Available on Developer plan and higher')) {
    sanitized.keywords = undefined;
  }

  // Remove sentiment object if not available (will be undefined or have placeholder values)
  if (!sanitized.sentiment || Object.keys(sanitized.sentiment).length === 0) {
    sanitized.sentiment = undefined;
  }

  // Remove source metadata if political_leaning is not available
  if (sanitized.source && !sanitized.source.political_leaning) {
    // Keep country but remove other unavailable fields
    sanitized.source = {
      country: sanitized.source.country,
    };
  }

  return sanitized;
}

/**
 * Sanitizes an array of articles based on API tier.
 *
 * @param articles - Array of articles to sanitize
 * @param tier - The detected API tier
 * @returns Array of sanitized articles
 */
export function sanitizeArticlesForTier(articles: NewsArticle[], tier: ApiTier): NewsArticle[] {
  if (tier !== 'free') {
    return articles;
  }

  return articles.map(article => sanitizeArticleForTier(article, tier));
}
