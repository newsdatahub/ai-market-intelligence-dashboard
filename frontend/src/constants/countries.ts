// ISO 3166-1 alpha-2 country codes to country names mapping
export const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  IN: 'India',
  CN: 'China',
  JP: 'Japan',
  BR: 'Brazil',
  MX: 'Mexico',
  AU: 'Australia',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  NG: 'Nigeria',
  KE: 'Kenya',
  EG: 'Egypt',
  RU: 'Russia',
  UA: 'Ukraine',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  DK: 'Denmark',
  NL: 'Netherlands',
  BE: 'Belgium',
  PL: 'Poland',
  CZ: 'Czech Republic',
  AT: 'Austria',
  CH: 'Switzerland',
  PT: 'Portugal',
  IE: 'Ireland',
  TR: 'Turkey',
  IL: 'Israel',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  IR: 'Iran',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  ID: 'Indonesia',
  PH: 'Philippines',
  TH: 'Thailand',
  VN: 'Vietnam',
  MY: 'Malaysia',
  SG: 'Singapore',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  VE: 'Venezuela',
};

/**
 * Get country name from ISO 3166-1 alpha-2 country code
 * @param countryCode - Two-letter country code (e.g., 'US', 'NG')
 * @returns Country name or the code itself if not found
 */
export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
}
