export type PoliticalLeaning =
  | 'left'
  | 'center_left'
  | 'center'
  | 'center_right'
  | 'right'
  | 'far_left'
  | 'far_right'
  | 'unknown';

export type SourceType =
  | 'digital_native'
  | 'press_release'
  | 'newspaper'
  | 'magazine'
  | 'mainstream_news'
  | 'blog'
  | 'specialty_news'
  | 'unknown';

export type SentimentCategory = 'positive' | 'neutral' | 'negative';

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
  pub_date: string;
  creator?: string | null;
  content?: string;
  media_url?: string | null;
  media_type?: string | null;
  language: string;
  sentiment?: Sentiment;
  source?: SourceMetadata;
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

export type ApiTier = 'free' | 'developer' | 'business' | 'enterprise';

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
  topArticles: ArticleSummary[];
  apiTier?: ApiTier;
}
