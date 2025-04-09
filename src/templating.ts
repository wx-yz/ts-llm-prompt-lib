import { PromptArgs } from './types';

// Simple placeholder replacement (e.g., {name})
export function injectArgs(template: string, args: PromptArgs): string {
    let result = template;
    for (const key in args) {
        // Use a regex to replace all occurrences of {key}
        const placeholder = new RegExp(`\\{${key}\\}`, 'g');
        const value = args[key];
        // Simple stringification, might need refinement for objects
        result = result.replace(placeholder, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    return result;
}