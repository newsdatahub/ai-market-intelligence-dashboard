/**
 * Custom error class for external API errors (OpenAI, NewsDataHub, etc.).
 * Includes status code and optional response details.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly responseText?: string;

  constructor(message: string, status: number, responseText?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseText = responseText;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
