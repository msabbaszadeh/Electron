# Electron
Open-source, local, and personalized recommendation system powered by RAG and LLMs. Flexible, private, and intelligent — meet Electron.

# Personalized NLP & RAG System

A cutting-edge, multi-modal AI platform that combines advanced Natural Language Processing, Retrieval-Augmented Generation (RAG), and personalized recommendation systems. Built with TypeScript, React, and Python, this system provides intelligent content generation with multi-service AI integration and vector database capabilities.

## 🚀 Key Features

### Advanced AI Integration
- **Multi-Service Architecture**: Seamless integration with OpenAI, Google Gemini, Alibaba Cloud, Hugging Face, and Ollama
- **Advanced Generation Controls**: Fine-tuned parameters including Top-P sampling, temperature control, and max token limits
- **Streaming Support**: Real-time response generation with streaming capabilities
- **Preset Configurations**: Creative, Balanced, Precise, and Unlimited modes for optimal output

### RAG (Retrieval-Augmented Generation)
- **Vector Database Integration**: Full Qdrant vector database support with local and cloud deployment options
- **Embedding Services**: Advanced text embedding with multiple providers (OpenAI, Hugging Face, local models)
- **Hybrid Retrieval**: Combines vector similarity with traditional search methods
- **Context-Aware Generation**: Intelligent document retrieval and context injection

### Personalized Recommendation System
- **Profile-Based Recommendations**: Dynamic user profiling with JSON-based configuration
- **Multi-Agent Architecture**: 
  - Knowledge-Based Agent for domain expertise
  - RAG-Based Agent for contextual information retrieval
  - Explorer Agent for creative exploration
- **Chat History Management**: Persistent conversation tracking with session management
- **Real-time Profile Updates**: Dynamic profile evolution based on interactions

### Technical Architecture
- **Microservices Design**: Modular service architecture with clear separation of concerns
- **TypeScript Implementation**: Full type safety with comprehensive type definitions
- **React Frontend**: Modern React with hooks, context, and functional components
- **Python Backend**: FastAPI-based embedding service with async processing
- **Vector Operations**: Advanced vector similarity calculations and indexing

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Context API** for state management
- **Custom Hooks** for business logic separation

### Backend Services
- **Python FastAPI** for embedding services
- **Qdrant** vector database
- **Multiple AI Providers**: OpenAI, Google, Alibaba, Hugging Face, Ollama
- **Async Processing** for non-blocking operations

### Data Processing
- **Advanced Text Processing**: Tokenization, embedding, and similarity calculation
- **JSON Configuration**: Flexible profile and settings management
- **File Upload Support**: Multi-format document processing
- **Real-time Data Streaming** for responsive user experience

## 📊 AI/ML Capabilities

### Natural Language Processing
- **Multi-language Support**: Internationalization-ready architecture
- **Context Understanding**: Advanced context window management
- **Semantic Search**: Vector-based similarity search
- **Text Classification**: Intelligent content categorization

### Machine Learning Features
- **Adaptive Learning**: Profile evolution based on user interactions
- **Recommendation Algorithms**: Multi-strategy recommendation system
- **Embedding Models**: Support for multiple embedding providers
- **Similarity Calculations**: Advanced vector mathematics for content matching

### RAG Implementation
- **Document Retrieval**: Efficient document chunking and retrieval
- **Context Injection**: Intelligent context building for generation
- **Source Attribution**: Transparent source tracking and citation
- **Hybrid Search**: Combines keyword and semantic search

## 🔧 Configuration & Customization

### Advanced Settings
```typescript
interface AdvancedSettings {
  creativityTemperature: number;  // 0.0 - 2.0
  topP: number;                 // 0.0 - 1.0
  maxTokens: number | null;     // Token limit control
  preset: 'creative' | 'balanced' | 'precise' | 'unlimited';
}
```

### Profile Configuration
```typescript
interface Profile {
  id: string;
  name: string;
  jsonData: Record<string, any>;
  creationChat: Message[];
  explorationChats: ExplorationChat[];
  createdAt: string;
}
```

### Service Integration
```typescript
interface Settings {
  openai?: { apiKey: string; model: string; };
  gemini?: { apiKey: string; model: string; };
  alibaba?: { apiKey: string; model: string; };
  huggingface?: { apiKey: string; model: string; };
  ollama?: { model: string; baseURL: string; };
  // ... additional configurations
}
```

## 🎯 Use Cases

### Content Generation
- **Personalized Content Creation**: Tailored content based on user profiles
- **Multi-style Writing**: Creative, technical, and balanced writing modes
- **Context-Aware Responses**: Intelligent response generation with historical context

### Knowledge Management
- **Document Intelligence**: Smart document processing and retrieval
- **Knowledge Base Integration**: Corporate knowledge base enhancement
- **Research Assistance**: Academic and professional research support

### Recommendation Systems
- **Personalized Suggestions**: User-specific content recommendations
- **Multi-domain Expertise**: Cross-domain knowledge integration
- **Adaptive Learning**: Continuous improvement based on user feedback

## 🔒 Security & Privacy

- **Local Processing**: Option for completely local AI processing with Ollama
- **API Key Management**: Secure API key storage and management
- **Data Privacy**: Local data processing options for sensitive information
- **Encryption**: Secure data transmission and storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Qdrant vector database (optional, for RAG features)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/personalized-nlp-rag-system.git

# Install frontend dependencies
npm install

# Install Python dependencies for embedding service
cd embedding_service
pip install -r requirements.txt

# Start Qdrant (optional)
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Start the development server
npm run dev
```

### Configuration
1. Set up your API keys in the settings panel
2. Configure your preferred AI providers
3. Set up vector database connection (optional)
4. Create your first user profile
5. Start generating personalized content!

## 📈 Performance & Scalability

- **Async Processing**: Non-blocking operations for responsive UI
- **Streaming Support**: Real-time response generation
- **Caching**: Intelligent caching for improved performance
- **Modular Architecture**: Easy scaling and service addition
- **Vector Optimization**: Efficient vector operations and indexing

## 🔧 Development & Extension

### Adding New AI Providers
The modular architecture makes it easy to add new AI services:
1. Create a new service file in `/services`
2. Implement the standard interface
3. Add configuration options
4. Update the UI components

### Custom Embedding Models
Support for custom embedding models:
1. Implement the embedding interface
2. Add model configuration
3. Update the embedding service
4. Configure in settings

### Profile Extensions
Extend profile capabilities:
1. Add new fields to the Profile interface
2. Update profile creation logic
3. Implement new recommendation strategies
4. Update UI components

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Testing requirements
- Documentation updates
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all AI providers for their excellent APIs
- Qdrant team for the powerful vector database
- The open-source community for continuous innovation
- Contributors and users of this platform

---

**⭐ Star this repository if you find it helpful!**
