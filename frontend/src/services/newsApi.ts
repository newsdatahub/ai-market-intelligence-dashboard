import {
  AnalyzeTopicRequest,
  AnalyzeTopicResponse,
  SearchArticlesRequest,
  SearchArticlesResponse,
  GetArticlesByCountryRequest,
  GetArticlesByCountryResponse,
  GetRelatedArticlesResponse,
  NewsApiError,
} from '../types/news';
import { buildQueryString } from '../utils/helpers';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Parses error response from backend API.
 * Handles both JSON error objects and plain text responses.
 *
 * @param response - The failed HTTP response
 * @returns Error data object with message and optional fields
 */
async function parseErrorResponse(response: Response): Promise<{ message: string; data?: any }> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      return {
        message: errorData.message || 'An unexpected error occurred',
        data: errorData
      };
    }
    const text = await response.text();
    return { message: text };
  } catch {
    return { message: 'An unexpected error occurred' };
  }
}

/**
 * Makes an HTTP GET request with proper error handling.
 *
 * @param endpoint - API endpoint path
 * @returns Parsed JSON response
 * @throws {NewsApiError} When the request fails
 */
async function makeGetRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      const errorResponse = await parseErrorResponse(response);
      throw new NewsApiError(errorResponse.message, response.status, endpoint, errorResponse.data);
    }

    return response.json();
  } catch (error) {
    if (error instanceof NewsApiError) {
      throw error;
    }

    // Network error or other fetch failure
    if (error instanceof TypeError) {
      throw new NewsApiError(
        'Network error: Please check your connection and try again',
        undefined,
        endpoint
      );
    }

    // Unknown error
    throw new NewsApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      undefined,
      endpoint
    );
  }
}

/**
 * Makes an HTTP POST request with proper error handling.
 *
 * @param endpoint - API endpoint path
 * @param body - Request body object
 * @returns Parsed JSON response
 * @throws {NewsApiError} When the request fails
 */
async function makePostRequest<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorResponse = await parseErrorResponse(response);
      throw new NewsApiError(errorResponse.message, response.status, endpoint, errorResponse.data);
    }

    return response.json();
  } catch (error) {
    if (error instanceof NewsApiError) {
      throw error;
    }

    // Network error or other fetch failure
    if (error instanceof TypeError) {
      throw new NewsApiError(
        'Network error: Please check your connection and try again',
        undefined,
        endpoint
      );
    }

    // Unknown error
    throw new NewsApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      undefined,
      endpoint
    );
  }
}

/**
 * News API service.
 * Handles fetching and analyzing news articles from the backend.
 */
export const newsApi = {
  /**
   * Analyzes news coverage for a specific topic over a date range.
   *
   * @param params - Analysis parameters
   * @returns Comprehensive topic analysis with metrics
   * @throws {NewsApiError} When analysis fails
   *
   * @example
   * const analysis = await newsApi.analyzeTopic({
   *   topic: 'artificial intelligence',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   language: 'en'
   * });
   */
  async analyzeTopic(params: AnalyzeTopicRequest): Promise<AnalyzeTopicResponse> {
    return makePostRequest<AnalyzeTopicResponse>('/api/news/topic-analysis', params);
  },

  /**
   * Searches for news articles matching specified criteria.
   *
   * @param params - Search parameters
   * @returns List of matching articles
   * @throws {NewsApiError} When search fails
   *
   * @example
   * const articles = await newsApi.searchArticles({
   *   topic: 'climate change',
   *   start_date: '2024-01-01',
   *   end_date: '2024-01-31',
   *   language: 'en'
   * });
   */
  async searchArticles(params: SearchArticlesRequest): Promise<SearchArticlesResponse> {
    const queryString = buildQueryString(params as unknown as Record<string, unknown>);
    return makeGetRequest<SearchArticlesResponse>(`/api/news/search${queryString}`);
  },

  /**
   * Gets articles filtered by source country.
   *
   * @param params - Country filter parameters
   * @returns Articles from sources in the specified country
   * @throws {NewsApiError} When request fails
   *
   * @example
   * const usArticles = await newsApi.getArticlesByCountry({
   *   topic: 'elections',
   *   country: 'US',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31'
   * });
   */
  async getArticlesByCountry(params: GetArticlesByCountryRequest): Promise<GetArticlesByCountryResponse> {
    const queryString = buildQueryString(params as unknown as Record<string, unknown>);
    return makeGetRequest<GetArticlesByCountryResponse>(`/api/news/country-coverage${queryString}`);
  },

  /**
   * Gets articles related to a specific article.
   *
   * @param articleId - ID of the article to find related content for
   * @returns Related articles
   * @throws {NewsApiError} When request fails
   *
   * @example
   * const related = await newsApi.getRelatedArticles('article-123');
   */
  async getRelatedArticles(articleId: string): Promise<GetRelatedArticlesResponse> {
    return makeGetRequest<GetRelatedArticlesResponse>(`/api/news/articles/${articleId}/related`);
  },
};
