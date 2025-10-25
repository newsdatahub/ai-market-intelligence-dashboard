import { Request, Response } from 'express';

export interface AnalyzeTopicRequestQuery {
  topic: string;
  startDate?: string;
  endDate?: string;
  language?: string;
}

export interface GetArticlesRequestQuery {
  topic: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  country?: string;
}

export interface GetRelatedRequestParams {
  article_id: string;
}

export interface GetRelatedRequestQuery {
  per_page?: string;
  fields?: string;
}

export interface GetByCountryRequestQuery {
  topic: string;
  country: string;
  startDate?: string;
  endDate?: string;
  language?: string;
}

export type AnalyzeTopicRequest = Request<{}, {}, AnalyzeTopicRequestQuery>;
export type AnalyzeTopicResponse = Response;

export type GetArticlesRequest = Request<{}, {}, {}, GetArticlesRequestQuery>;
export type GetArticlesResponse = Response;

export type GetRelatedRequest = Request<GetRelatedRequestParams, {}, {}, GetRelatedRequestQuery>;
export type GetRelatedResponse = Response;

export type GetByCountryRequest = Request<{}, {}, {}, GetByCountryRequestQuery>;
export type GetByCountryResponse = Response;
