import { DATE_CONSTANTS } from '../config/constants';

/**
 * Formats an ISO date string into YYYY-MM-DD format.
 * Used to group articles by day for trend analysis.
 *
 * @param isoDateString - ISO 8601 date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Date string in YYYY-MM-DD format (e.g., "2024-01-15")
 *
 * @example
 * formatDateAsKey("2024-01-15T10:30:00Z") // Returns: "2024-01-15"
 */
export function formatDateAsKey(isoDateString: string): string {
  const date = new Date(isoDateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + DATE_CONSTANTS.MONTHS_OFFSET).padStart(
    DATE_CONSTANTS.DATE_PADDING,
    DATE_CONSTANTS.PADDING_CHARACTER
  );
  const day = String(date.getUTCDate()).padStart(
    DATE_CONSTANTS.DATE_PADDING,
    DATE_CONSTANTS.PADDING_CHARACTER
  );

  return `${year}-${month}-${day}`;
}
