import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function validateAndParse<T>(
    jsonString: string,
    schema: z.ZodType<T>
): T {
    try {
        // Attempt to clean the string slightly (common LLM issue)
        // Remove potential ```json ... ``` markers
        const cleanedString = jsonString.replace(/^```json\s*|```$/g, '').trim();
        const jsonData = JSON.parse(cleanedString);
        return schema.parse(jsonData); // Validate structure and types
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.error("LLM Output Validation Error:", error.errors);
            throw new Error(`LLM output failed validation: ${error.message}\nRaw Output:\n${jsonString}`);
        } else if (error instanceof SyntaxError) {
             console.error("JSON Parsing Error:", error);
             throw new Error(`LLM output was not valid JSON.\nRaw Output:\n${jsonString}`);
        }
        throw error; // Re-throw other errors
    }
}

// Generates a JSON schema description string from a Zod schema
export function generateSchemaDescription<T>(schema: z.ZodType<T>): string {
    // Convert Zod schema to JSON Schema object
    // The 'target: "jsonSchema7"' might vary based on LLM compatibility
    const jsonSchema = zodToJsonSchema(schema, { target: 'jsonSchema7' });
    // Stringify the JSON schema compactly for embedding in the prompt
    return JSON.stringify(jsonSchema);
}