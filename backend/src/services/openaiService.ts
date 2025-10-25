import { ChatMessage } from '../types/intelligence';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../config/env';
import { withRetry, isRetryableHttpError } from '../utils/retryUtils';
import { ApiError } from '../errors';

/**
 * Generates a chat completion using OpenAI API.
 * This function only handles AI generation - caching should be handled by the caller.
 * Includes automatic retry logic with exponential backoff for transient failures.
 *
 * @param messages - Array of chat messages to send to OpenAI
 * @returns The generated text content from OpenAI
 * @throws ApiError if the OpenAI API request fails after all retries
 */
async function generateChatCompletion(messages: ChatMessage[]): Promise<string> {
  return withRetry(
    async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(`OpenAI API error ${response.status}: ${errorText}`, response.status, errorText);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content || '';

      if (!content) {
        throw new Error('OpenAI API returned empty content');
      }

      return content;
    },
    {
      shouldRetry: isRetryableHttpError,
    },
    'OpenAI Chat Completion'
  );
}

export const openaiService = {
  generateChatCompletion,
};
