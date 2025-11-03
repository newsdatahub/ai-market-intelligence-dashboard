import { Request, Response } from 'express';

export type ReportType = 'daily' | 'weekly' | 'custom';

export interface GenerateReportRequestBody {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
  reportType?: ReportType;
}

export interface ExplainContextRequestBody {
  context: 'spike' | 'geo' | 'deep_dive';
  topic: string;
  date?: string;
  country?: string;
  articles: Array<{
    id?: string;
    title: string;
    description?: string;
    source_title?: string;
    pub_date?: string;
    article_link?: string;
  }>;
  apiTier?: 'free' | 'developer' | 'business' | 'enterprise';
}

export type GenerateReportRequest = Request<{}, {}, GenerateReportRequestBody>;
export type GenerateReportResponse = Response;

export type ExplainContextRequest = Request<{}, {}, ExplainContextRequestBody>;
export type ExplainContextResponse = Response;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
