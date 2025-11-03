import { withRetry, isRetryableHttpError } from './retryUtils';
import { HttpError } from '../errors';

/**
 * HTTP utility functions for making API requests
 */

/**
 * Response object that includes both data and headers
 */
export interface FetchResponse<T> {
  data: T;
  headers: Headers;
}

/**
 * Makes an HTTP GET request and returns the parsed JSON response.
 * This function does NOT handle caching - caching should be done by the caller.
 * Includes automatic retry logic with exponential backoff for transient failures.
 *
 * @param url - The full URL to fetch
 * @param headers - Optional headers to include in the request
 * @returns The parsed JSON response
 * @throws HttpError if the request fails or returns a non-OK status after all retries
 */
export async function fetchJSON<T>(url: string, headers?: Record<string, string>): Promise<T> {
  return withRetry(
    async () => {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpError(`HTTP ${response.status} error: ${errorText}`, response.status);
      }

      const data = (await response.json()) as T;
      return data;
    },
    {
      shouldRetry: isRetryableHttpError,
    },
    `HTTP GET ${url}`
  );
}

/**
 * Makes an HTTP GET request and returns both the parsed JSON response and response headers.
 * This variant is useful when you need to inspect response headers (e.g., for API tier detection).
 * Includes automatic retry logic with exponential backoff for transient failures.
 *
 * @param url - The full URL to fetch
 * @param headers - Optional headers to include in the request
 * @returns Object containing the parsed JSON data and response headers
 * @throws HttpError if the request fails or returns a non-OK status after all retries
 */
export async function fetchJSONWithHeaders<T>(url: string, headers?: Record<string, string>): Promise<FetchResponse<T>> {
  return withRetry(
    async () => {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpError(`HTTP ${response.status} error: ${errorText}`, response.status);
      }

      const data = (await response.json()) as T;
      return { data, headers: response.headers };
    },
    {
      shouldRetry: isRetryableHttpError,
    },
    `HTTP GET ${url}`
  );
}
