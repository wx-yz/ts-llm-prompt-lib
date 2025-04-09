// example.ts
import dotenv from 'dotenv';
dotenv.config(); // Load .env file variables into process.env

import { configure, createLLMPrompt, z } from './index'; // Adjust path if example.ts is elsewhere
import { ApiError } from './errors';

// --- Configuration ---
configure({
    providers: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY || "", // Fallback to empty string if not set
            model: "gpt-4o", // Optional: override default
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY || "",
            model: "gemini-1.5-flash",
        },
        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY || "",
            model: "claude-3-haiku-20240307", // Use a cheaper/faster model for testing
        },
        // xai: { apiKey: process.env.XAI_API_KEY || "" }, // Add if testing xAI
    },
    // Set a default provider to use if not specified in createLLMPrompt options
    // Make sure this provider has a valid API key in your .env
    defaultProvider: 'openai', // Change to 'gemini' or 'anthropic' to test others by default
});

// --- Example 1: Simple Sentiment Analysis ---
const SentimentSchema = z.object({
    text: z.string().describe("The original text analyzed."),
    sentiment: z.enum(["positive", "negative", "neutral"]).describe("The detected sentiment."),
    confidence: z.number().min(0).max(1).describe("Confidence score (0-1).")
});
type SentimentResult = z.infer<typeof SentimentSchema>;

const analyzeSentiment = createLLMPrompt<
    { inputText: string }, // Arguments object type
    SentimentResult       // Return type (from Zod schema)
>(
    // The prompt template:
    'Analyze the sentiment of the following text: "{inputText}". Classify it as positive, negative, or neutral and provide a confidence score.',
    // Options:
    {
        outputSchema: SentimentSchema,
        // provider: 'gemini' // Optionally override default provider for this specific prompt
    }
);


// --- Example 2: Recipe Idea Generator ---
const RecipeIdeaSchema = z.object({
    cuisine: z.string(),
    mainIngredient: z.string(),
    dishName: z.string().describe("A creative name for the dish."),
    description: z.string().describe("A brief description of the suggested dish."),
    keyFlavors: z.array(z.string()).describe("List of key flavor profiles (e.g., spicy, savory, sweet)."),
});
type RecipeIdea = z.infer<typeof RecipeIdeaSchema>;

const generateRecipeIdea = createLLMPrompt<
    { ingredient: string; style: string },
    RecipeIdea
>(
    'Generate a creative recipe idea for a {style} dish using {ingredient} as the main component. Provide a name, description, and key flavors.',
    {
        outputSchema: RecipeIdeaSchema,
        provider: 'anthropic' // Example: Force using Anthropic for this one
    }
);


// --- Main Execution Function ---
async function runTests() {
    console.log("Starting LLM Prompt Library Tests...");

    // Test 1: Sentiment Analysis
    try {
        console.log("\n--- Testing Sentiment Analysis ---");
        const sentiment = await analyzeSentiment({ inputText: "Wow, this library is incredibly useful and easy to set up!" });
        console.log("Sentiment Analysis Result:", sentiment);
        console.log(`Detected Sentiment: ${sentiment.sentiment} (Confidence: ${sentiment.confidence.toFixed(2)})`);
    } catch (error) {
        console.error("\n--- Sentiment Analysis FAILED ---");
        if (error instanceof ApiError) {
            console.error(`Provider: ${error.provider}, Status: ${error.statusCode}`);
            console.error("Details:", error.details);
        } else if (error instanceof z.ZodError) {
            console.error("Output Validation Error:", error.errors);
        } else {
            console.error("Unexpected Error:", error);
        }
    }

    // Test 2: Recipe Idea Generation
    try {
        console.log("\n--- Testing Recipe Idea Generation ---");
        // Ensure you have ANTHROPIC_API_KEY set in .env for this one
        if (!process.env.ANTHROPIC_API_KEY) {
             console.log("Skipping Anthropic test - ANTHROPIC_API_KEY not set.");
        } else {
            const idea = await generateRecipeIdea({ ingredient: "mushrooms", style: "rustic French" });
            console.log("Recipe Idea Result:", idea);
            console.log(`Dish Idea: <span class="math-inline">\{idea\.dishName\} \(</span>{idea.cuisine}) - ${idea.description}`);
        }
    } catch (error) {
        console.error("\n--- Recipe Idea Generation FAILED ---");
         if (error instanceof ApiError) {
            console.error(`Provider: ${error.provider}, Status: ${error.statusCode}`);
            console.error("Details:", error.details);
        } else if (error instanceof z.ZodError) {
            console.error("Output Validation Error:", error.errors);
        } else {
            console.error("Unexpected Error:", error);
        }
    }

    console.log("\n--- All Tests Completed ---");
}

// Run the tests
runTests();