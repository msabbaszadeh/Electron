
export enum AppMode {
  CREATION = 'CREATION',
  EXPLORATION = 'EXPLORATION',
  GENERAL_CHAT = 'GENERAL_CHAT',
}

export enum MessageSender {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  modelType?: 'knowledge' | 'rag' | 'explorer'; // Optional field to indicate which model generated this message
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationChat {
    id: string;
    title: string;
    createdAt: string;
    messages: Message[];
}

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  creationChat: Message[];
  jsonData: Record<string, any>;
  explorationChats: ExplorationChat[];
}

export interface Settings {
    provider: 'gemini' | 'ollama' | 'openai' | 'alibaba' | 'huggingface';
    gemini: {
        apiKey?: string;
        model?: string; // e.g., gemini-pro, gemini-1.5-pro
    };
    ollama: {
        baseUrl: string;
        model: string;
    };
    openai: {
        apiKey?: string;
        model?: string; // e.g., gpt-4, gpt-3.5-turbo, gpt-4-turbo
        baseUrl?: string; // for custom endpoints
    };
    alibaba: {
        apiKey?: string;
        model?: string; // e.g., qwen-turbo, qwen-plus, qwen-max
        baseUrl?: string; // Alibaba Cloud endpoint
    };
    huggingface: {
        apiKey?: string;
        model?: string; // e.g., microsoft/DialoGPT-large, facebook/blenderbot-400M-distill
        baseUrl?: string; // HuggingFace Inference API endpoint
    };
    prompts?: {
        [key: string]: string;
        INTERVIEWER_PROMPT: string;
        JSON_MAKER_PROMPT: string;
        EXPLORER_PROMPT: string;
        KNOWLEDGE_BASED_PROMPT?: string;
        RAG_BASED_PROMPT?: string;
    };
    referenceDataset?: string; // Storing content of the file
    referenceDatasetName?: string; // Storing the name of the file
    embedding?: {
        serviceUrl: string; // e.g., http://localhost:8000
        modelName: string; // e.g., BAAI/bge-m3
        rerankModelName?: string; // e.g., BAAI/bge-reranker-v2-m3
    };
    qdrant?: {
        url: string; // Qdrant base URL (local or cloud)
        apiKey?: string; // optional API key
        collection: string; // collection name, e.g., cag_dataset
    };
    rag?: {
        topK: number; // default 30
        hybridWeights: { dense: number; sparse: number }; // e.g., 0.6/0.4
        rerank: {
            enabled: boolean;
            model?: string;
        } | boolean; // whether to apply reranking
        requiredKeywords: string[]; // enforced keywords in queries
        multiValueColumns?: string[]; // dataset columns to split into arrays
        allowDuplicateRetrieval?: boolean; // whether to allow duplicate data retrieval from vector store (default: false)
    };
    contentGeneration?: {
        knowledgeBased?: {
            enabled: boolean; // enable knowledge-based content generation (default: true)
        };
        ragBased?: {
            enabled: boolean; // enable RAG-based content generation (default: true)
        };
    };
    storage?: {
        databaseDir?: string; // local path for Qdrant or general DB files
        chatLogsDir?: string; // local path to store chat logs/exports
        modelCacheDir?: string; // local path for embedding/LLM model cache
        backupDir?: string; // local path for backup files
    };
    advanced?: {
        creativityTemperature?: number; // 0.0 to 2.0, default 0.7
        topP?: number; // 0.0 to 1.0, default 0.9
        maxTokens?: number; // null for unlimited, or specific number
        autoHistoryCleanup?: {
            enabled: boolean;
            daysToKeep: number; // number of days to keep chat history
        };
        reportExport?: {
            format: 'pdf' | 'excel' | 'json';
            includeMetadata: boolean;
        };
    };
}

// Document and search result types for vector services
export interface Document {
    id: string;
    content: string;
    text?: string;
    metadata?: Record<string, any>;
    dense_vector?: number[];
    sparse_vector?: {
        indices: number[];
        values: number[];
    };
}

export interface SearchResult {
    id: string;
    score: number;
    payload: Record<string, any>;
    content?: string;
    text?: string;
    source?: string;
    metadata?: Record<string, any>;
}

export interface QdrantSearchResult {
    id: string | number;
    score: number;
    payload?: Record<string, any>;
    vector?: number[] | Record<string, any>;
}
