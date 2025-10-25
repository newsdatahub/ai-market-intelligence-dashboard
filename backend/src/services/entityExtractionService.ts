import { NewsArticle } from '../types';
import { openaiService } from './openaiService';
import { cache } from './cacheService';
import { calculateCacheTTL } from '../utils/cacheUtils';
import { logger } from '../utils/logger';

/**
 * Extracted entities from news articles
 */
export interface TopEntities {
  organizations: string[];
  people: string[];
  locations: string[];
}

/**
 * Generates a cache key for entity extraction.
 * Uses query parameters and article count as key.
 *
 * @param params - Entity extraction parameters
 * @returns Unique cache key string
 */
function generateEntityCacheKey(params: {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
  articleCount: number;
}): string {
  const { topic, startDate, endDate, language, articleCount } = params;
  return `entities:${topic}:${startDate}:${endDate}:${language || ''}:${articleCount}`;
}

/**
 * Extracts top entities (organizations, people, locations) from articles using OpenAI.
 * Implements caching to avoid redundant API calls.
 *
 * @param params - Extraction parameters including articles and metadata
 * @returns Top entities grouped by category
 */
export async function extractTopEntities(params: {
  topic: string;
  startDate: string;
  endDate: string;
  language?: string;
  articles: NewsArticle[];
}): Promise<TopEntities> {
  const { topic, startDate, endDate, language, articles } = params;

  // Return empty result if insufficient data
  if (articles.length < 10) {
    logger.info('[entities] Insufficient articles for entity extraction', {
      topic,
      articleCount: articles.length,
    });
    return { organizations: [], people: [], locations: [] };
  }

  // Check cache first
  const cacheKey = generateEntityCacheKey({
    topic,
    startDate,
    endDate,
    language,
    articleCount: articles.length,
  });
  const cachedEntities = cache.get<TopEntities>(cacheKey);
  if (cachedEntities) {
    logger.info('[entities] Returning cached entities', { topic, cacheKey });
    return cachedEntities;
  }

  // Build content from article titles and descriptions
  const content = articles
    .slice(0, 100) // Limit to first 100 articles to avoid token limits
    .map((article, idx) => {
      return `[${idx + 1}] ${article.title}\n${article.description || ''}`;
    })
    .join('\n\n');

  const systemPrompt = `You are a data analyst performing named entity extraction from news coverage.

From the following article titles and descriptions, identify up to 10 distinct entities most frequently mentioned, grouped into three categories:
  - organizations (companies, institutions, agencies)
  - people (named individuals)
  - locations (countries, regions, cities)

Output JSON only in this format:
{
  "organizations": ["..."],
  "people": ["..."],
  "locations": ["..."]
}

Rules:
- Use exact names as they appear when possible.
- Do not include topics, technologies, or generic nouns (e.g., "quantum computing", "economy").
- Use only information found in the provided text — no external guessing.`;

  const userPrompt = `Topic: ${topic}\n\nArticles:\n\n${content}`;

  try {
    logger.info('[entities] Extracting entities via OpenAI', {
      topic,
      articleCount: articles.length,
    });

    const response = await openaiService.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON response
    const entities = parseEntitiesResponse(response);

    // Cache result with appropriate TTL
    const cacheTTL = calculateCacheTTL(endDate);
    cache.set(cacheKey, entities, cacheTTL);

    logger.info('[entities] Successfully extracted entities', {
      topic,
      orgCount: entities.organizations.length,
      peopleCount: entities.people.length,
      locationsCount: entities.locations.length,
    });

    return entities;
  } catch (error) {
    logger.error('[entities] Failed to extract entities', {
      error: error instanceof Error ? error.message : 'Unknown error',
      topic,
    });

    // Return empty result on failure (graceful degradation)
    return { organizations: [], people: [], locations: [] };
  }
}

/**
 * Parses OpenAI response into structured entities.
 * Handles various response formats and validates structure.
 *
 * @param response - Raw response from OpenAI
 * @returns Parsed and validated entities
 */
function parseEntitiesResponse(response: string): TopEntities {
  try {
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonString = response.trim();

    // Remove markdown code block syntax if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonString);

    // Helper function to filter string values
    const filterStrings = (arr: unknown[]): string[] => {
      return arr.filter((e): e is string => typeof e === 'string');
    };

    // Validate structure
    const entities: TopEntities = {
      organizations: Array.isArray(parsed.organizations)
        ? filterStrings(parsed.organizations.slice(0, 10))
        : [],
      people: Array.isArray(parsed.people)
        ? filterStrings(parsed.people.slice(0, 10))
        : [],
      locations: Array.isArray(parsed.locations)
        ? filterStrings(parsed.locations.slice(0, 10))
        : [],
    };

    return entities;
  } catch (error) {
    logger.error('[entities] Failed to parse entities response', {
      error: error instanceof Error ? error.message : 'Unknown error',
      response: response.substring(0, 200),
    });

    // Return empty result on parse failure
    return { organizations: [], people: [], locations: [] };
  }
}
