import { CACHE_TTL_HISTORICAL, CACHE_TTL_CURRENT_DAY } from '../config/env';

/**
 * Checks if a given date is today in UTC timezone
 */
export function isDateToday(date: Date): boolean {
  const todaysDate = new Date();
  return (
    date.getUTCFullYear() === todaysDate.getUTCFullYear() &&
    date.getUTCMonth() === todaysDate.getUTCMonth() &&
    date.getUTCDate() === todaysDate.getUTCDate()
  );
}

/**
 * Calculates the appropriate TTL (time-to-live) for cached data based on the date.
 * Returns a shorter TTL for current day data and a longer TTL for historical data.
 */
export function calculateCacheTTL(dateString?: string): number {
  if (!dateString) return CACHE_TTL_HISTORICAL;

  const targetDate = new Date(`${dateString}T00:00:00Z`);
  const isTodaysData = isDateToday(targetDate);

  return isTodaysData ? CACHE_TTL_CURRENT_DAY : CACHE_TTL_HISTORICAL;
}
