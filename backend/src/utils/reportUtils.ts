import { normalizeSearchQuery } from './helpers';

/**
 * Generates a cache key for report generation based on report parameters
 */
export function generateReportCacheKey(params: {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
}): string {
  const { topic, startDate, endDate, language } = params;
  const normalizedTopic = normalizeSearchQuery(topic);
  return `ai:report:${normalizedTopic}:${startDate}:${endDate}:${language || ''}`;
}

/**
 * Generates a cache key for context explanation based on context parameters
 */
export function generateExplainCacheKey(params: {
  context: string;
  topic: string;
  date?: string;
  country?: string;
  articleKey: string;
}): string {
  const { context, topic, date, country, articleKey } = params;
  const normalizedTopic = normalizeSearchQuery(topic);
  return `ai:${context}:${normalizedTopic}:${date || ''}:${country || ''}:${articleKey}`;
}

/**
 * Formats sentiment value into human-readable string
 */
export function formatSentiment(sentiment: number): string {
  if (sentiment > 0) return 'Positive';
  if (sentiment < 0) return 'Negative';
  return 'Neutral';
}

/**
 * Formats a single article for display in the report
 */
export function formatArticleForReport(
  article: {
    title: string;
    source: string;
    publishedDate: string;
    sentiment: number;
    description: string;
    articleUrl: string;
  },
  index: number
): string {
  return `
${index + 1}. "${article.title}"
   Source: ${article.source} | Date: ${article.publishedDate} | Sentiment: ${formatSentiment(article.sentiment)}
   Summary: ${article.description}
   URL: ${article.articleUrl}
`;
}

/**
 * Formats an array of articles for display in the report
 */
export function formatArticlesListForReport(
  articles: Array<{
    title: string;
    source: string;
    publishedDate: string;
    sentiment: number;
    description: string;
    articleUrl: string;
  }>
): string {
  return articles.map((article, index) => formatArticleForReport(article, index)).join('\n');
}

/**
 * Formats a single article for context explanation
 */
export function formatArticleForExplanation(
  article: {
    title: string;
    source_title?: string;
    pub_date?: string;
    article_link?: string;
    description?: string;
  },
  index: number
): string {
  return `Article ${index + 1}: "${article.title}"
   Source: ${article.source_title || 'Unknown'}
   Date: ${article.pub_date || 'N/A'}
   URL: ${article.article_link || 'N/A'}
   Summary: ${article.description || 'No description'}`;
}

/**
 * Formats an array of articles for context explanation
 */
export function formatArticlesListForExplanation(
  articles: Array<{
    title: string;
    source_title?: string;
    pub_date?: string;
    article_link?: string;
    description?: string;
  }>
): string {
  return articles
    .slice(0, 20)
    .map((article, index) => formatArticleForExplanation(article, index))
    .join('\n\n');
}
