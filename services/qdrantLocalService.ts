import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import { Document, SearchResult, QdrantSearchResult } from '../types';

// Local Qdrant service that uses in-memory or file-based storage
export class QdrantLocalService {
  private client: QdrantClient;
  private isInitialized = false;

  constructor() {
    // Use local mode - in-memory or persistent file storage
    this.client = new QdrantClient({
      url: ':memory:', // In-memory mode for development
      // For persistent storage, use: path: './qdrant_data/local.db'
    });
  }

  async initialize(): Promise<void> {
    try {
      // Check if client is working
      const collections = await this.client.getCollections();
      console.log('Local Qdrant initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize local Qdrant:', error);
      throw error;
    }
  }

  async createCollection(
    collectionName: string,
    denseVectorSize: number = 1024,
    sparseVectorSize?: number
  ): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === collectionName);
      
      if (exists) {
        console.log(`Collection ${collectionName} already exists`);
        return;
      }

      // Create collection with both dense and sparse vector support
      const vectorsConfig: Record<string, any> = {
        dense: {
          size: denseVectorSize,
          distance: 'Cosine'
        }
      };

      if (sparseVectorSize) {
        vectorsConfig.sparse = {
          size: sparseVectorSize,
          distance: 'Dot'
        };
      }

      await this.client.createCollection(collectionName, {
        vectors: vectorsConfig
      });

      console.log(`Collection ${collectionName} created successfully`);
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  async upsertDocuments(
    collectionName: string,
    documents: Document[]
  ): Promise<void> {
    try {
      const points = documents.map(doc => ({
        id: doc.id,
        vector: {
          dense: doc.dense_vector || [],
          ...(doc.sparse_vector ? { sparse: doc.sparse_vector } : {})
        },
        payload: {
          content: doc.content,
          ...doc.metadata
        }
      }));

      await this.client.upsert(collectionName, {
        wait: true,
        points
      });

      console.log(`Upserted ${documents.length} documents to ${collectionName}`);
    } catch (error) {
      console.error('Failed to upsert documents:', error);
      throw error;
    }
  }

  async hybridSearch(
    collectionName: string,
    denseVector: number[],
    sparseVector?: { indices: number[]; values: number[] },
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      // Perform dense search
      const denseResults = await this.client.search(collectionName, {
        vector: { name: 'dense', vector: denseVector },
        limit,
        score_threshold: threshold,
        with_payload: true
      });

      // Perform sparse search if sparse vector is provided
      let sparseResults: QdrantSearchResult[] = [];
      if (sparseVector) {
        sparseResults = await this.client.search(collectionName, {
          vector: { name: 'sparse', vector: sparseVector },
          limit,
          score_threshold: threshold,
          with_payload: true
        });
      }

      // Combine and deduplicate results
      const combinedResults = this.combineSearchResults(denseResults, sparseResults);
      
      return combinedResults.map(result => ({
        id: String(result.id),
        score: result.score,
        payload: result.payload || {},
        content: result.payload?.content || ''
      }));
    } catch (error) {
      console.error('Hybrid search failed:', error);
      throw error;
    }
  }

  private combineSearchResults(
    denseResults: QdrantSearchResult[],
    sparseResults: QdrantSearchResult[],
    denseWeight: number = 0.6,
    sparseWeight: number = 0.4
  ): QdrantSearchResult[] {
    const resultMap = new Map<string, QdrantSearchResult>();

    // Add dense results
    for (const result of denseResults) {
      const id = String(result.id);
      resultMap.set(id, {
        ...result,
        score: result.score * denseWeight
      });
    }

    // Add sparse results and combine scores
    for (const result of sparseResults) {
      const id = String(result.id);
      const existing = resultMap.get(id);
      
      if (existing) {
        // Combine scores
        existing.score += result.score * sparseWeight;
      } else {
        resultMap.set(id, {
          ...result,
          score: result.score * sparseWeight
        });
      }
    }

    // Sort by combined score
    return Array.from(resultMap.values())
      .sort((a, b) => b.score - a.score);
  }

  async getCollections(): Promise<string[]> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.map(c => c.name);
    } catch (error) {
      console.error('Failed to get collections:', error);
      throw error;
    }
  }

  async deleteCollection(collectionName: string): Promise<void> {
    try {
      await this.client.deleteCollection(collectionName);
      console.log(`Collection ${collectionName} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const qdrantLocalService = new QdrantLocalService();