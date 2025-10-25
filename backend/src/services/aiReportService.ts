import { openaiService } from './openaiService';
import { ChatMessage } from '../types/intelligence';
import { validateEnvironmentVariables } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Generates an AI-powered report from chat messages.
 * This function only handles report generation - caching should be handled by the caller.
 *
 * @param messages - Array of chat messages to send to OpenAI
 * @returns The generated report text
 * @throws Error if the OpenAI API request fails
 */
export async function generateAIReport(messages: ChatMessage[]): Promise<string> {
  const missingVars = validateEnvironmentVariables();
  if (missingVars.length > 0) {
    throw new Error(
      `Missing API configuration. Please set the following environment variables: ${missingVars.join(', ')}`
    );
  }
  return await openaiService.generateChatCompletion(messages);
}
