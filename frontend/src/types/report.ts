import { NewsArticle } from './index';

/**
 * Type of intelligence report to generate
 */
export type ReportType = 'daily' | 'weekly' | 'custom';

/**
 * Context type for contextual analysis
 */
export type AnalysisContext = 'spike' | 'geo' | 'deep_dive';

/**
 * Request parameters for generating an intelligence report
 */
export interface GenerateReportRequest {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
  reportType?: ReportType;
}

/**
 * Response from generating an intelligence report
 */
export interface GenerateReportResponse {
  report: string;
}

/**
 * Request parameters for timeline spike analysis
 */
export interface AnalyzeTimelineSpikeRequest {
  context: 'spike';
  topic: string;
  date?: string;
  articles: NewsArticle[];
  apiTier?: 'free' | 'developer' | 'enterprise';
}

/**
 * Request parameters for geographic coverage analysis
 */
export interface AnalyzeGeographicContextRequest {
  context: 'geo';
  topic: string;
  country: string;
  articles: NewsArticle[];
  apiTier?: 'free' | 'developer' | 'enterprise';
}

/**
 * Request parameters for deep dive analysis
 */
export interface AnalyzeDeepDiveRequest {
  context: 'deep_dive';
  topic: string;
  articles: NewsArticle[];
  apiTier?: 'free' | 'developer' | 'enterprise';
}

/**
 * Union type for all context analysis requests
 */
export type AnalyzeContextRequest =
  | AnalyzeTimelineSpikeRequest
  | AnalyzeGeographicContextRequest
  | AnalyzeDeepDiveRequest;

/**
 * Response from context analysis
 */
export interface AnalyzeContextResponse {
  summary: string;
}

/**
 * Custom error class for report API errors
 */
export class ReportApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ReportApiError';
  }
}
