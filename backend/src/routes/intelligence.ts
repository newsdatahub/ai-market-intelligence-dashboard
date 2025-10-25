import { Router } from 'express';
import { cache } from '../services/cacheService';
import { analyzeTopicCoverage } from '../services/topicAnalysisService';
import { calculateCacheTTL } from '../utils/cacheUtils';
import { generateReportCacheKey, generateExplainCacheKey } from '../utils/reportUtils';
import { createIntelligenceReportMessages, createContextExplanationMessages } from '../utils/promptUtils';
import { generateAIReport } from '../services/aiReportService';
import { logger } from '../utils/logger';
import {
  GenerateReportRequest,
  GenerateReportResponse,
  ExplainContextRequest,
  ExplainContextResponse,
} from '../types/intelligence';
import {
  isDemoMode,
  getDemoMainReport,
  getDemoGeoReport,
  getDemoTimelineReport,
  getDemoCacheKey,
  DEMO_CACHE_TTL,
} from '../services/demoDataService';

const router = Router();

/**
 * POST /intelligence/report
 *
 * Generates a comprehensive AI-powered report for a given topic.
 * Analyzes news coverage and produces a professional report with executive summary,
 * sentiment analysis, trend analysis, key stories, and strategic insights.
 *
 * @body {string} topic - The topic to generate a report for (required)
 * @body {string} startDate - Start date in YYYY-MM-DD format (required)
 * @body {string} endDate - End date in YYYY-MM-DD format (required)
 * @body {string} language - Language code for article filtering (optional)
 * @body {ReportType} reportType - Type of report: 'daily' | 'weekly' | 'custom' (optional)
 *
 * @returns {Object} Generated report with cached flag
 * @returns {string} report - The generated markdown-formatted report
 * @returns {boolean} cached - Whether the report was retrieved from cache
 */
router.post('/report', async (req: GenerateReportRequest, res: GenerateReportResponse) => {
  try {
    const { topic, startDate, endDate, language } = req.body;
    if (!topic || !startDate || !endDate) {
      return res.status(400).json({ error: 'Bad Request', message: 'topic, startDate, endDate required' });
    }

    // Check for demo mode
    if (isDemoMode(topic)) {
      const demoReport = getDemoMainReport(topic);
      if (demoReport) {
        const demoCacheKey = getDemoCacheKey(
          generateReportCacheKey({ topic, startDate, endDate, language })
        );
        cache.set(demoCacheKey, demoReport, DEMO_CACHE_TTL);
        return res.json({ report: demoReport, cached: false });
      }
    }

    // Check cache first
    const cacheKey = generateReportCacheKey({ topic, startDate, endDate, language });
    const cachedReport = cache.get<string>(cacheKey);
    if (cachedReport) {
      return res.json({ report: cachedReport, cached: true });
    }

    // Analyze topic coverage
    const processedData = await analyzeTopicCoverage({ topic, startDate, endDate, language });

    // Generate AI report
    const messages = createIntelligenceReportMessages(processedData);

    const report = await generateAIReport(messages);

    // Cache only after successful generation
    const cacheTTL = calculateCacheTTL(endDate);
    cache.set(cacheKey, report, cacheTTL);

    res.json({ report, cached: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to generate report', {
      error: errorMessage,
      stack: errorStack,
      topic: req.body.topic,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate report. Please try again later.',
    });
  }
});

/**
 * POST /intelligence/context-analysis
 *
 * Generates an AI-powered contextual analysis for a set of articles.
 * Provides deep-dive intelligence on specific events, spikes in coverage,
 * or geographic patterns with primary events, key stories, and strategic insights.
 *
 * @body {string} context - Type of analysis: 'spike' (timeline), 'geo' (geographic), or 'deep_dive' (required)
 * @body {string} topic - The topic being analyzed (required)
 * @body {string} date - Specific date for spike analysis in YYYY-MM-DD format (optional)
 * @body {string} country - Two-letter country code for geographic analysis (optional)
 * @body {Array<Object>} articles - Array of articles to analyze (required, max 20 used)
 * @body {string} articles[].id - Article ID (optional)
 * @body {string} articles[].title - Article title (required)
 * @body {string} articles[].description - Article description (optional)
 * @body {string} articles[].source_title - Source name (optional)
 * @body {string} articles[].pub_date - Publication date (optional)
 * @body {string} articles[].article_link - Article URL (optional)
 *
 * @returns {Object} Generated contextual analysis with cached flag
 * @returns {string} summary - The generated markdown-formatted analysis report
 * @returns {boolean} cached - Whether the analysis was retrieved from cache
 */
router.post('/context-analysis', async (req: ExplainContextRequest, res: ExplainContextResponse) => {
  try {
    const { context, topic, date, country, articles } = req.body;
    logger.info('[context-analysis] Received request', {
      context,
      topic,
      date,
      country,
      articlesCount: articles?.length,
    });

    if (!context || !topic || !Array.isArray(articles) || articles.length === 0) {
      logger.warn('[context-analysis] Bad request - missing required fields', {
        hasContext: !!context,
        hasTopic: !!topic,
        isArray: Array.isArray(articles),
        articlesLength: articles?.length,
      });
      return res.status(400).json({ error: 'Bad Request', message: 'context, topic, and articles are required' });
    }

    // Check for demo mode - return prepopulated report immediately
    if (isDemoMode(topic)) {
      let demoReport: string | null = null;

      if (context === 'geo') {
        demoReport = getDemoGeoReport(topic);
      } else if (context === 'spike') {
        demoReport = getDemoTimelineReport(topic);
      }

      if (demoReport) {
        logger.info('[context-analysis] Returning prepopulated demo report', { context });
        return res.json({ summary: demoReport, cached: false });
      }
    }

    // Check cache first
    const articleKey = articles.map((article) => article.id || article.title).join(',');
    const cacheKey = generateExplainCacheKey({ context, topic, date, country, articleKey });
    const cachedSummary = cache.get<string>(cacheKey);
    if (cachedSummary) {
      logger.info('[context-analysis] Returning cached summary', { cacheKey });
      return res.json({ summary: cachedSummary, cached: true });
    }

    // Generate AI context analysis with aggregated metrics
    logger.info('[context-analysis] Generating new AI report', { articlesCount: articles.length });
    const messages = createContextExplanationMessages({ context, topic, date, country, articles });
    const summary = await generateAIReport(messages);
    logger.info('[context-analysis] AI report generated successfully', { summaryLength: summary?.length });

    // Cache only after successful generation
    const cacheTTL = calculateCacheTTL(date);
    cache.set(cacheKey, summary, cacheTTL);

    res.json({ summary, cached: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to generate context analysis', {
      error: errorMessage,
      stack: errorStack,
      context: req.body.context,
      topic: req.body.topic,
      date: req.body.date,
      country: req.body.country,
      articlesCount: req.body.articles?.length,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate context analysis. Please try again later.',
    });
  }
});

export default router;

