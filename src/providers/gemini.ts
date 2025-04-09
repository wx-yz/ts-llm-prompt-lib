import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { ApiError } from '../errors';

const GEMINI_DEFAULT_MODEL = 'gemini-1.5-flash'; // Or 'gemini-pro' etc.
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiProvider implements LLMProvider {
    async generate(
        prompt: string,
        model: string = GEMINI_DEFAULT_MODEL,
        apiKey: string,
        // Gemini options like temperature, topK, topP can go here
    ): Promise<string> {
        console.log(`--- Sending Prompt to Gemini (Model: ${model}) ---`);
        // console.log(prompt);
        console.log(`------------------------------------------------`);

        const apiUrl = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            // Instruct Gemini to return JSON
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2, // Lower temperature for consistency
                // candidateCount: 1, // Usually default to 1
                // maxOutputTokens: ...
                // topK: ...
                // topP: ...
            },
            // safetySettings: [...] // Optional: Add safety settings if needed
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                 const errorBody = await response.json().catch(() => response.text());
                 throw new ApiError('Gemini', response.status, errorBody);
            }

            const data = await response.json() as any; // Define specific Gemini response types

            // Handle potential blocks or safety issues
             if (!data.candidates || data.candidates.length === 0) {
                const blockReason = data.promptFeedback?.blockReason;
                const safetyRatings = data.promptFeedback?.safetyRatings;
                throw new Error(`Gemini response missing candidates. Block Reason: ${blockReason || 'N/A'}. Safety: ${JSON.stringify(safetyRatings || {})}`);
            }

            // Extract content, checking for potential issues
             const candidate = data.candidates[0];
             if (candidate.finishReason && candidate.finishReason !== 'STOP') {
                 console.warn(`Gemini Finish Reason: ${candidate.finishReason}`);
                 // Potentially throw error if reason is SAFETY, RECITATION etc. depending on desired strictness
            }

            const content = candidate.content?.parts?.[0]?.text?.trim();
            if (!content) {
                throw new Error(`Gemini response content is empty or invalid. Finish Reason: ${candidate.finishReason || 'N/A'}`);
            }

            console.log(`--- Received Gemini Response ---`);
            // console.log(content);
            console.log(`-----------------------------`);
            return content;

        } catch (error) {
             if (error instanceof ApiError) {
                throw error;
             }
             console.error("Error during Gemini API call:", error);
             throw new Error(`Network or other error during Gemini request: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}