# ts-prompt-fn

A TypeScript library for creating strongly-typed functions that use LLMs to process natural language and return structured data. All LLM responses are validated using Zod schemas for type safety.

## Features

- 💪 **Strongly Typed**: Full TypeScript support with Zod schema validation
- 🔀 **Multiple Providers**: Support for OpenAI, Gemini, Anthropic, and xAI/Grok
- 🧩 **Simple API**: Create LLM-powered functions with just a few lines of code
- ✅ **Validation**: Automatic validation and parsing of LLM responses
- 🛠️ **Customizable**: Configure providers, models, and prompt templates

## Installation

```bash
# npm
npm install ts-prompt-fn zod

# yarn
yarn add ts-prompt-fn zod

# pnpm
pnpm add ts-prompt-fn zod
```

## Quick Start

```typescript
import { configure, createLLMPrompt, z } from 'ts-prompt-fn';

// Configure your providers (store API keys in environment variables)
configure({
  providers: {
    openai: { apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o" },
    // Add other providers as needed
  },
  defaultProvider: 'openai'
});

// Define your output schema with Zod
const AnalysisSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  keywords: z.array(z.string()),
  summary: z.string()
});

// Create your typed prompt function
const analyzeText = createLLMPrompt<
  { text: string },     // Input type
  z.infer<typeof AnalysisSchema>  // Output type
>(
  // Prompt template
  'Analyze the following text and extract the sentiment, keywords, and a brief summary:\n"{text}"',
  { outputSchema: AnalysisSchema }
);

// Use your function with type safety
async function main() {
  const result = await analyzeText({ 
    text: "I really enjoyed the new product launch. The features are innovative and user-friendly!"
  });
  
  // Fully typed result
  console.log(`Sentiment: ${result.sentiment}`);
  console.log(`Keywords: ${result.keywords.join(', ')}`);
  console.log(`Summary: ${result.summary}`);
}

main();
```

### Documentation

#### Configuration

First, configure the library with your LLM provider details:

```typescript
configure({
  providers: {
    openai: { apiKey: "YOUR_API_KEY", model: "gpt-4o" },
    gemini: { apiKey: "YOUR_API_KEY", model: "gemini-1.5-flash" },
    anthropic: { apiKey: "YOUR_API_KEY", model: "claude-3-haiku-20240307" },
    xai: { apiKey: "YOUR_API_KEY" }
  },
  defaultProvider: 'openai' // Default provider to use
});
```

#### Creating Prompt Functions

```typescript
const myFunction = createLLMPrompt<InputType, OutputType>(
  promptTemplate,
  options
);
```

#### Parameters:

* `promptTemplate`: String with placeholder variables like `{varName}`
* options: Configuration including:
    - outputSchema: Zod schema that defines the expected output structure
    - provider: (Optional) Override the default provider
    - model: (Optional) Override the default model
    - promptHeader: (Optional) Custom instructions for the LLM

#### Working with Multiple Providers

You can specify which provider to use for each prompt function:

```typescript
const openaiFunction = createLLMPrompt<InputType, OutputType>(
  promptTemplate,
  { 
    outputSchema: MySchema,
    provider: 'openai',
    model: 'gpt-4-turbo'
  }
);

const geminiFunction = createLLMPrompt<InputType, OutputType>(
  promptTemplate,
  { 
    outputSchema: MySchema,
    provider: 'gemini'
  }
);
```