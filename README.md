# Electron: AI-Powered Profiling & Recommendation Agent

**Electron** is a sophisticated, web-based application designed to create detailed user profiles through dynamic, multi-lingual conversations and leverage them to generate highly personalized recommendations from custom datasets.

It serves as a powerful demonstration of a modern, Retrieval-Augmented Generation (RAG) system with a flexible, dual-backend AI architecture and a focus on user-centric design.

---

## Key Features

### Technical Capabilities

*   **Conversational AI Interviewer**: Engages users in natural, open-ended conversations to gather nuanced information about their preferences.
*   **Multi-Lingual Support**: Automatically detects the user's language and conducts the interview accordingly, ensuring a seamless user experience.
*   **Standardized JSON Output**: Consistently translates and structures the conversational data into a clean, English-standardized JSON format, perfect for reliable data processing.
*   **Hybrid AI Backend**:
    *   **Google Gemini**: Integrates with the powerful Gemini family of models via the Google AI API for cloud-based, high-performance processing.
    *   **Ollama Integration**: Allows users to connect to a local Ollama instance, enabling the use of open-source models for offline, private, and cost-effective operation.
*   **Advanced RAG Engine**:
    *   **On-Demand Parsing**: Efficiently handles user-uploaded CSV and Excel datasets, parsing them only when a recommendation query is made.
    *   **Intelligent Pre-Filtering**: Before querying the LLM, Electron performs a sophisticated, multi-stage filtering process on the dataset. It scores and ranks items based on how well they match a user's likes and then strictly removes any items matching their dislikes.
    *   **Focused Context Injection**: Only the most relevant, pre-filtered data is passed to the AI, dramatically improving recommendation accuracy, reducing token usage, and preventing context window errors.
*   **Embedding Service Integration**:
    *   **Flexible Embedding Models**: Support for multiple embedding models including sentence-transformers, BAAI models, and custom embeddings.
    *   **Reranking Capabilities**: Advanced reranking with models like BAAI/bge-reranker-v2-m3 for improved search relevance.
    *   **Health Monitoring**: Real-time service health checks and model information display.
    *   **Test Interface**: Built-in testing tools for embedding generation and reranking functionality.
*   **Advanced Generation Settings**:
    *   **Top-P (Nucleus Sampling)**: Fine-tune text diversity with nucleus sampling controls (0.1-1.0).
    *   **Max Token Generation**: Control response length with configurable token limits (1-4096 or unlimited).
    *   **Enhanced Temperature**: Refined creativity temperature controls integrated with other parameters.
    *   **Preset Configurations**: Quick-switch between Creative, Balanced, Precise, and Unlimited modes.
    *   **Factory Reset**: One-click reset to default settings with confirmation dialog.
*   **Conversational Profile Editing**: Users can modify their generated profiles using natural language commands in the chat interface (e.g., "Add 'sci-fi' to my likes").
*   **Customizable AI Agents**: Core AI behaviors can be modified directly through the UI by editing the system prompts for the Interviewer, JSON Maker, and Explorer agents.
*   **Modern Tech Stack**: Built with React, Tailwind CSS, and TypeScript, ensuring a responsive, maintainable, and scalable application.

### Distinctive Features

1.  **Flexible AI Backend**: The ability to seamlessly switch between a state-of-the-art cloud AI (Gemini) and a completely private, user-controlled local AI (Ollama) is a core architectural advantage. This provides unparalleled flexibility for different use cases, from rapid prototyping to secure enterprise deployment.

2.  **Intelligent & Efficient RAG**: Electron's RAG system is more than just a context stuffer. The client-side logic for scoring, ranking, and filtering data before it reaches the LLM is a key innovation. This "smart-filtering" approach leads to superior recommendation quality and is highly efficient, even with large datasets.

3.  **Deep User Customization**: Beyond just uploading a dataset, users have the power to fundamentally alter the AI's personality and instructions via the built-in prompt editor. This transforms the application from a static tool into a dynamic platform for experimenting with AI behaviors.

4.  **Modular Embedding Service**: The new embedding service architecture provides a clean separation between embedding generation and the RAG system. With support for multiple embedding models, reranking capabilities, and comprehensive health monitoring, it enables more sophisticated semantic search and retrieval operations.

5.  **Seamless User Experience**: From the multilingual chat that adapts to the user, to the ability to make profile corrections with simple sentences, every feature is designed to be intuitive and minimize friction.

6.  **Advanced Generation Controls**: The new advanced settings provide granular control over AI model behavior with Top-P sampling, token limits, and preset configurations. This enables users to fine-tune responses for different use cases - from creative writing to technical precision - while maintaining ease of use through intuitive presets and factory reset functionality.

---

## Documentation

*   **Embedding Service**: For detailed information about the embedding service integration, see [`EMBEDDING_SERVICE.md`](EMBEDDING_SERVICE.md).
*   **Testing Interface**: A comprehensive test interface is available at [`test_embedding.html`](test_embedding.html) for testing embedding generation and reranking functionality.
*   **Advanced Settings**: For detailed information about the advanced generation settings, see [`ADVANCED_SETTINGS.md`](ADVANCED_SETTINGS.md).
*   **Settings Testing**: A test interface for advanced settings is available at [`test_advanced_settings.html`](test_advanced_settings.html) for testing generation parameter configurations.
