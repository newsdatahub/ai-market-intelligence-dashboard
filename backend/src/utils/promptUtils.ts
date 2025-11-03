import { ChatMessage } from '../types/intelligence';
import { formatArticlesListForReport, formatArticlesListForExplanation } from './reportUtils';

interface ProcessedTopicData {
  topic: string;
  dateRange: { start: string; end: string };
  totalMentions: number;
  sentimentAverage: { positive: number; neutral: number; negative: number };
  politicalLeaningDistribution: Array<{ leaning: string; count: number; share: number }>;
  topEntities: {
    organizations: string[];
    people: string[];
    locations: string[];
  };
  topKeywords: Array<{ keyword: string; count: number }>;
  geographicDistribution: Array<{ country: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
  mentionsByDay: Record<string, number>;
  topArticles: Array<{
    title: string;
    source: string;
    publishedDate: string;
    sentiment: number;
    description: string;
    articleUrl: string;
  }>;
  apiTier?: 'free' | 'developer' | 'business' | 'enterprise';
}

/**
 * Generates the AI prompt for comprehensive report
 */
export function generateIntelligenceReportPrompt(processedData: ProcessedTopicData): string {
  const peakDay =
    Object.entries(processedData.mentionsByDay).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    processedData.dateRange.start;
  const peakCount = processedData.mentionsByDay[peakDay] || 0;

  // Build structured context JSON
  const sentimentSummary = {
    positive: +processedData.sentimentAverage.positive.toFixed(2),
    neutral: +processedData.sentimentAverage.neutral.toFixed(2),
    negative: +processedData.sentimentAverage.negative.toFixed(2),
  };

  const politicalLeaningDistribution: Record<string, number> = {};
  processedData.politicalLeaningDistribution.forEach((item) => {
    politicalLeaningDistribution[item.leaning] = +item.share.toFixed(2);
  });

  const topEntities = processedData.topEntities;

  // Use aggregated top keywords from backend (M1.5)
  const topKeywords = processedData.topKeywords.slice(0, 5).map((k) => k.keyword);

  // Low-coverage disclaimer check
  const lowCoverageDisclaimer = processedData.totalMentions < 30
    ? '\n\n**Note:** Coverage density is limited; insights may be preliminary.\n'
    : '';

  // Check if user is on free tier
  const isFreeTier = processedData.apiTier === 'free';

  // Build sentiment and political leaning sections only for paid tiers
  const sentimentSection = !isFreeTier ? (
    `=== SENTIMENT SUMMARY ===\n` +
    `${JSON.stringify(sentimentSummary, null, 2)}\n\n` +
    `Instructions for sentiment interpretation:\n` +
    `- If neutral sentiment exceeds 70%, state that coverage is mostly factual or balanced.\n` +
    `- If positive or negative shares exceed 25%, highlight the dominant tone and link it to potential drivers (companies, events, or policies).\n` +
    `- Avoid over-interpreting minor differences.\n\n` +
    `=== POLITICAL LEANING DISTRIBUTION ===\n` +
    `${JSON.stringify(politicalLeaningDistribution, null, 2)}\n\n` +
    `Instructions for political leaning interpretation:\n` +
    `- If one group contributes >50%, comment on potential bias or coverage skew.\n` +
    `- Otherwise, state that reporting appears ideologically diverse.\n\n`
  ) : '';

  const mediaToneBiasSection = !isFreeTier ? (
    `## Media Tone & Bias\n` +
    `Use the sentiment summary and political leaning distribution provided above.\n` +
    `Follow the interpretation instructions for each metric.\n\n`
  ) : (
    `## Media Tone & Bias\n` +
    `*Available on paid plans*\n\n`
  );

  return (
    `Generate a comprehensive Report based on the following structured data:\n\n` +
    `=== TOPIC METADATA ===\n` +
    `Topic: ${processedData.topic}\n` +
    `Time Period: ${processedData.dateRange.start} to ${processedData.dateRange.end}\n` +
    `Total Articles: ${processedData.totalMentions}\n` +
    `Peak Coverage Day: ${peakDay} (${peakCount} articles)\n\n` +
    sentimentSection +
    `=== TOP ENTITIES MENTIONED ===\n` +
    `Organizations: ${topEntities.organizations.join(', ') || 'None'}\n` +
    `People: ${topEntities.people.join(', ') || 'None'}\n` +
    `Locations: ${topEntities.locations.join(', ') || 'None'}\n\n` +
    `Instructions for entities:\n` +
    `- Include a one-sentence summary of the top entities mentioned.\n` +
    `- Highlight any notable relationships or cross-mentions across organizations, people, and locations.\n\n` +
    `=== QUANTITATIVE CONTEXT ===\n` +
    `Top Sources: ${processedData.topSources.slice(0, 3).map((s) => s.source).join(', ')}\n` +
    `Top Keywords: ${topKeywords.join(', ')}\n` +
    `Geographic Distribution (top 5): ${processedData.geographicDistribution.slice(0, 5).map((g) => `${g.country} (${g.count})`).join(', ')}\n\n` +
    `=== TOP STORIES (representative sample) ===\n` +
    formatArticlesListForReport(processedData.topArticles) +
    `\n\n=== REPORT STRUCTURE (REQUIRED) ===\n` +
    `Create an Report structured as follows:\n\n` +
    `## Key Developments\n` +
    `Summarize the main developments and trends based on the top stories.\n` +
    `Reference the top keywords (${topKeywords.join(', ')}) to contextualize the dominant themes.\n\n` +
    mediaToneBiasSection +
    `## Top Entities Mentioned\n` +
    `Integrate AI-extracted entity lists provided above.\n` +
    `Follow the interpretation instructions for entities.\n\n` +
    `## Geographic Highlights\n` +
    `Mention top countries and any notable regional patterns from the geographic distribution.\n\n` +
    `## Strategic Insights\n` +
    `Provide 3–5 bullet points synthesizing implications for investors, researchers, or policymakers.\n\n` +
    `=== TONE AND STYLE ===\n` +
    `- DO NOT add main title to the report.\n` +
    `- Tone: Neutral, factual, and data-driven.\n` +
    `- Base your analysis SOLELY on the provided structured data.\n` +
    `- Do NOT speculate or use external knowledge.\n` +
    `- Do NOT invent facts beyond the data provided.\n` +
    `- Include specific article references with inline [links] for verification where appropriate.${lowCoverageDisclaimer}`
  );
}

/**
 * Creates chat messages for report generation
 * Following Revised Master Template (Spec Section 3)
 */
export function createIntelligenceReportMessages(processedData: ProcessedTopicData): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are a financial and risk analyst summarizing global media coverage. ' +
        'Base your analysis solely on provided structured data (keywords, sentiment summary, political leaning distribution, and AI-extracted entities). ' +
        'Do not invent facts or speculate beyond the data. ' +
        'As an analyst, explain why sentiment or coverage patterns matter. ' +
        'Link tone or source bias to the possible perception of the topic, not market predictions.',
    },
    {
      role: 'user',
      content: generateIntelligenceReportPrompt(processedData),
    },
  ];
}

/**
 * Generates the AI prompt for context explanation
 * Updated to align with main report structure with aggregated metrics
 */
export function generateContextExplanationPrompt(params: {
  context: 'spike' | 'geo' | 'deep_dive';
  topic: string;
  date?: string;
  country?: string;
  articles: Array<{
    title: string;
    source_title?: string;
    pub_date?: string;
    article_link?: string;
    description?: string;
    sentiment?: number;
    keywords?: string[];
    country?: string;
    source_leaning?: string;
  }>;
  apiTier?: 'free' | 'developer' | 'business' | 'enterprise';
}): string {
  const { context, topic, date, country, articles } = params;

  const contextTitle =
    context === 'spike'
      ? 'AI-Powered Timeline Insights'
      : context === 'geo'
        ? 'AI-Powered Regional Insights'
        : 'Intelligence Analysis';

  // Import aggregation utilities
  const {
    calculateAverageSentiment,
    aggregatePoliticalLeaning,
    aggregateTopKeywords,
    aggregateTopSources,
    aggregateGeographicDistribution,
  } = require('./analysisUtils');

  // Compute aggregated metrics from articles
  const sentimentAverage = calculateAverageSentiment(articles);
  const politicalLeaningDistribution = aggregatePoliticalLeaning(articles);
  const topKeywords = aggregateTopKeywords(articles, 10);
  const topSources = aggregateTopSources(articles);
  const geographicDistribution = aggregateGeographicDistribution(articles);

  // Format sentiment summary
  const sentimentSummary = {
    positive: +sentimentAverage.positive.toFixed(2),
    neutral: +sentimentAverage.neutral.toFixed(2),
    negative: +sentimentAverage.negative.toFixed(2),
  };

  // Format political leaning distribution
  const politicalLeaningMap: Record<string, number> = {};
  politicalLeaningDistribution.forEach((item: { leaning: string; share: number }) => {
    politicalLeaningMap[item.leaning] = +item.share.toFixed(2);
  });

  // Extract top keywords (top 5)
  const topKeywordsList = topKeywords.slice(0, 5).map((k: { keyword: string }) => k.keyword);

  const articleList = formatArticlesListForExplanation(articles);

  // Low-coverage disclaimer
  const lowCoverageNote = articles.length < 30
    ? '\n\n**Note:** Coverage density is limited; insights may be preliminary.\n'
    : '';

  // Check if user is on free tier
  const isFreeTier = params.apiTier === 'free';

  // Build sentiment and political leaning sections only for paid tiers
  const sentimentSection = !isFreeTier ? (
    `=== SENTIMENT SUMMARY ===\n` +
    `${JSON.stringify(sentimentSummary, null, 2)}\n\n` +
    `Instructions for sentiment interpretation:\n` +
    `- If neutral sentiment exceeds 70%, state that coverage is mostly factual or balanced.\n` +
    `- If positive or negative shares exceed 25%, highlight the dominant tone and link it to potential drivers.\n` +
    `- Avoid over-interpreting minor differences.\n\n` +
    `=== POLITICAL LEANING DISTRIBUTION ===\n` +
    `${JSON.stringify(politicalLeaningMap, null, 2)}\n\n` +
    `Instructions for political leaning interpretation:\n` +
    `- If one group contributes >50%, comment on potential bias or coverage skew.\n` +
    `- Otherwise, state that reporting appears ideologically diverse.\n\n`
  ) : '';

  const mediaToneBiasSection = !isFreeTier ? (
    `## Media Tone & Bias\n` +
    `Use the sentiment summary and political leaning distribution provided above.\n` +
    `Follow the interpretation instructions for each metric.\n\n`
  ) : (
    `## Media Tone & Bias\n` +
    `*Available on paid plans*\n\n`
  );

  return (
    `Generate a professional ${contextTitle} report based on the following structured data:\n\n` +
    `=== CONTEXT METADATA ===\n` +
    `Topic: ${topic}\n` +
    `${date ? `Date: ${date}\n` : ''}` +
    `${country ? `Country: ${country}\n` : ''}` +
    `Total Articles: ${articles.length}\n\n` +
    sentimentSection +
    `=== QUANTITATIVE CONTEXT ===\n` +
    `Top Sources: ${topSources.slice(0, 3).map((s: { source: string }) => s.source).join(', ')}\n` +
    `Top Keywords: ${topKeywordsList.join(', ')}\n` +
    `Geographic Distribution (top 5): ${geographicDistribution.slice(0, 5).map((g: { country: string; count: number }) => `${g.country} (${g.count})`).join(', ')}\n\n` +
    `=== ARTICLES (representative sample) ===\n${articleList}\n\n` +
    `=== REPORT STRUCTURE (REQUIRED) ===\n` +
    `Create a ${contextTitle} report structured as follows:\n\n` +
    `## Key Developments\n` +
    `Summarize the main developments and trends based on the articles.\n` +
    `Reference the top keywords (${topKeywordsList.join(', ')}) to contextualize the dominant themes.\n\n` +
    mediaToneBiasSection +
    `## Geographic Highlights\n` +
    `Mention top countries and any notable regional patterns from the geographic distribution.\n` +
    `${country ? `Focus specifically on ${country}-related developments.\n` : ''}` +
    `${date ? `Focus specifically on developments on ${date}.\n` : ''}\n` +
    `## Key Entities\n` +
    `Identify and mention the most frequently occurring organizations, people, and locations from the articles.\n\n` +
    `## Strategic Insights\n` +
    `Provide 3–5 bullet points synthesizing implications for investors, researchers, or policymakers.\n\n` +
    `=== TONE AND STYLE ===\n` +
    `- Tone: Neutral, factual, and data-driven.\n` +
    `- Base your analysis SOLELY on the provided structured data.\n` +
    `- Do NOT speculate or use external knowledge.\n` +
    `- Do NOT invent facts beyond the data provided.\n` +
    `- DO NOT add main title to the report.\n` +
    `- Use markdown headers (##) for main sections.\n` +
    `- Embed links INLINE within the narrative text using [descriptive text](URL) format.\n` +
    `- Do NOT use numbered references like [1], [2].\n` +
    `- Make links contextual and natural in the flow of text.${lowCoverageNote}`
  );
}

/**
 * Creates chat messages for context explanation
 * Updated system prompt to align with Revised Master Template
 */
export function createContextExplanationMessages(params: {
  context: 'spike' | 'geo' | 'deep_dive';
  topic: string;
  date?: string;
  country?: string;
  articles: Array<{
    title: string;
    source_title?: string;
    pub_date?: string;
    article_link?: string;
    description?: string;
  }>;
  apiTier?: 'free' | 'developer' | 'business' | 'enterprise';
}): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are a financial and risk analyst summarizing global media coverage. ' +
        'Base your analysis solely on provided articles and data. ' +
        'Do not invent facts or speculate beyond the data. ' +
        'As an analyst, explain why developments and patterns matter. ' +
        'Generate well-structured markdown reports with proper headers (###). ' +
        'When referencing articles, embed inline links directly in the text using markdown format [descriptive text](URL). ' +
        'Do NOT use footnote-style references like [1], [2].',
    },
    {
      role: 'user',
      content: generateContextExplanationPrompt(params),
    },
  ];
}
