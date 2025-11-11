
import { Settings } from "../types";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

interface OllamaTagsResponse {
    models: {
        name: string;
        modified_at: string;
        size: number;
    }[];
}

export const fetchOllamaModels = async (baseUrl: string): Promise<string[]> => {
    try {
        const response = await fetchWithTimeout(`${baseUrl}/api/tags`, {
            timeout: 120000 // 120 seconds, doubled from typical 60
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch Ollama models: ${response.statusText}`);
        }
        const data: OllamaTagsResponse = await response.json();
        return data.models.map(model => model.name);
    } catch (error) {
        console.error("Error fetching Ollama models:", error);
        throw error;
    }
};

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream: boolean;
    temperature?: number;
    top_p?: number;
    num_predict?: number;
}

interface OllamaGenerateResponse {
    response: string;
    done: boolean;
    // ... other properties
}

export const runOllama = async (prompt: string, settings: Settings): Promise<string> => {
    const { baseUrl, model } = settings.ollama;
    const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};
    try {
        const requestBody: OllamaGenerateRequest = {
            model: model,
            prompt: prompt,
            stream: false,
            temperature: creativityTemperature,
            top_p: topP,
            num_predict: maxTokens || undefined,
        };

        const response = await fetchWithTimeout(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            timeout: 120000, // 120 seconds, doubled from typical 60
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama API error: ${response.statusText} - ${errorBody}`);
        }

        const data: OllamaGenerateResponse = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error calling Ollama API:", error);
         if (error instanceof Error) {
            return '';
        }
        return '';
    }
};

export const runOllamaStream = async function* (prompt: string, settings: Settings): AsyncGenerator<string, void, unknown> {
    const { baseUrl, model } = settings.ollama;
    const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};
    try {
        const requestBody: OllamaGenerateRequest = {
            model: model,
            prompt: prompt,
            stream: true,
            temperature: creativityTemperature,
            top_p: topP,
            num_predict: maxTokens || undefined,
        };

        const response = await fetchWithTimeout(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            timeout: 120000, // 120 seconds, doubled from typical 60
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama API error: ${response.statusText} - ${errorBody}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data: OllamaGenerateResponse = JSON.parse(line);
                        if (data.response) {
                            yield data.response;
                        }
                        if (data.done) {
                            return;
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse streaming response:', parseError);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error calling Ollama streaming API:", error);
        if (error instanceof Error) {
            yield '';
        } else {
            yield '';
        }
    }
};
