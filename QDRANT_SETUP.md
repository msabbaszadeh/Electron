# Qdrant Cloud Setup Guide for RAG System

## Quick Setup Steps

1. **Create Qdrant Cloud Account**
   - Visit: https://cloud.qdrant.io/
   - Sign up with email, Google, or GitHub
   - No credit card required for free tier

2. **Create Free Cluster**
   - Click "Create Cluster"
   - Choose "Free" tier
   - Name your cluster (e.g., "rag-system")
   - Wait for cluster to be provisioned

3. **Get API Key**
   - Go to your cluster details
   - Click "API Keys" tab
   - Click "Create API Key"
   - Name: "rag-system-key"
   - Copy the key (it won't be shown again)

4. **Get Cluster URL**
   - From cluster dashboard, copy the URL
   - Format: `https://xyz-example.cloud-region.cloud-provider.cloud.qdrant.io`

5. **Update Environment Variables**
   Add to your `.env.local` file:
   ```
   QDRANT_URL=https://your-cluster-url.cloud.qdrant.io
   QDRANT_API_KEY=your-api-key-here
   ```

## Free Tier Limits
- **RAM**: 1GB
- **Storage**: 4GB
- **vCPU**: 0.5
- **Vectors**: ~1M vectors of 768 dimensions
- **Auto-suspend**: After 1 week of inactivity
- **Auto-delete**: After 4 weeks of inactivity

## Testing Connection
After setup, test your connection:

```bash
# Test with curl
curl -X GET https://your-cluster-url.cloud.qdrant.io:6333 \
  --header 'api-key: your-api-key'

# Should return: {"title":"qdrant - vector search engine","version":"1.x.x"}
```

## Alternative: Local Qdrant
If you have Docker installed locally:
```bash
docker run -p 6333:6333 qdrant/qdrant
```

Then use `QDRANT_URL=http://localhost:6333` in your `.env.local`