import { QdrantClient } from '@qdrant/js-client-rest';
import { Settings } from '../types';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { embedBatch, SparseVector } from './embeddingBridge';

let client: QdrantClient | null = null;

export const getClient = (settings: Settings): QdrantClient => {
  if (!client) {
    const url = settings.qdrant?.url || 'http://localhost:6333';
    const apiKey = settings.qdrant?.apiKey;
    client = new QdrantClient({ url, apiKey });
  }
  return client;
};

export const createCollection = async (settings: Settings, collectionName: string): Promise<void> => {
  const qdrant = getClient(settings);
  
  // Check if collection exists
  try {
    await qdrant.getCollection(collectionName);
    console.log(`Collection ${collectionName} already exists.`);
    return;
  } catch (error) {
    // Collection doesn't exist, continue to create it
  }

  // Create collection with named vectors for dense and sparse
  await qdrant.createCollection(collectionName, {
    vectors: {
      dense: {
        size: 1024, // Assuming BGE-M3 dense dimension
        distance: 'Cosine',
      }
    },
    // Additional config for sparse if needed, like full_text
    sparse_vectors: {
      sparse: {
        modifier: 'idf', // Optional for BM25-like scoring
      }
    }
  });

  console.log(`Collection ${collectionName} created with dense and sparse named vectors.`);
};

// Function to upsert dataset points
export const upsertDataset = async (settings: Settings, collectionName: string): Promise<void> => {
  const qdrant = getClient(settings);
  const dataset = settings.referenceDataset;
  if (!dataset) {
    throw new Error('No reference dataset provided in settings.');
  }

  // Parse CSV dataset using papaparse
  const parsed = Papa.parse(dataset, { header: true, skipEmptyLines: true });
  const rows = parsed.data as Record<string, string>[];
  const headers = parsed.meta.fields || [];

  // Prepare texts for embedding: concatenate row values
  const texts = rows.map(row => headers.map(h => row[h] || '').join(' '));

  // Get batch embeddings (dense and sparse)
  const embeddings = await embedBatch(texts, settings);

  // Prepare points
  const points = rows.map((row, index) => {
    const denseVec = embeddings.dense[index];
    const sparseVec: SparseVector = embeddings.sparse[index]; // {indices, values}

    return {
      id: uuidv4(), // or use index.toString()
      vector: {
        dense: denseVec,
        sparse: sparseVec
      },
      payload: row
    };
  });

  // Batch upsert
  await qdrant.upsert(collectionName, { points, wait: true });

  console.log(`Upserted ${points.length} points to collection ${collectionName}.`);
};