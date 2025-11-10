import { Document, SearchResult } from '../types';
import { embeddingBridge } from './embeddingBridge';

// Simple local vector search without external database
export class LocalVectorService {
  private documentStore: Map<string, Document> = new Map();
  private vectorIndex: Map<string, number[]> = new Map();
  private maxDocuments = 10000; // Limit for memory usage

  constructor() {
    console.log('Local Vector Service initialized');
  }

  async addDocuments(documents: Document[]): Promise<void> {
    try {
      for (const doc of documents) {
        if (this.documentStore.size >= this.maxDocuments) {
          console.warn('Document store full, removing oldest documents');
          const oldestKey = this.documentStore.keys().next().value;
          this.documentStore.delete(oldestKey);
          this.vectorIndex.delete(oldestKey);
        }

        this.documentStore.set(doc.id, doc);
        if (doc.dense_vector) {
          this.vectorIndex.set(doc.id, doc.dense_vector);
        }
      }
      console.log(`Added ${documents.length} documents to local store`);
    } catch (error) {
      console.error('Failed to add documents:', error);
      throw error;
    }
  }

  async search(
    query: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await embeddingBridge.generateEmbedding(query);
      
      if (!queryEmbedding) {
        throw new Error('Failed to generate query embedding');
      }

      const results: SearchResult[] = [];

      // Calculate similarity for each document
      for (const [docId, docVector] of this.vectorIndex.entries()) {
        const document = this.documentStore.get(docId);
        if (!document) continue;

        const similarity = this.cosineSimilarity(queryEmbedding, docVector);
        
        if (similarity >= threshold) {
          results.push({
            id: docId,
            text: document.text,
            metadata: document.metadata,
            score: similarity,
            source: 'local_dense',
            payload: document.metadata || {}
          });
        }
      }

      // Sort by similarity and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Local search failed:', error);
      throw error;
    }
  }

  async hybridSearch(
    query: string,
    limit: number = 10,
    alpha: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      // For local service, we'll do dense search + keyword matching
      const denseResults = await this.search(query, limit * 2, 0.5);
      
      // Simple keyword-based search for sparse component
      const keywordResults = this.keywordSearch(query, limit * 2);
      
      // Combine results
      return this.combineResults(denseResults, keywordResults, alpha);
    } catch (error) {
      console.error('Local hybrid search failed:', error);
      throw error;
    }
  }

  private keywordSearch(query: string, limit: number): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    for (const [docId, document] of this.documentStore.entries()) {
      const docText = document.text.toLowerCase();
      let matchCount = 0;

      for (const term of queryTerms) {
        if (docText.includes(term)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const keywordScore = matchCount / queryTerms.length;
        results.push({
          id: docId,
          text: document.text,
          metadata: document.metadata,
          score: keywordScore,
          source: 'local_keyword',
          payload: document.metadata || {}
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private combineResults(
    denseResults: SearchResult[],
    keywordResults: SearchResult[],
    alpha: number
  ): SearchResult[] {
    const combined = new Map<string, SearchResult>();

    // Process dense results
    denseResults.forEach(result => {
      combined.set(result.id, {
        ...result,
        score: result.score * alpha
      });
    });

    // Process keyword results
    keywordResults.forEach(result => {
      const existing = combined.get(result.id);
      
      if (existing) {
        // Combine scores for documents found in both
        existing.score += result.score * (1 - alpha);
        existing.source = 'hybrid';
      } else {
        combined.set(result.id, {
          ...result,
          score: result.score * (1 - alpha)
        });
      }
    });

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  getDocumentCount(): number {
    return this.documentStore.size;
  }

  clear(): void {
    this.documentStore.clear();
    this.vectorIndex.clear();
    console.log('Local vector store cleared');
  }
}

// Export singleton instance
export const localVectorService = new LocalVectorService();