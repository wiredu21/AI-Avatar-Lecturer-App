# VirtuAId - Your AI University Assistant

VirtuAId is an AI-powered platform designed to provide personalized support and guidance for university students. It features a virtual AI lecturer that can answer questions, provide course-specific information, and help students with their academic journey.

## Project Structure

The project is organized into two main parts:

1. **Backend (Django + REST Framework + Ollama Integration)**

   - Located in the `backend/` directory
   - Handles API endpoints, database models, and business logic
   - Integrates with Ollama for LLM-based responses (default: Phi-3, but supports any Ollama model)
   - Implements Retrieval-Augmented Generation (RAG) using scraped university content
   - Includes web scrapers, content embedding, and a robust AI pipeline

2. **Frontend (React)**
   - Located in the `frontend/` directory
   - Provides the user interface for interacting with the AI assistant
   - Features a responsive design with modern UI components
   - Supports chat, avatar customization, and real-time updates

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm 10+
- MySQL (or SQLite for development)
- [Ollama](https://ollama.ai/) (for running LLMs like Phi-3, Mistral, Llama3, etc.)

### Installation

#### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the `backend/` directory with the following (example for Phi-3):

   ```env
   OLLAMA_API_URL=http://localhost:11434
   OLLAMA_MODEL=phi3:latest
   AI_MAX_LENGTH=2048
   AI_TEMPERATURE=0.7
   AI_TOP_P=0.9
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_URL=sqlite:///db.sqlite3
   FRONTEND_URL=http://localhost:3000
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

#### Ollama LLM Setup

1. [Install Ollama](https://ollama.ai/download) and start the Ollama service:

   ```bash
   ollama serve
   ```

2. Pull the desired model (e.g., Phi-3):
   ```bash
   ollama pull phi3
   ```

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Features

- **AI Tutoring**: Get personalized help with your coursework
- **Real-time Updates**: Stay informed about university news and events
- **Avatar Customization**: Choose your preferred AI lecturer avatar
- **Course-specific Knowledge**: AI responses tailored to your specific courses
- **Chat History**: Review past conversations with the AI lecturer
- **Retrieval-Augmented Generation (RAG)**: Answers are enhanced with scraped university content
- **Web Scraping**: Automated scrapers keep university news and events up to date
- **Model Flexibility**: Easily switch between LLMs (Phi-3, Mistral, Llama3, etc.) via `.env`
- **Resource-Aware Testing**: Includes scripts for lightweight model and API testing

## Testing & Troubleshooting

- Use the provided test scripts in `backend/` (e.g., `test_ollama.py`, `test_phi3.py`, `test_content_integration.py`) to verify model and API connectivity.
- For resource-constrained environments, use smaller models (e.g., `phi3`, `mistral:7b-instruct`).
- If you encounter timeouts, reduce the `num_predict` parameter in test scripts and prompts.

## Roadmap

See the [roadmap.md](roadmap.md) file for the detailed development plan.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Django, and REST Framework
- Powered by advanced AI language models via Ollama
- Designed for an optimal learning experience

#  A I - L e c t u r e r - A p p 

 
 #   A I - A v a t a r - L e c t u r e r - A p p 
 
 #   A I - A v a t a r - L e c t u r e r - A p p 
 
 #   V i r t u a i d 
 
 #   V i r t u a i d 
 
 
