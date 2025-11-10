import type { Settings } from "../types";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { createEmbeddingService, testEmbeddingService as newTestEmbeddingService } from './embeddingService';

export interface SparseVector {
  indices: number[];
  values: number[];
}

export interface EmbedResult {
  dense: number[];
  sparse: SparseVector;
}

export interface EmbedBatchResult {
  dense: number[][];
  sparse: SparseVector[];
}

const jsonHeaders = (apiKey?: string) => ({
  "Content-Type": "application/json",
  ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
});

// Updated test function using the new embedding service
export async function testEmbeddingService(settings: Settings): Promise<{ ok: boolean; info?: any; error?: any }>{
  try {
    const result = await newTestEmbeddingService(settings);
    if (result.ok) {
      return { ok: true, info: result.info };
    } else {
      return { ok: false, error: result.error };
    }
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function embed(text: string, settings: Settings): Promise<EmbedResult> {
  try {
    const service = createEmbeddingService(settings);
    const response = await service.generateEmbeddings([text]);
    
    // Convert the new format to the old format for compatibility
    return {
      dense: response.embeddings[0],
      sparse: {
        indices: [],
        values: []
      }
    };
  } catch (error) {
    // Fallback to old implementation if new service fails
    const base = settings.embedding?.serviceUrl || "http://localhost:8000";
    const model_name = settings.embedding?.modelName || "BAAI/bge-m3";
    const cache_dir = settings.storage?.modelCacheDir;
    const res = await fetchWithTimeout(`${base}/embed`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ text, model_name, cache_dir }),
      timeout: 120000,
    });
    if (!res.ok) throw new Error(`embed failed: ${res.status}`);
    const data = await res.json();
    return data as EmbedResult;
  }
}

export async function embedBatch(texts: string[], settings: Settings): Promise<EmbedBatchResult> {
  try {
    const service = createEmbeddingService(settings);
    const response = await service.generateEmbeddings(texts);
    
    // Convert the new format to the old format for compatibility
    return {
      dense: response.embeddings,
      sparse: response.embeddings.map(() => ({
        indices: [],
        values: []
      }))
    };
  } catch (error) {
    // Fallback to old implementation if new service fails
    const base = settings.embedding?.serviceUrl || "http://localhost:8000";
    const model_name = settings.embedding?.modelName || "BAAI/bge-m3";
    const cache_dir = settings.storage?.modelCacheDir;
    const res = await fetchWithTimeout(`${base}/embed_batch`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ texts, model_name, cache_dir }),
      timeout: 120000,
    });
    if (!res.ok) throw new Error(`embed_batch failed: ${res.status}`);
    const data = await res.json();
    return data as EmbedBatchResult;
  }
}

export async function rerank(query: string, documents: string[], settings: Settings, topK?: number): Promise<{ index: number; score: number }[]> {
  try {
    const service = createEmbeddingService(settings);
    const response = await service.rerank(query, documents);
    
    // Convert to the expected format and apply topK if specified
    const results = response.results.map(result => ({
      index: result.index,
      score: result.score
    }));
    
    return topK ? results.slice(0, topK) : results;
  } catch (error) {
    // Fallback to old implementation if new service fails
    const base = settings.embedding?.serviceUrl || "http://localhost:8000";
    const model_name = settings.embedding?.rerankModelName || "BAAI/bge-reranker-v2-m3";
    const cache_dir = settings.storage?.modelCacheDir;
    const res = await fetchWithTimeout(`${base}/rerank`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ query, documents, model_name, top_k: topK, cache_dir }),
      timeout: 120000,
    });
    if (!res.ok) throw new Error(`rerank failed: ${res.status}`);
    const data = await res.json();
    return (data?.results || []) as { index: number; score: number }[];
  }
}

export const embeddingBridge = {
  testEmbeddingService,
  embed,
  embedBatch,
  rerank,
  
  // Helper function for generating single embedding
  async generateEmbedding(text: string, settings?: Settings): Promise<number[] | null> {
    try {
      const defaultSettings: Settings = {
        provider: 'gemini',
        gemini: {},
        openai: {},
        alibaba: {},
        huggingface: {},
        ollama: { baseUrl: 'http://localhost:11434', model: 'llama2' },
        embedding: {
          serviceUrl: 'http://localhost:8000',
          modelName: 'BAAI/bge-m3'
        }
      };
      
      const result = await embed(text, settings || defaultSettings);
      return result.dense;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      return null;
    }
  }
};