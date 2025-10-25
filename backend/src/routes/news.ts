import { Router } from 'express';
import { newsService } from '../services/newsService';
import { AnalyzeTopicResponse } from '../types';
import { clampLanguage, getLast7Days, upperCountry } from '../utils/helpers';
import { analyzeTopicCoverage } from '../services/topicAnalysisService';
import { fetchAllTopicArticles, filterArticlesByCountry, getCachedOrFetchArticles } from '../utils/newsUtils';
import { logger } from '../utils/logger';
import {
  AnalyzeTopicRequest,
  GetArticlesRequest,
  GetArticlesResponse,
  GetRelatedRequest,
  GetRelatedResponse,
  GetByCountryRequest,
  GetByCountryResponse,
} from '../types/news';
import {
  isDemoMode,
  getDemoSearchArticles,
  getDemoCountryArticles,
  getSupportedDemoTopics,
  getDemoTopicData,
} from '../services/demoDataService';

const router = Router();

/**
 * POST /news/topic-analysis
 *
 * Analyzes news coverage for a given topic over a date range.
 * Returns aggregated statistics including sentiment analysis, geographic distribution,
 * top sources, mention trends by day, and representative articles.
 *
 * @body {string} topic - The topic to analyze (required)
 * @body {string} startDate - Start date in YYYY-MM-DD format (defaults to 7 days ago)
 * @body {string} endDate - End date in YYYY-MM-DD format (defaults to today)
 * @body {string} language - Language code (defaults to 'en')
 *
 * @returns {ProcessedTopicData} Comprehensive analysis of topic coverage
 */
router.post('/topic-analysis', async (req: AnalyzeTopicRequest, res) => {
  try {
    let { topic, startDate, endDate, language } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'topic is required' });
    }
    if (!startDate || !endDate) {
      const dateRange = getLast7Days();
      startDate = dateRange.start;
      endDate = dateRange.end;
    }
    language = clampLanguage(language || 'en');

    // Validate demo topic if in demo mode
    if (isDemoMode(topic)) {
      const demoData = getDemoTopicData(topic, startDate, endDate);
      if (!demoData) {
        const supportedDemos = getSupportedDemoTopics();
        return res.status(400).json({
          error: 'Demo topic not found',
          message: 'Demo topic not supported',
          supportedDemos
        });
      }
    }

    const processedData = await analyzeTopicCoverage({ topic, startDate, endDate, language });

    const response: AnalyzeTopicResponse = { topic: processedData };

    res.json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to analyze topic', {
      error: errorMessage,
      stack: errorStack,
      topic: req.body.topic,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    // Check if this is a missing API configuration error
    const isConfigError = errorMessage.includes('Missing API configuration');

    res.status(500).json({
      error: isConfigError ? 'Configuration Error' : 'Internal Server Error',
      message: isConfigError ? errorMessage : 'Failed to analyze topic coverage. Please try again later.',
    });
  }
});

/**
 * GET /news/search
 *
 * Searches for news articles matching a topic within a date range.
 * Fetches all available articles using cursor pagination.
 *
 * @query {string} topic - The search topic (required)
 * @query {string} date - Single date for both start and end (YYYY-MM-DD format)
 * @query {string} start_date - Start date (YYYY-MM-DD format, defaults to 7 days ago)
 * @query {string} end_date - End date (YYYY-MM-DD format, defaults to today)
 * @query {string} country - Two-letter country code to filter by source country
 *
 * @returns {Object} Search results with topic, date range, count, and article data
 */
router.get('/search', async (req: GetArticlesRequest, res: GetArticlesResponse) => {
  try {
    const topic = (req.query.topic as string) || '';
    const date = req.query.date as string | undefined; // single day
    const startDate = (req.query.start_date as string) || (date ? date : undefined);
    const endDate = (req.query.end_date as string) || (date ? date : undefined);
    const country = upperCountry(req.query.country as string | undefined);

    if (!topic) return res.status(400).json({ error: 'Bad Request', message: 'topic is required' });

    const dateRange = getLast7Days();
    const finalStartDate = startDate || dateRange.start;
    const finalEndDate = endDate || dateRange.end;

    // Check for demo mode
    if (isDemoMode(topic)) {
      const demoArticles = getDemoSearchArticles(topic);
      return res.json({
        topic,
        start_date: finalStartDate,
        end_date: finalEndDate,
        count: demoArticles.length,
        data: demoArticles
      });
    }

    const articles = await fetchAllTopicArticles({
      topic,
      startDate: finalStartDate,
      endDate: finalEndDate,
      country,
    });

    res.json({ topic, start_date: finalStartDate, end_date: finalEndDate, count: articles.length, data: articles });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to fetch articles', {
      error: errorMessage,
      stack: errorStack,
      topic: req.query.topic,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      country: req.query.country,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search for articles. Please try again later.',
    });
  }
});

/**
 * GET /news/articles/:article_id/related
 *
 * Retrieves articles related to a specific article by ID.
 * Uses the news service's similarity/clustering algorithms to find related content.
 *
 * @param {string} article_id - The ID of the article to find related content for (required)
 * @query {number} per_page - Number of related articles to return
 * @query {string} fields - Comma-separated list of fields to return
 *
 * @returns {Object} Related articles with specified fields
 */
router.get('/articles/:article_id/related', async (req: GetRelatedRequest, res: GetRelatedResponse) => {
  try {
    const { article_id } = req.params;
    const articlesPerPage = Number((req.query.per_page as string) || 100);
    const fields = (req.query.fields as string) || 'title,pub_date,source_title,article_link,description';
    const relatedArticles = await newsService.getRelated(article_id, articlesPerPage, fields);
    res.json(relatedArticles);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to fetch related articles', {
      error: errorMessage,
      stack: errorStack,
      articleId: req.params.article_id,
      perPage: req.query.per_page,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch related articles. Please try again later.',
    });
  }
});

/**
 * GET /news/country-coverage
 *
 * Retrieves news articles about a topic filtered by the country of the news source.
 * Useful for analyzing geographic perspectives on a topic.
 *
 * @query {string} topic - The topic to search for (required)
 * @query {string} country - Two-letter country code to filter by source country (required)
 * @query {string} startDate - Start date in YYYY-MM-DD format (defaults to 7 days ago)
 * @query {string} endDate - End date in YYYY-MM-DD format (defaults to today)
 * @query {string} language - Language code (defaults to 'en')
 *
 * @returns {Object} Articles from sources in the specified country with count and metadata
 */
router.get('/country-coverage', async (req: GetByCountryRequest, res: GetByCountryResponse) => {
  try {
    const topic = (req.query.topic as string) || '';
    const country = upperCountry(req.query.country as string | undefined);
    const startDate = (req.query.startDate as string) || undefined;
    const endDate = (req.query.endDate as string) || undefined;
    const language = clampLanguage((req.query.language as string) || 'en');

    if (!topic || !country) {
      return res.status(400).json({ error: 'Bad Request', message: 'topic and country required' });
    }

    const dateRange = getLast7Days();
    const finalStartDate = startDate || dateRange.start;
    const finalEndDate = endDate || dateRange.end;

    // Check for demo mode
    if (isDemoMode(topic)) {
      const demoArticles = getDemoCountryArticles(topic);
      return res.json({
        topic,
        country,
        startDate: finalStartDate,
        endDate: finalEndDate,
        count: demoArticles.length,
        data: demoArticles
      });
    }

    // Get cached articles if available (from topic analysis), otherwise fetch
    const allArticles = await getCachedOrFetchArticles({
      topic,
      startDate: finalStartDate,
      endDate: finalEndDate,
      language,
    });

    // Filter by source.country on the backend to match how we count in geographic distribution
    const filteredArticles = filterArticlesByCountry(allArticles, country);

    res.json({
      topic,
      country,
      startDate: finalStartDate,
      endDate: finalEndDate,
      count: filteredArticles.length,
      data: filteredArticles,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to fetch articles by country', {
      error: errorMessage,
      stack: errorStack,
      topic: req.query.topic,
      country: req.query.country,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch country coverage. Please try again later.',
    });
  }
});

export default router;
