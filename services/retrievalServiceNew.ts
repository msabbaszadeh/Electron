import { QdrantClient } from '@qdrant/js-client-rest';
import { localVectorService } from './localVectorService';
import { qdrantLocalService } from './qdrantLocalService';
import { Document, SearchResult, QdrantSearchResult } from '../types';

// Configuration for vector storage mode
export type VectorStorageMode = 'local' | 'qdrant-local' | 'qdrant-server';

export class RetrievalService {
  private mode: VectorStorageMode;
  private qdrantClient: QdrantClient | null = null;

  constructor(mode: VectorStorageMode = 'local') {
    this.mode = mode;
    console.log(`Retrieval service initialized in ${mode} mode`);
  }

  async initialize(): Promise<void> {
    try {
      switch (this.mode) {
        case 'qdrant-local':
          await qdrantLocalService.initialize();
          break;
        case 'qdrant-server':
          // Server mode would use existing qdrantService
          this.qdrantClient = new QdrantClient({
            url: process.env.QDRANT_URL || 'http://localhost:6333',
          });
          break;
        case 'local':
          // Local service is already initialized
          break;
      }
      console.log('Retrieval service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize retrieval service:', error);
      throw error;
    }
  }

  async createCollection(
    collectionName: string,
    denseVectorSize: number = 1024,
    sparseVectorSize?: number
  ): Promise<void> {
    try {
      switch (this.mode) {
        case 'qdrant-local':
          await qdrantLocalService.createCollection(collectionName, denseVectorSize, sparseVectorSize);
          break;
        case 'qdrant-server':
          if (this.qdrantClient) {
            await this.createQdrantCollection(collectionName, denseVectorSize, sparseVectorSize);
          }
          break;
        case 'local':
          // Local mode doesn't need explicit collection creation
          console.log(`Local mode: Collection ${collectionName} ready (implicit)`);
          break;
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  private async createQdrantCollection(
    collectionName: string,
    denseVectorSize: number,
    sparseVectorSize?: number
  ): Promise<void> {
    if (!this.qdrantClient) return;

    const vectorsConfig: any = {
      dense: {
        size: denseVectorSize,
        distance: 'Cosine'
      }
    };

    if (sparseVectorSize) {
      vectorsConfig.sparse = {
        index: {
          on_disk: false,
        }
      };
    }

    await this.qdrantClient.createCollection(collectionName, {
      vectors: vectorsConfig
    });
  }

  async upsertDocuments(
    collectionName: string,
    documents: Document[]
  ): Promise<void> {
    try {
      switch (this.mode) {
        case 'qdrant-local':
          await qdrantLocalService.upsertDocuments(collectionName, documents);
          break;
        case 'qdrant-server':
          if (this.qdrantClient) {
            await this.upsertToQdrant(collectionName, documents);
          }
          break;
        case 'local':
          await localVectorService.addDocuments(documents);
          break;
      }
    } catch (error) {
      console.error('Failed to upsert documents:', error);
      throw error;
    }
  }

  private async upsertToQdrant(
    collectionName: string,
    documents: Document[]
  ): Promise<void> {
    if (!this.qdrantClient) return;

    const points = documents.map(doc => ({
      id: doc.id,
      vector: {
        dense: doc.dense_vector,
        ...(doc.sparse_vector && {
          sparse: {
            indices: doc.sparse_vector.indices,
            values: doc.sparse_vector.values
          }
        })
      },
      payload: {
        text: doc.text,
        metadata: doc.metadata || {}
      }
    }));

    await this.qdrantClient.upsert(collectionName, {
      points: points
    });
  }

  async hybridSearch(
    collectionName: string,
    query: string,
    queryVector: number[],
    querySparseVector?: { indices: number[]; values: number[] },
    limit: number = 10,
    alpha: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      switch (this.mode) {
        case 'qdrant-local':
          return await qdrantLocalService.hybridSearch(
            collectionName,
            queryVector,
            querySparseVector,
            limit,
            alpha
          );
        case 'qdrant-server':
          if (this.qdrantClient) {
            return await this.hybridSearchQdrant(
              collectionName,
              queryVector,
              querySparseVector,
              limit,
              alpha
            );
          }
          break;
        case 'local':
          return await localVectorService.hybridSearch(query, limit, alpha);
      }
      
      return [];
    } catch (error) {
      console.error('Hybrid search failed:', error);
      throw error;
    }
  }

  private async hybridSearchQdrant(
    collectionName: string,
    queryVector: number[],
    querySparseVector?: { indices: number[]; values: number[] },
    limit: number = 10,
    alpha: number = 0.7
  ): Promise<SearchResult[]> {
    if (!this.qdrantClient) return [];

    // Dense vector search
    const denseResults = await this.qdrantClient.search(collectionName, {
      vector: {
        name: 'dense',
        vector: queryVector
      },
      limit: limit
    });

    let sparseResults: any[] = [];
    
    // Sparse vector search if available
    if (querySparseVector) {
      sparseResults = await this.qdrantClient.search(collectionName, {
        vector: {
          name: 'sparse',
          vector: querySparseVector
        },
        limit: limit
      });
    }

    // Combine results using reciprocal rank fusion
    return this.combineResults(denseResults, sparseResults, alpha);
  }

  private combineResults(
    denseResults: any[],
    sparseResults: any[],
    alpha: number
  ): SearchResult[] {
    const combined = new Map<string, SearchResult>();

    // Process dense results
    denseResults.forEach((result, index) => {
      const score = result.score || (1 - result.distance);
      combined.set(result.id, {
        id: result.id,
        payload: result.payload,
        text: result.payload.text,
        metadata: result.payload.metadata,
        score: score * alpha,
        source: 'dense'
      });
    });

    // Process sparse results
    sparseResults.forEach((result, index) => {
      const score = result.score || (1 - result.distance);
      const existing = combined.get(result.id);
      
      if (existing) {
        // Combine scores for documents found in both
        existing.score += score * (1 - alpha);
        existing.source = 'hybrid';
      } else {
        combined.set(result.id, {
          id: result.id,
          payload: result.payload,
          text: result.payload.text,
          metadata: result.payload.metadata,
          score: score * (1 - alpha),
          source: 'sparse'
        });
      }
    });

    // Sort by combined score and return
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async getCollections(): Promise<string[]> {
    try {
      switch (this.mode) {
        case 'qdrant-local':
          return await qdrantLocalService.getCollections();
        case 'qdrant-server':
          if (this.qdrantClient) {
            const collections = await this.qdrantClient.getCollections();
            return collections.collections.map(c => c.name);
          }
          break;
        case 'local':
          return ['local_collection']; // Local mode has one implicit collection
      }
      return [];
    } catch (error) {
      console.error('Failed to get collections:', error);
      throw error;
    }
  }

  getDocumentCount(): number {
    if (this.mode === 'local') {
      return localVectorService.getDocumentCount();
    }
    return 0;
  }

  clear(): void {
    if (this.mode === 'local') {
      localVectorService.clear();
    }
  }

  getMode(): VectorStorageMode {
    return this.mode;
  }
}

// Export singleton with local mode as default for security
export const retrievalService = new RetrievalService('local');