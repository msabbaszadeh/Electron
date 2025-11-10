
import { Message, Settings, Profile, ExplorationChat } from "../types";
import { runGemini, runGeminiStream } from "./geminiService";
import { runOllama, runOllamaStream } from "./ollamaService";
import { runOpenAI, runOpenAIStream } from "./openaiService";
import { runAlibaba, runAlibabaStream } from "./alibabaService";
import { runHuggingFace, runHuggingFaceStream } from "./huggingfaceService";
import { hybridSearch } from './retrievalService';

const formatHistoryForPrompt = (messages: Message[]): string => {
  return messages.map(m => `${m.sender}: ${m.text}`).join('\n');
};

const getDatasetContext = (settings: Settings): { snippet: string, columns: string } => {
    if (!settings.referenceDataset) {
        return { snippet: 'No dataset provided.', columns: 'N/A' };
    }
    // Simple logic to get first few lines as snippet
    const lines = settings.referenceDataset.split('\n');
    const columns = lines[0] || 'N/A';
    const snippet = lines.slice(0, 6).join('\n'); // Header + 5 rows
    return { snippet, columns };
}


// Helper function to route to appropriate LLM service
const runLLM = async (prompt: string, settings: Settings): Promise<string> => {
    switch (settings.provider) {
        case 'gemini':
            return runGemini(prompt, settings);
        case 'ollama':
            return runOllama(prompt, settings);
        case 'openai':
            return runOpenAI(prompt, settings);
        case 'alibaba':
            return runAlibaba(prompt, settings);
        case 'huggingface':
            return runHuggingFace(prompt, settings);
        default:
            throw new Error(`Unsupported provider: ${settings.provider}`);
    }
};

// Helper function to route to appropriate streaming LLM service
const runLLMStream = async function* (prompt: string, settings: Settings): AsyncGenerator<string, void, unknown> {
    switch (settings.provider) {
        case 'gemini':
            yield* runGeminiStream(prompt, settings);
            break;
        case 'ollama':
            yield* runOllamaStream(prompt, settings);
            break;
        case 'openai':
            yield* runOpenAIStream(prompt, settings);
            break;
        case 'alibaba':
            yield* runAlibabaStream(prompt, settings);
            break;
        case 'huggingface':
            yield* runHuggingFaceStream(prompt, settings);
            break;
        default:
            throw new Error(`Unsupported provider: ${settings.provider}`);
    }
};

export const runInterviewerAgent = async (
    messages: Message[], 
    userInput: string,
    settings: Settings,
    fileContent?: string
): Promise<string> => {
    const history = formatHistoryForPrompt(messages);
    const prompt = settings.prompts?.INTERVIEWER_PROMPT || '';
    
    // Create a combined prompt for non-chat models.
    const fullPrompt = `${prompt}\n\nConversation History:\n${history}\n\nUSER: ${userInput}\nAI:`;

    return runLLM(fullPrompt, settings);
};

export const runJsonMakerAgent = async (
    messages: Message[],
    settings: Settings
): Promise<Record<string, any> | null> => {
    const history = formatHistoryForPrompt(messages);
    let prompt = settings.prompts?.JSON_MAKER_PROMPT || '';
    prompt = prompt.replace('{CONVERSATION_HISTORY}', history);

    const responseText = await runLLM(prompt, settings);

    try {
        // Clean up the response text to ensure it's valid JSON
        const jsonString = responseText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON from AI response:", error);
        console.error("Raw response was:", responseText);
        return null;
    }
};


export const runExplorerAgent = async (
    profile: Profile,
    chat: ExplorationChat,
    userInput: string,
    settings: Settings
): Promise<string> => {
    
    const history = formatHistoryForPrompt(chat.messages);
    const profileJson = JSON.stringify(profile.jsonData, null, 2);

    // Retrieve relevant context using RAG
    const topK = settings.rag.topK || 5;
    const retrieved = await hybridSearch(userInput, settings, topK);
    
    // Format retrieved context
    const context = retrieved.map(res => JSON.stringify(res.payload, null, 2)).join('\n\n');
    
    // Get columns from settings or first result (assuming CSV header in settings)
    const columns = settings.referenceDataset?.split('\n')[0] || 'N/A';

    let prompt = (settings.prompts?.EXPLORER_PROMPT || '')
        .replace('{PROFILE_JSON}', profileJson)
        .replace('{DATASET_SNIPPET}', context) // Now using retrieved context instead of manual snippet
        .replace('{DATASET_COLUMNS}', columns)
        .replace('{CONVERSATION_HISTORY}', history)
        .replace('{USER_INPUT}', userInput);

    return runLLM(prompt, settings);
};

export const runGeneralChatAgent = async (
    messages: Message[],
    userInput: string,
    settings: Settings
): Promise<string> => {
    const history = formatHistoryForPrompt(messages);
    
    // Check if we have a reference dataset to provide context
    let context = '';
    if (settings.referenceDataset && settings.referenceDataset.trim()) {
        try {
            // Use RAG to get relevant context
            const topK = settings.rag?.topK || 3;
            const retrieved = await hybridSearch(userInput, settings, topK);
            context = retrieved.map(res => JSON.stringify(res.payload, null, 2)).join('\n\n');
        } catch (error) {
            console.warn('RAG search failed, continuing without context:', error);
        }
    }

    // Create a general chat prompt
    let prompt = settings.prompts?.GENERAL_CHAT_PROMPT || `You are a helpful AI assistant. Answer the user's questions clearly and accurately.

${context ? `Here is some relevant context from the reference dataset:
${context}

` : ''}Conversation History:
${history}

USER: ${userInput}
AI:`;

    // Replace placeholders if they exist
    if (settings.prompts?.GENERAL_CHAT_PROMPT) {
        prompt = settings.prompts.GENERAL_CHAT_PROMPT
            .replace('{CONVERSATION_HISTORY}', history)
            .replace('{USER_INPUT}', userInput)
            .replace('{CONTEXT}', context)
            .replace('{DATASET_AVAILABLE}', settings.referenceDataset ? 'true' : 'false');
    }

    return runLLM(prompt, settings);
};

export const runGeneralChatAgentStream = async function* (
    messages: Message[],
    userInput: string,
    settings: Settings
): AsyncGenerator<string, void, unknown> {
    const history = formatHistoryForPrompt(messages);
    
    // Check if we have a reference dataset to provide context
    let context = '';
    if (settings.referenceDataset && settings.referenceDataset.trim()) {
        try {
            // Use RAG to get relevant context
            const topK = settings.rag?.topK || 3;
            const retrieved = await hybridSearch(userInput, settings, topK);
            context = retrieved.map(res => JSON.stringify(res.payload, null, 2)).join('\n\n');
        } catch (error) {
            console.warn('RAG search failed, continuing without context:', error);
        }
    }

    // Create a general chat prompt
    let prompt = settings.prompts?.GENERAL_CHAT_PROMPT || `You are a helpful AI assistant. Answer the user's questions clearly and accurately.

${context ? `Here is some relevant context from the reference dataset:
${context}

` : ''}Conversation History:
${history}

USER: ${userInput}
AI:`;

    // Replace placeholders if they exist
    if (settings.prompts?.GENERAL_CHAT_PROMPT) {
        prompt = settings.prompts.GENERAL_CHAT_PROMPT
            .replace('{CONVERSATION_HISTORY}', history)
            .replace('{USER_INPUT}', userInput)
            .replace('{CONTEXT}', context)
            .replace('{DATASET_AVAILABLE}', settings.referenceDataset ? 'true' : 'false');
    }

    yield* runLLMStream(prompt, settings);
};

export const runKnowledgeBasedAgent = async (
    profile: Profile,
    chat: ExplorationChat,
    userInput: string,
    settings: Settings
): Promise<string> => {
    
    const history = formatHistoryForPrompt(chat.messages);
    const profileJson = JSON.stringify(profile.jsonData, null, 2);

    // Get columns from settings or use default
    const columns = settings.referenceDataset?.split('\n')[0] || 'N/A';

    let prompt = (settings.prompts?.KNOWLEDGE_BASED_PROMPT || '')
        .replace('{PROFILE_JSON}', profileJson)
        .replace('{DATASET_COLUMNS}', columns)
        .replace('{CONVERSATION_HISTORY}', history)
        .replace('{USER_INPUT}', userInput);

    return runLLM(prompt, settings);
};

export const runRAGBasedAgent = async (
    profile: Profile,
    chat: ExplorationChat,
    userInput: string,
    settings: Settings
): Promise<string> => {
    
    const history = formatHistoryForPrompt(chat.messages);
    const profileJson = JSON.stringify(profile.jsonData, null, 2);

    // Retrieve relevant context using RAG
    const topK = settings.rag.topK || 5;
    const retrieved = await hybridSearch(userInput, settings, topK);
    
    // Format retrieved context
    const context = retrieved.map(res => JSON.stringify(res.payload, null, 2)).join('\n\n');
    
    // Get columns from settings or first result
    const columns = settings.referenceDataset?.split('\n')[0] || 'N/A';

    let prompt = (settings.prompts?.RAG_BASED_PROMPT || '')
        .replace('{PROFILE_JSON}', profileJson)
        .replace('{DATASET_SNIPPET}', context)
        .replace('{DATASET_COLUMNS}', columns)
        .replace('{CONVERSATION_HISTORY}', history)
        .replace('{USER_INPUT}', userInput);

    return runLLM(prompt, settings);
};
