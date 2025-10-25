/**
 * Formats a Date object to YYYY-MM-DD string format.
 *
 * @param date - Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 *
 * @example
 * formatDate(new Date('2024-01-15')) // '2024-01-15'
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date range or single date for display.
 * Returns a human-readable date range string.
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param specificDate - Single specific date (overrides start/end)
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange('2024-01-01', '2024-01-31')
 * // 'January 1 – January 31, 2024'
 *
 * @example
 * formatDateRange(undefined, undefined, '2024-01-15')
 * // 'January 15, 2024'
 */
export function formatDateRange(
  startDate?: string,
  endDate?: string,
  specificDate?: string
): string {
  if (specificDate) {
    const date = new Date(specificDate);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `${startFormatted} – ${endFormatted}`;
}

/**
 * Converts an object to URL query string.
 * Filters out undefined, null, and empty string values.
 *
 * @param params - Object with query parameters
 * @returns Query string (with leading '?' if non-empty)
 *
 * @example
 * buildQueryString({ topic: 'AI', language: 'en', country: undefined })
 * // '?topic=AI&language=en'
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Formats a label by converting underscores to spaces and capitalizing words.
 * Useful for displaying enum values or snake_case strings.
 *
 * @param text - Text to format
 * @returns Formatted text with capitalized words
 *
 * @example
 * formatLabel('far_left') // 'Far Left'
 * formatLabel('center_right') // 'Center Right'
 */
export function formatLabel(text: string): string {
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Deduplicates articles based on normalized title.
 * Removes articles with duplicate titles (case-insensitive, trimmed).
 *
 * @param articles - Array of articles to deduplicate
 * @returns Array of unique articles (first occurrence kept)
 *
 * @example
 * deduplicateArticles([
 *   { title: 'Breaking News', id: '1', ... },
 *   { title: ' breaking news ', id: '2', ... }
 * ])
 * // Returns only first article
 */
export function deduplicateArticles<T extends { title?: string }>(articles: T[]): T[] {
  const seen = new Set<string>();

  return articles.filter(article => {
    const normalizedTitle = article.title?.toLowerCase().trim();

    if (!normalizedTitle || seen.has(normalizedTitle)) {
      return false;
    }

    seen.add(normalizedTitle);
    return true;
  });
}
