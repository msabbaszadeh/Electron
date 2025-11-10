import { Settings } from '../types';

export interface EmbeddingServiceConfig {
  serviceUrl: string;
  modelName: string;
  rerankModelName?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface RerankResponse {
  results: Array<{
    index: number;
    score: number;
    text: string;
  }>;
  model: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  model?: string;
  error?: string;
}

class EmbeddingService {
  private config: EmbeddingServiceConfig;

  constructor(config: EmbeddingServiceConfig) {
    this.config = config;
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResponse> {
    try {
      const response = await fetch(`${this.config.serviceUrl}/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts,
          model: this.config.modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async rerank(query: string, texts: string[]): Promise<RerankResponse> {
    if (!this.config.rerankModelName) {
      throw new Error('Rerank model not configured');
    }

    try {
      const response = await fetch(`${this.config.serviceUrl}/rerank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          texts,
          model: this.config.rerankModelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Rerank service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reranking:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<ServiceHealth> {
    try {
      const response = await fetch(`${this.config.serviceUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          status: 'unhealthy',
          error: `HTTP ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        status: 'healthy',
        model: data.model || this.config.modelName,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  updateConfig(newConfig: Partial<EmbeddingServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const createEmbeddingService = (settings: Settings): EmbeddingService => {
  const config: EmbeddingServiceConfig = {
    serviceUrl: settings.embedding?.serviceUrl || 'http://localhost:8000',
    modelName: settings.embedding?.modelName || 'sentence-transformers/all-MiniLM-L6-v2',
    rerankModelName: settings.embedding?.rerankModelName,
  };

  return new EmbeddingService(config);
};

export const testEmbeddingService = async (settings: Settings): Promise<{
  ok: boolean;
  info?: ServiceHealth;
  error?: string;
}> => {
  try {
    const service = createEmbeddingService(settings);
    const health = await service.healthCheck();
    
    if (health.status === 'healthy') {
      return { ok: true, info: health };
    } else {
      return { ok: false, error: health.error || 'Service unhealthy' };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to test embedding service',
    };
  }
};

export default EmbeddingService;