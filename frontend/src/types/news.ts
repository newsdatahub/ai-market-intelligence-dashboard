import { NewsArticle, ProcessedTopicData } from './index';

/**
 * Request parameters for analyzing topic coverage
 */
export interface AnalyzeTopicRequest {
  topic: string;
  startDate?: string;
  endDate?: string;
  language?: string;
}

/**
 * Response from topic analysis
 */
export interface AnalyzeTopicResponse {
  topic: ProcessedTopicData;
}

/**
 * Request parameters for searching articles
 */
export interface SearchArticlesRequest {
  topic: string;
  date?: string; // single day
  start_date?: string;
  end_date?: string;
  country?: string;
  language?: string;
}

/**
 * Response from article search
 */
export interface SearchArticlesResponse {
  topic: string;
  start_date: string;
  end_date: string;
  count: number;
  data: NewsArticle[];
}

/**
 * Request parameters for getting articles by country
 */
export interface GetArticlesByCountryRequest {
  topic: string;
  country: string;
  startDate?: string;
  endDate?: string;
  language?: string;
}

/**
 * Response from getting articles by country
 */
export interface GetArticlesByCountryResponse {
  topic: string;
  country: string;
  startDate: string;
  endDate: string;
  count: number;
  data: NewsArticle[];
}

/**
 * Response from getting related articles
 */
export interface GetRelatedArticlesResponse {
  data: NewsArticle[];
}

/**
 * Custom error class for news API errors
 */
export class NewsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'NewsApiError';
  }
}
