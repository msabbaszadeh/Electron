import { QdrantClient } from '@qdrant/js-client-rest';
import { Settings } from '../types';
import { embed } from './embeddingBridge'; // Assuming embed function for single query
import { getClient } from './qdrantService'; // Reuse client from qdrantService

interface SearchResult {
  id: string;
  score: number;
  payload: Record<string, any>;
}

export const hybridSearch = async (query: string, settings: Settings, topK: number): Promise<SearchResult[]> => {
  const qdrant = getClient(settings);
  const collectionName = settings.qdrant.collection;

  // Generate embeddings for the query
  const { dense: queryDense, sparse: querySparse } = await embed(query, settings); // Assume embed returns {dense, sparse}

  // Perform dense search
  const denseResults = await qdrant.search(collectionName, {
    vector: queryDense,
    limit: topK * 2, // Get more to combine
    with_payload: true,
  });

  // For now, skip sparse search as it requires specific setup
  // const sparseResults = await qdrant.search(collectionName, {
  //   vector: querySparse,
  //   limit: topK * 2,
  //   with_payload: true,
  // });

  // Combine results with weighting (using only dense for now)
  const hybridWeights = settings.rag.hybridWeights || { dense: 1.0, sparse: 0.0 };
  const combined = new Map<string, number>();

  denseResults.forEach(res => {
    const id = res.id.toString();
    combined.set(id, (combined.get(id) || 0) + res.score * hybridWeights.dense);
  });

  // sparseResults.forEach(res => {
  //   const id = res.id.toString();
  //   combined.set(id, (combined.get(id) || 0) + res.score * hybridWeights.sparse);
  // });

  // Sort by combined score
  const sorted = Array.from(combined.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK * 2); // Extra for potential filtering

  // Fetch full points for results (since search returns partial)
  const ids = sorted.map(([id]) => id);
  const points = await qdrant.scroll(collectionName, {
    filter: {
      must: [
        {
          has_id: ids
        }
      ]
    },
    limit: ids.length,
    with_payload: true
  });

  // Map back to SearchResult
  let results: SearchResult[] = points.points.map(pt => ({
    id: pt.id.toString(),
    score: combined.get(pt.id.toString()) || 0,
    payload: pt.payload as Record<string, any>,
  })).sort((a, b) => b.score - a.score);

  // Apply requiredKeywords filter
  if (settings.rag.requiredKeywords && settings.rag.requiredKeywords.length > 0) {
    results = results.filter(res => {
      const text = JSON.stringify(res.payload);
      return settings.rag.requiredKeywords.every(kw => text.toLowerCase().includes(kw.toLowerCase()));
    });
  }

  // Apply multiValueColumns to deduplicate
  if (settings.rag.multiValueColumns && settings.rag.multiValueColumns.length > 0) {
    const unique = new Map<string, SearchResult>();
    results.forEach(res => {
      const key = settings.rag.multiValueColumns.map(col => res.payload[col] || '').join('|');
      if (!unique.has(key) || unique.get(key)!.score < res.score) {
        unique.set(key, res);
      }
    });
    results = Array.from(unique.values());
  }

  // Apply rerank if enabled
  if (settings.rag.rerank && typeof settings.rag.rerank === 'object' && settings.rag.rerank.enabled) {
    try {
      const { rerank } = await import('./embeddingBridge');
      const documents = results.map(r => JSON.stringify(r.payload));
      const rerankedResults = await rerank(query, documents, settings, topK);
      
      // Update scores based on reranking
      const rerankedMap = new Map(rerankedResults.map(r => [r.index, r.score]));
      results = results.map((res, idx) => ({
        ...res,
        score: rerankedMap.get(idx) || res.score
      })).sort((a, b) => b.score - a.score);
      
      console.log('Reranking completed with model:', settings.rag.rerank.model);
    } catch (error) {
      console.warn('Reranking failed:', error);
    }
  }

  return results.slice(0, topK);
};