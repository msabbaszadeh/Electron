# Embedding Service Integration

This document describes the embedding service integration for the CAG RAG application.

## Overview

The embedding service provides:
- **Text Embeddings**: Convert text to numerical vectors for semantic search
- **Reranking**: Reorder search results based on relevance to a query
- **Health Monitoring**: Service availability and model information
- **Flexible Configuration**: Support for multiple embedding models

## Architecture

### Components

1. **embeddingService.ts** - Core embedding service class
   - `EmbeddingService` class with health check, embedding generation, and reranking
   - Configuration management and service initialization
   - Error handling and fallback mechanisms

2. **embeddingBridge.ts** - Bridge between old and new implementations
   - Maintains backward compatibility with existing code
   - Provides fallback to legacy API if new service fails
   - Wraps new service with legacy interface

3. **Settings Integration** - Configuration through settings modal
   - Service URL configuration
   - Model selection (embedding and reranking)
   - Test functionality with real-time feedback

## Configuration

### Basic Settings

Configure the embedding service in the **Storage & Retrieval** tab:

- **Service URL**: `http://localhost:8000` (default)
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (default)
- **Rerank Model**: `BAAI/bge-reranker-v2-m3` (optional)

### Advanced Configuration

The service supports various embedding models:

**Popular Embedding Models:**
- `sentence-transformers/all-MiniLM-L6-v2` - Fast, good quality
- `sentence-transformers/all-mpnet-base-v2` - Higher quality, slower
- `BAAI/bge-base-en` - State-of-the-art performance
- `BAAI/bge-large-en` - Best quality, resource intensive

**Popular Rerank Models:**
- `BAAI/bge-reranker-base` - Base reranker
- `BAAI/bge-reranker-large` - Large reranker
- `BAAI/bge-reranker-v2-m3` - Latest multimodal reranker

## API Endpoints

The embedding service expects these endpoints:

### Health Check
```
GET /health
Response: { "status": "healthy", "model": "model-name" }
```

### Generate Embeddings
```
POST /embed
{
  "texts": ["text1", "text2"],
  "model": "model-name"
}
Response: { "embeddings": [[...], [...]], "model": "model-name" }
```

### Rerank Documents
```
POST /rerank
{
  "query": "search query",
  "texts": ["doc1", "doc2", "doc3"],
  "model": "rerank-model-name"
}
Response: { "results": [{"index": 0, "score": 0.95, "text": "doc1"}, ...] }
```

## Testing

### Using the Test Interface

Open `test_embedding.html` in your browser to test the embedding service:

1. Configure the service URL and models
2. Click "Test Health" to verify connectivity
3. Click "Test Embedding" to generate embeddings
4. Click "Test Rerank" to test reranking functionality

### Manual Testing

```bash
# Test health
curl http://localhost:8000/health

# Test embedding
curl -X POST http://localhost:8000/embed \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Hello world"], "model": "sentence-transformers/all-MiniLM-L6-v2"}'

# Test reranking
curl -X POST http://localhost:8000/rerank \
  -H "Content-Type: application/json" \
  -d '{"query": "What is AI?", "texts": ["AI is artificial intelligence", "The weather is nice"], "model": "BAAI/bge-reranker-v2-m3"}'
```

## Integration with RAG System

The embedding service integrates with:

1. **Vector Storage**: Embeddings are stored in Qdrant for similarity search
2. **RAG Pipeline**: Used for retrieving relevant context
3. **Reranking**: Improves retrieval quality by reordering results
4. **Content Generation**: Supports both knowledge-based and RAG-based generation

## Error Handling

The system includes comprehensive error handling:

- **Service Unavailable**: Fallback to legacy API or error messaging
- **Model Loading**: Timeout handling and retry mechanisms
- **Invalid Configuration**: Clear error messages in the UI
- **Network Issues**: Graceful degradation with user feedback

## Performance Considerations

- **Batch Processing**: Use `embedBatch` for multiple texts
- **Caching**: Model cache configuration for faster loading
- **Timeout Settings**: Configurable timeouts for different operations
- **Resource Management**: Efficient memory usage for large texts

## Troubleshooting

### Common Issues

1. **Service Connection Failed**
   - Verify service is running on configured URL
   - Check firewall/network settings
   - Test with `test_embedding.html`

2. **Model Loading Issues**
   - Ensure sufficient disk space for model cache
   - Check model name spelling
   - Verify model is available in the service

3. **Performance Issues**
   - Consider using smaller models for faster inference
   - Enable model caching
   - Use batch processing for multiple texts

### Debug Information

The settings modal provides real-time feedback:
- Green indicator: Service connected successfully
- Red indicator: Connection failed with error details
- Model information shows active configuration

## Future Enhancements

Planned improvements:
- Support for multilingual embeddings
- Custom model fine-tuning integration
- Advanced reranking strategies
- Performance monitoring and metrics
- Automatic model selection based on content