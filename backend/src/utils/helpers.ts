export function formatDate(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getLast7Days(): { start: string; end: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setUTCDate(endDate.getUTCDate() - 6);
  return { start: formatDate(startDate), end: formatDate(endDate) };
}

export function isToday(dateIso: string): boolean {
  const d = new Date(dateIso);
  const today = new Date();
  return (
    d.getUTCFullYear() === today.getUTCFullYear() &&
    d.getUTCMonth() === today.getUTCMonth() &&
    d.getUTCDate() === today.getUTCDate()
  );
}

export function clampLanguage(lang?: string): string | undefined {
  if (!lang) return undefined;
  return lang.toLowerCase();
}

export function upperCountry(country?: string): string | undefined {
  if (!country) return undefined;
  return country.toUpperCase();
}

/**
 * Normalizes search query by replacing smart/curly quotes with straight quotes.
 * This prevents API errors caused by mixed quote types from text editors that auto-convert quotes.
 *
 * @param query - The search query string to normalize
 * @returns Normalized query with straight quotes
 *
 * @example
 * normalizeSearchQuery('"quantum computing"') // Returns: "quantum computing"
 * normalizeSearchQuery('"AI"') // Returns: "AI"
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes (" ") with straight quotes (")
    .replace(/[\u2018\u2019]/g, "'")  // Replace curly single quotes (' ') with straight quotes (')
    .trim();
}

