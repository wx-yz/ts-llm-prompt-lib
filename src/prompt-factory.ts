import { z } from 'zod';
import { getConfig, getProviderConfig, getDefaultProvider } from './config';
import { injectArgs } from './templating';
import { validateAndParse, generateSchemaDescription } from './validation';
import { LLMProviderType, PromptFunctionOptions, PromptArgs } from './types';
import { LLMProvider } from './providers/base';

import { ApiError } from './errors'; // Import custom error
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { AnthropicProvider } from './providers/anthropic';
import { XAIProvider } from './providers/xai';

const providerMap: Record<LLMProviderType, new () => LLMProvider> = {
    openai: OpenAIProvider,
    gemini: GeminiProvider,
    anthropic: AnthropicProvider,
    xai: XAIProvider,
};

const DEFAULT_PROMPT_HEADER = `
You are an AI assistant. Respond ONLY with valid JSON that strictly adheres to the following JSON Schema:
{outputSchema}

Do not include any extra commentary, explanations, or formatting like markdown backticks around the JSON output.
Your entire response must be the JSON object matching the schema.
---
User's Request:
`;

export function createLLMPrompt<TArgs extends PromptArgs, TReturn>(
    template: string,
    options: PromptFunctionOptions<TReturn>
): (args: TArgs) => Promise<TReturn> {

    // Return the async function that users will call
    return async (args: TArgs): Promise<TReturn> => {
        const globalConfig = getConfig();
        const providerType = options.provider ?? getDefaultProvider();

        if (!providerType) {
            throw new Error("No LLM provider specified in options or global configuration.");
        }

        const providerConfig = getProviderConfig(providerType);
        if (!providerConfig || !providerConfig.apiKey) {
            throw new Error(`Configuration or API key for provider "${providerType}" is missing.`);
        }

        const ProviderClass = providerMap[providerType];
        if (!ProviderClass) {
            throw new Error(`Provider "${providerType}" implementation not found.`);
        }
        const providerInstance = new ProviderClass();

        // Generate the schema description string from Zod schema
        const schemaDescription = generateSchemaDescription(options.outputSchema);

        // Construct the final prompt
        const header = (options.promptHeader ?? DEFAULT_PROMPT_HEADER)
                        .replace('{outputSchema}', schemaDescription);
        const userPrompt = injectArgs(template, args);
        const finalPrompt = `${header}\n${userPrompt}`;


        // Call the selected LLM provider
        const rawOutput = await providerInstance.generate(
            finalPrompt,
            options.model ?? providerConfig.model, // Use specific model or provider default
            providerConfig.apiKey
            // Pass other options like temperature here if implemented
        );

        // Validate and parse the output against the Zod schema
        return validateAndParse(rawOutput, options.outputSchema);
    };
}