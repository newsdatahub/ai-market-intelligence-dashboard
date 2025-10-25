import { NewsArticle, NewsResponse, RelatedArticlesResponse } from '../types';

export interface NewsQueryParams {
  q?: string;
  country?: string; // e.g. "US"
  topic?: string[];
  language?: string; // e.g. "en"
  source?: string[];
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  per_page?: number;
  cursor?: string;
  political_leaning?: string[];
  source_type?: string[];
  exclude_topic?: string[];
  fields?: string; // comma-separated list
  media_type?: string; // comma-separated list
}

export interface NewsService {
  getNews(params: NewsQueryParams): Promise<NewsResponse>;
  getRelated(articleId: string, per_page?: number, fields?: string): Promise<RelatedArticlesResponse>;
}

export type AnalyzeAggregation = {
  byDay: Record<string, number>;
  sentiment: { positive: number; neutral: number; negative: number };
  sourceType: Record<string, number>;
  political: Record<string, number>;
  geography: Record<string, number>;
  total: number;
};
