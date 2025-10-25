export type PoliticalLeaning =
  | 'left'
  | 'center_left'
  | 'center'
  | 'center_right'
  | 'right'
  | 'far_left'
  | 'far_right'
  | 'nonpartisan';

export type SourceType =
  | 'digital_native'
  | 'press_release'
  | 'newspaper'
  | 'magazine'
  | 'mainstream_news'
  | 'blog'
  | 'specialty_news';

export interface Sentiment {
  pos?: number;
  neg?: number;
  neu?: number;
}

export interface SourceMetadata {
  id?: string;
  country?: string; // 2-letter ISO
  political_leaning?: PoliticalLeaning;
  reliability_score?: number;
  type?: SourceType | string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source_title: string;
  source_link?: string;
  article_link: string;
  keywords?: string[];
  topics?: string[];
  description: string;
  pub_date: string; // ISO timestamp
  creator?: string | null;
  content?: string;
  media_url?: string | null;
  media_type?: string | null;
  language: string;
  sentiment?: Sentiment;
  source?: SourceMetadata;
}

export interface NewsResponse {
  data: NewsArticle[];
  total_results: number;
  per_page: number;
  next_cursor?: string | null;
}

export interface RelatedArticlesResponse {
  related_to: {
    id: string;
    title?: string;
    source_title?: string;
    article_link?: string;
    pub_date?: string;
  };
  count: number;
  data: NewsArticle[];
}

export interface ArticleSummary {
  title: string;
  description: string;
  source: string;
  publishedDate: string;
  sentiment: number;
  articleUrl: string;
}

export interface TopEntities {
  organizations: string[];
  people: string[];
  locations: string[];
}

export interface ProcessedTopicData {
  topic: string;
  totalMentions: number;
  dateRange: { start: string; end: string };
  sentimentAverage: { positive: number; neutral: number; negative: number };
  politicalLeaningDistribution: { leaning: string; count: number; share: number }[];
  topEntities: TopEntities;
  topKeywords: { keyword: string; count: number }[];
  mentionsByDay: Record<string, number>;
  topSources: { source: string; count: number }[];
  geographicDistribution: { country: string; count: number }[];
  topArticles: ArticleSummary[]; // up to 20
}

export interface AnalyzeTopicRequest {
  topic: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  language?: string; // 2-letter
}

export interface AnalyzeTopicResponse {
  topic: ProcessedTopicData;
}
