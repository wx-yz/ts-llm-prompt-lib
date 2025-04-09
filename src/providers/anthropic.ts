import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { ApiError } from '../errors';

const ANTHROPIC_DEFAULT_MODEL = 'claude-3-sonnet-20240229'; // Or haiku, opus
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export class AnthropicProvider implements LLMProvider {
    async generate(
        prompt: string,
        model: string = ANTHROPIC_DEFAULT_MODEL,
        apiKey: string,
        // Anthropic options: max_tokens, temperature, system prompt
    ): Promise<string> {
        console.log(`--- Sending Prompt to Anthropic (Model: ${model}) ---`);
        // console.log(prompt);
        console.log(`---------------------------------------------------`);

        // Anthropic often benefits from putting structural instructions (like JSON format)
        // in the 'system' prompt, but our factory puts it in the main prompt for simplicity.
        // If results are poor, consider modifying the factory to allow a separate system prompt for Anthropic.
        const requestBody = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4096, // Recommended to set max_tokens
            temperature: 0.2, // Lower temperature for JSON consistency
            // system: "Your primary role is to respond in valid JSON format..." // Alternative if main prompt isn't enough
        };

        try {
            const response = await fetch(ANTHROPIC_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': ANTHROPIC_VERSION,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                 const errorBody = await response.json().catch(() => response.text());
                 throw new ApiError('Anthropic', response.status, errorBody);
            }

            const data = await response.json() as any; // Define specific Anthropic response types

            // Extract content based on Anthropic's structure
            const content = data.content?.[0]?.text?.trim();

             if (data.stop_reason === 'max_tokens') {
                 console.warn('Anthropic response may be truncated due to max_tokens limit.');
             }

            if (!content) {
                throw new Error(`Anthropic response content is empty or invalid. Stop Reason: ${data.stop_reason}`);
            }

            console.log(`--- Received Anthropic Response ---`);
            // console.log(content);
            console.log(`---------------------------------`);
            return content;

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error("Error during Anthropic API call:", error);
            throw new Error(`Network or other error during Anthropic request: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}