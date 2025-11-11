# ⚡ Electron
## 📸 Screenshots
<h3 align="center">🧭 Electron UI Showcase</h3>

<p align="center">
  <em>Explore Electron’s interface — one screen at a time.</em>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/60b1c8f7-e13a-4d19-9bdd-d5af8f16267c" width="800" alt="Screenshot 1" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/ed7f2d64-0256-48d5-b835-b844e0e0d8cc" width="800" alt="Screenshot 2" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/270795f3-39cb-413e-8ab9-2e40f09cca54" width="800" alt="Screenshot 3" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/042192ca-6c14-440e-a746-23d0b4396da0" width="800" alt="Screenshot 4" />
</p>



🧠 Open-source, local, and personalized recommendation system powered by RAG and LLMs. Flexible, private, and intelligent — meet Electron.

**Electron** is a sophisticated, web-based application designed to create detailed user profiles through dynamic, multi-lingual conversations and leverage them to generate highly personalized recommendations from custom datasets.

It serves as a powerful demonstration of a modern, Retrieval-Augmented Generation (RAG) system with a flexible, dual-backend AI architecture and a focus on user-centric design.

---

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

---

## 🛠️ Technical Capabilities

### Conversational AI Features
*   **Conversational AI Interviewer**: Engages users in natural, open-ended conversations to gather nuanced information about their preferences.
*   **Multi-Lingual Support**: Automatically detects the user's language and conducts the interview accordingly, ensuring a seamless user experience.
*   **Standardized JSON Output**: Consistently translates and structures the conversational data into a clean, English-standardized JSON format, perfect for reliable data processing.
*   **Hybrid AI Backend**:
    *   **Google Gemini**: Integrates with the powerful Gemini family of models via the Google AI API for cloud-based, high-performance processing.
    *   **Ollama Integration**: Allows users to connect to a local Ollama instance, enabling the use of open-source models for offline, private, and cost-effective operation.

### Advanced RAG Engine
*   **On-Demand Parsing**: Efficiently handles user-uploaded CSV and Excel datasets, parsing them only when a recommendation query is made.
*   **Intelligent Pre-Filtering**: Before querying the LLM, Electron performs a sophisticated, multi-stage filtering process on the dataset. It scores and ranks items based on how well they match a user's likes and then strictly removes any items matching their dislikes.
*   **Focused Context Injection**: Only the most relevant, pre-filtered data is passed to the AI, dramatically improving recommendation accuracy, reducing token usage, and preventing context window errors.

### Embedding Service Integration
*   **Flexible Embedding Models**: Support for multiple embedding models including sentence-transformers, BAAI models, and custom embeddings.
*   **Reranking Capabilities**: Advanced reranking with models like BAAI/bge-reranker-v2-m3 for improved search relevance.
*   **Health Monitoring**: Real-time service health checks and model information display.
*   **Test Interface**: Built-in testing tools for embedding generation and reranking functionality.

### Advanced Generation Settings
*   **Top-P (Nucleus Sampling)**: Fine-tune text diversity with nucleus sampling controls (0.1-1.0).
*   **Max Token Generation**: Control response length with configurable token limits (1-4096 or unlimited).
*   **Enhanced Temperature**: Refined creativity temperature controls integrated with other parameters.
*   **Preset Configurations**: Quick-switch between Creative, Balanced, Precise, and Unlimited modes.
*   **Factory Reset**: One-click reset to default settings with confirmation dialog.

### User Experience Features
*   **Conversational Profile Editing**: Users can modify their generated profiles using natural language commands in the chat interface (e.g., "Add 'sci-fi' to my likes").
*   **Customizable AI Agents**: Core AI behaviors can be modified directly through the UI by editing the system prompts for the Interviewer, JSON Maker, and Explorer agents.
*   **Modern Tech Stack**: Built with React, Tailwind CSS, and TypeScript, ensuring a responsive, maintainable, and scalable application.

---

## 🎯 Distinctive Features

1.  **Flexible AI Backend**: The ability to seamlessly switch between a state-of-the-art cloud AI (Gemini) and a completely private, user-controlled local AI (Ollama) is a core architectural advantage. This provides unparalleled flexibility for different use cases, from rapid prototyping to secure enterprise deployment.

2.  **Intelligent & Efficient RAG**: Electron's RAG system is more than just a context stuffer. The client-side logic for scoring, ranking, and filtering data before it reaches the LLM is a key innovation. This "smart-filtering" approach leads to superior recommendation quality and is highly efficient, even with large datasets.

3.  **Deep User Customization**: Beyond just uploading a dataset, users have the power to fundamentally alter the AI's personality and instructions via the built-in prompt editor. This transforms the application from a static tool into a dynamic platform for experimenting with AI behaviors.

4.  **Modular Embedding Service**: The new embedding service architecture provides a clean separation between embedding generation and the RAG system. With support for multiple embedding models, reranking capabilities, and comprehensive health monitoring, it enables more sophisticated semantic search and retrieval operations.

5.  **Seamless User Experience**: From the multilingual chat that adapts to the user, to the ability to make profile corrections with simple sentences, every feature is designed to be intuitive and minimize friction.

6.  **Advanced Generation Controls**: The new advanced settings provide granular control over AI model behavior with Top-P sampling, token limits, and preset configurations. This enables users to fine-tune responses for different use cases - from creative writing to technical precision - while maintaining ease of use through intuitive presets and factory reset functionality.

---

## 📚 Documentation

### Setup & Configuration
*   **Embedding Service**: For detailed information about the embedding service integration, see [`EMBEDDING_SERVICE.md`](EMBEDDING_SERVICE.md).
*   **Advanced Settings**: For detailed information about the advanced generation settings, see [`ADVANCED_SETTINGS.md`](ADVANCED_SETTINGS.md).
*   **Qdrant Setup**: For Qdrant vector database setup instructions, see [`QDRANT_SETUP.md`](QDRANT_SETUP.md).
*   **Local Security**: For local deployment security guidelines, see [`LOCAL_SECURITY_GUIDE.md`](LOCAL_SECURITY_GUIDE.md).

### Testing Interfaces
*   **Embedding Test**: A comprehensive test interface is available at [`test_embedding.html`](test_embedding.html) for testing embedding generation and reranking functionality.
*   **Advanced Settings Test**: A test interface for advanced settings is available at [`test_advanced_settings.html`](test_advanced_settings.html) for testing generation parameter configurations.

---

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

---

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

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Qdrant vector database (optional, for RAG features)

### Installation
```bash
# Clone the repository
git clone https://github.com/msabbaszadeh/Electron.git

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

---

## 📈 Performance & Scalability

- **Async Processing**: Non-blocking operations for responsive UI
- **Streaming Support**: Real-time response generation
- **Caching**: Intelligent caching for improved performance
- **Modular Architecture**: Easy scaling and service addition
- **Vector Optimization**: Efficient vector operations and indexing

---

## 🔒 Security & Privacy

- **Local Processing**: Option for completely local AI processing with Ollama
- **API Key Management**: Secure API key storage and management
- **Data Privacy**: Local data processing options for sensitive information
- **Encryption**: Secure data transmission and storage

---

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
