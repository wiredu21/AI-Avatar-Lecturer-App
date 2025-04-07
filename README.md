# VirtuAId - Your AI University Assistant

VirtuAId is an AI-powered platform designed to provide personalized support and guidance for university students. It features a virtual AI lecturer that can answer questions, provide course-specific information, and help students with their academic journey.

## Project Structure

The project is organized into two main parts:

1. **Backend (Django + REST Framework)**
   - Located in the `backend/virtuaid` directory
   - Handles API endpoints, database models, and business logic
   - Integrates with AI models for generating responses

2. **Frontend (React)**
   - Located in the `frontend` directory
   - Provides the user interface for interacting with the AI assistant
   - Features a responsive design with modern UI components

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm 10+
- MySQL

### Installation

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/virtuaid
   ```

2. Install Python dependencies:
   ```bash
   pip install -r ../../requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start the development server:
   ```bash
   python manage.py runserver
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

## Roadmap

See the [roadmap.md](roadmap.md) file for the detailed development plan.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Django, and REST Framework
- Powered by advanced AI language models
- Designed for an optimal learning experience