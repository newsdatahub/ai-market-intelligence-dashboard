/**
 * Environment configuration with validation
 */

import { logger } from "../utils/logger";

// News API Configuration
export const NEWSDATAHUB_BASE_URL = process.env.NEWSDATAHUB_BASE_URL || 'https://api.newsdatahub.com';
export const NEWSDATAHUB_API_KEY = process.env.NEWSDATAHUB_API_KEY || '';

// OpenAI Configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Cache TTL Configuration (in seconds)
export const CACHE_TTL_HISTORICAL = Number(process.env.CACHE_TTL_HISTORICAL || 86400); // 24 hours
export const CACHE_TTL_CURRENT_DAY = Number(process.env.CACHE_TTL_CURRENT_DAY || 3600); // 1 hour

// Server Configuration
export const PORT = Number(process.env.PORT || 4000);
export const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Required environment variables that must be set
 */
const REQUIRED_ENV_VARS = [
  'NEWSDATAHUB_API_KEY',
  'OPENAI_API_KEY',
] as const;

/**
 * Validates that all required environment variables are set.
 * Should be called at application startup.
 *
 * @throws Error if any required environment variables are missing
 */
export function validateEnvironmentVariables(): string[] {
  const missingVars: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  return missingVars;
}

/**
 * Logs configuration on startup (with sensitive values redacted)
 */
export function logConfiguration(): void {
  console.log('🔧 Configuration loaded:');
  console.log(`  - Environment: ${NODE_ENV}`);
  console.log(`  - Port: ${PORT}`);
  console.log(`  - News API URL: ${NEWSDATAHUB_BASE_URL}`);
  console.log(`  - NewsDataHub API Key: ${NEWSDATAHUB_API_KEY ? '***' + NEWSDATAHUB_API_KEY.slice(-4) : 'NOT SET'}`);
  console.log(`  - OpenAI Model: ${OPENAI_MODEL}`);
  console.log(`  - OpenAI API Key: ${OPENAI_API_KEY ? '***' + OPENAI_API_KEY.slice(-4) : 'NOT SET'}`);
  console.log(`  - Cache TTL (historical): ${CACHE_TTL_HISTORICAL}s`);
  console.log(`  - Cache TTL (current day): ${CACHE_TTL_CURRENT_DAY}s`);
}
