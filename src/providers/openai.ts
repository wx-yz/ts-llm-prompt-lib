import fetch from 'node-fetch'; // Change to ES Module import if using v3
import { LLMProvider } from './base';
import { ApiError } from '../errors'; // We should define a custom error class

const OPENAI_DEFAULT_MODEL = 'gpt-4o'; // Or 'gpt-3.5-turbo'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIProvider implements LLMProvider {
    async generate(
        prompt: string,
        model: string = OPENAI_DEFAULT_MODEL,
        apiKey: string,
        // You could add options like temperature, max_tokens here
    ): Promise<string> {
        console.log(`--- Sending Prompt to OpenAI (Model: ${model}) ---`);
        // console.log(prompt); // Optionally log the full prompt for debugging
        console.log(`-------------------------------------------------`);

        const requestBody = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            // Instruct OpenAI to return JSON directly if possible
            response_format: { type: "json_object" },
            temperature: 0.2, // Lower temperature for more deterministic JSON output
            // max_tokens: ... // Consider setting max_tokens
        };

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => response.text()); // Try parsing error as JSON
                throw new ApiError('OpenAI', response.status, errorBody);
            }

            const data = await response.json() as any; // Define specific OpenAI response types if desired

            const content = data.choices?.[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('OpenAI response content is empty or invalid.');
            }
            console.log(`--- Received OpenAI Response ---`);
            // console.log(content); // Optionally log raw response
            console.log(`------------------------------`);
            return content;

        } catch (error) {
            if (error instanceof ApiError) {
                throw error; // Re-throw known API errors
            }
             console.error("Error during OpenAI API call:", error);
             throw new Error(`Network or other error during OpenAI request: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}