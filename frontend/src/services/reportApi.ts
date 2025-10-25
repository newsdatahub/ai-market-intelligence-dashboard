import {
  GenerateReportRequest,
  GenerateReportResponse,
  AnalyzeContextRequest,
  AnalyzeContextResponse,
  ReportApiError,
} from '../types/report';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Parses error response from backend API.
 * Handles both JSON error objects and plain text responses.
 *
 * @param response - The failed HTTP response
 * @returns Error message string
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      return errorData.message || 'An unexpected error occurred';
    }
    return await response.text();
  } catch {
    return 'An unexpected error occurred';
  }
}

/**
 * Makes an HTTP request with proper error handling.
 *
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws {ReportApiError} When the request fails
 */
async function makeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new ReportApiError(errorMessage, response.status, endpoint);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ReportApiError) {
      throw error;
    }

    // Network error or other fetch failure
    if (error instanceof TypeError) {
      throw new ReportApiError(
        'Network error: Please check your connection and try again',
        undefined,
        endpoint
      );
    }

    // Unknown error
    throw new ReportApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      undefined,
      endpoint
    );
  }
}

/**
 * Intelligence Report API service.
 * Handles generation of AI-powered intelligence reports and contextual analysis.
 */
export const reportApi = {
  /**
   * Generates a comprehensive intelligence report for a topic over a date range.
   *
   * @param params - Report generation parameters
   * @returns Intelligence report content
   * @throws {ReportApiError} When report generation fails
   *
   * @example
   * const report = await reportApi.generateReport({
   *   topic: 'artificial intelligence',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   language: 'en',
   *   reportType: 'custom'
   * });
   */
  async generateReport(params: GenerateReportRequest): Promise<GenerateReportResponse> {
    return makeRequest<GenerateReportResponse>('/api/intelligence/report', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Analyzes articles in a specific context (timeline spike, geographic, or deep dive).
   *
   * @param params - Context analysis parameters
   * @returns Contextual analysis summary
   * @throws {ReportApiError} When analysis fails
   *
   * @example
   * // Timeline spike analysis
   * const analysis = await reportApi.analyzeContext({
   *   context: 'spike',
   *   topic: 'climate change',
   *   articles: articlesList
   * });
   *
   * @example
   * // Geographic context analysis
   * const geoAnalysis = await reportApi.analyzeContext({
   *   context: 'geo',
   *   topic: 'climate change',
   *   country: 'US',
   *   articles: articlesList
   * });
   */
  async analyzeContext(params: AnalyzeContextRequest): Promise<AnalyzeContextResponse> {
    return makeRequest<AnalyzeContextResponse>('/api/intelligence/context-analysis', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
