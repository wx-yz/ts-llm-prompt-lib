import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { ApiError } from '../errors';

const XAI_DEFAULT_MODEL = 'grok-1'; // Replace with actual model name if known
const XAI_API_URL = 'https://api.xai.com/v1/chat/completions'; // **Hypothetical URL**

export class XAIProvider implements LLMProvider {
    async generate(
        prompt: string,
        model: string = XAI_DEFAULT_MODEL,
        apiKey: string,
        // Add other specific options if available
    ): Promise<string> {
        console.log(`--- Sending Prompt to xAI/Grok (Model: ${model}) ---`);
        // console.log(prompt);
        console.log(`---------------------------------------------------`);

        const requestBody = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            // Assuming a similar JSON mode flag exists
            response_format: { type: "json_object" },
            temperature: 0.2,
        };

        try {
            const response = await fetch(XAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Assuming Bearer token auth
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => response.text());
                throw new ApiError('xAI/Grok', response.status, errorBody);
            }

            const data = await response.json() as any;

            // Assuming an OpenAI-like response structure
            const content = data.choices?.[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('xAI/Grok response content is empty or invalid.');
            }

            console.log(`--- Received xAI/Grok Response ---`);
            // console.log(content);
            console.log(`--------------------------------`);
            return content;

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error("Error during xAI/Grok API call:", error);
            throw new Error(`Network or other error during xAI/Grok request: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}