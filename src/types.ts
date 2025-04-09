import { z } from 'zod'; // Using Zod for robust schema definition & validation

export type LLMProviderType = 'openai' | 'gemini' | 'anthropic' | 'xai';

export interface LLMConfig {
    apiKey: string;
    model?: string; // Optional: Provider-specific model name
    // Add other common provider options if needed (e.g., baseURL)
}

export interface GlobalConfig {
    providers: Partial<Record<LLMProviderType, LLMConfig>>;
    defaultProvider?: LLMProviderType;
}

// Interface for specific LLM provider implementations
export interface LLMProvider {
    generate(
        prompt: string,
        model: string | undefined, // Use specific model or provider default
        apiKey: string,
        // Additional options like temperature, max_tokens can go here
    ): Promise<string>; // Returns the raw string output from the LLM
}

// Options for creating a specific prompt function
export interface PromptFunctionOptions<TReturn> {
    provider?: LLMProviderType; // Override default provider
    model?: string; // Override default model for the provider
    outputSchema: z.ZodType<TReturn>; // Zod schema for expected output validation
    // Add LLM parameters like temperature, max_tokens, etc.
    promptHeader?: string; // Optional instruction header added to the prompt
}

// Type for the arguments object passed to the generated function
export type PromptArgs = Record<string, string | number | boolean | object>;
