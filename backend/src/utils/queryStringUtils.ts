/**
 * Utility functions for building URL query strings
 */

/**
 * Converts an object of parameters into a URL query string.
 * Handles arrays, null, and undefined values appropriately.
 *
 * @param params - Object containing query parameters
 * @returns Query string with leading '?' if parameters exist, empty string otherwise
 *
 * @example
 * buildQueryString({ q: 'tech', per_page: 10 })
 * // Returns: "?q=tech&per_page=10"
 *
 * @example
 * buildQueryString({ tags: ['ai', 'ml'], country: 'US' })
 * // Returns: "?tags=ai&tags=ml&country=US"
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      return;
    }

    // Handle array values by appending multiple times
    if (Array.isArray(value)) {
      value.forEach((arrayItem) => {
        searchParams.append(key, String(arrayItem));
      });
    } else {
      // Handle single values
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
