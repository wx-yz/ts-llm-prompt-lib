// main.ts (or your entry point)
import { configure, createLLMPrompt, z } from './src'; // Adjust path

// IMPORTANT: Use environment variables in production!
configure({
    providers: {
        openai: { apiKey: process.env.OPENAI_API_KEY || "YOUR_OPENAI_KEY", model: "gpt-4o" },
        gemini: { apiKey: process.env.GEMINI_API_KEY || "YOUR_GEMINI_KEY", model: "gemini-1.5-flash"},
         // Add Anthropic, xAI configs
    },
    defaultProvider: 'openai', // Set your preferred default
});


// Define the expected output structure using Zod
const TranslationSchema = z.object({
    originalText: z.string(),
    translatedText: z.string(),
    targetLanguage: z.string(),
    confidenceScore: z.number().min(0).max(1).describe("A score from 0 to 1 indicating translation confidence."),
});

// Define the type alias for the return type for clarity
type TranslationResult = z.infer<typeof TranslationSchema>;

// Create the typed prompt function
const translateText = createLLMPrompt<
    { text: string; language: string }, // Argument types (must be an object)
    TranslationResult                   // Return type (inferred from Zod schema)
>(
    // The prompt template string. Use {argName} for placeholders.
    'Translate the following text to {language}. Provide the original text, the translation, the target language, and a confidence score.\nText: "{text}"',
    // Options: including the crucial outputSchema
    {
       outputSchema: TranslationSchema,
       // provider: 'gemini' // Optionally override the default provider here
       // model: 'claude-3-sonnet...' // Optionally override the model
    }
);

// --- Another Example: Recipe Generator ---
const RecipeSchema = z.object({
    dishName: z.string(),
    ingredients: z.array(z.object({ name: z.string(), quantity: z.string() })),
    steps: z.array(z.string()),
    prepTimeMinutes: z.number().int().positive(),
});
type Recipe = z.infer<typeof RecipeSchema>;

const generateRecipe = createLLMPrompt<
    { mainIngredient: string; cuisine: string },
    Recipe
>(
    'Create a recipe for a {cuisine} dish featuring {mainIngredient}. Include ingredients with quantities, step-by-step instructions, and prep time.',
    { outputSchema: RecipeSchema }
);



async function runExamples() {
    try {
        console.log("Translating...");
        const translation = await translateText({
            text: "Hello, world!",
            language: "Spanish"
        });
        console.log("Translation Result:", translation);
        // Access typed properties:
        console.log(`Translated to ${translation.targetLanguage}: ${translation.translatedText}`);
        console.log(`Confidence: ${translation.confidenceScore}`);

        console.log("\nGenerating Recipe...");
        const recipe = await generateRecipe({
            mainIngredient: "chicken",
            cuisine: "Italian"
        });
        console.log("Recipe Result:", recipe);
        console.log(`Dish: ${recipe.dishName}, Prep Time: ${recipe.prepTimeMinutes} mins`);
        console.log("Ingredients:", recipe.ingredients);

    } catch (error) {
        console.error("\n--- An error occurred ---");
        console.error(error);
    }
}

runExamples();