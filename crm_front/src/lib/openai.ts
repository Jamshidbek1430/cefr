import OpenAI from 'openai';

/**
 * Returns an initialized OpenAI client or null if the API key is missing.
 * This ensures the app doesn't crash during build or deployment if the key is not provided.
 */
export const getOpenAI = () => {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
        console.error('OPENAI_API_KEY is missing – AI features cannot be used.');
        return null;
    }

    try {
        return new OpenAI({ apiKey });
    } catch (error) {
        console.error('Failed to initialize OpenAI client (invalid key?):', error);
        return null;
    }
};

/**
 * Helper to check if AI features are enabled.
 */
export const isAIEnabled = () => {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    return !!apiKey;
};
