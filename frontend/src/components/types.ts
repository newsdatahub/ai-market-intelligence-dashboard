import { NewsArticle } from '../types';

export interface LineChartPoint {
  date: string;
  [brand: string]: number | string;
}

export interface ArticleListProps {
  articles: NewsArticle[];
  onSelect: (a: NewsArticle) => void;
}

