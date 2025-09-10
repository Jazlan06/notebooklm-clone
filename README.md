📄 NotebookLM Clone

An interactive web app to upload, view, and chat with your PDFs — powered by AI.

🚀 Project Overview

This project is a lightweight clone of Google’s NotebookLM, designed to provide a seamless experience for interacting with PDF documents.
Users can upload large PDFs, browse their pages, and ask questions about the document contents via a chat interface. The app intelligently extracts relevant information and provides citations that link directly to the referenced PDF pages.

🎯 Features

PDF Upload & Viewing
Upload large PDF files and navigate through pages with an embedded PDF viewer.

Chat Interface
Ask questions about the uploaded PDF. AI-powered responses are efficient and token-conscious.

Citations & Navigation
Each AI response may include citation buttons referencing specific PDF pages. Clicking a citation scrolls the PDF viewer to that page.

Rate Limit Handling
Detects API rate limiting (HTTP 429) and displays a user-friendly modal.

Loading Indicators
Displays a “Thinking...” spinner while the AI processes your question.

🛠️ Tech Stack

Frontend: React, react-pdf, TailwindCSS (or any CSS framework you prefer)

Backend: Node.js/Express (or your preferred backend stack)

AI API: OpenAI (or any compatible AI provider)

Deployment: Easily deployable on Netlify, Render, Vercel, or similar platforms

📦 Getting Started
Prerequisites

Node.js & npm/yarn installed

OpenAI API key (or your AI service key)

Installation

Clone or extract the project files
(Note: No GitHub link as per requirements)

Backend Setup

cd backend
npm install


Frontend Setup

cd frontend
npm install


Configure environment variables

Create .env files in both backend and frontend folders as needed, for example:

OPENAI_API_KEY=your_openai_api_key_here

Running Locally

Start backend server:

cd backend
npm start


Start frontend dev server:

cd frontend
npm start


Open your browser and visit http://localhost:3000 (or the port your frontend runs on).

📚 Usage

Upload a PDF file on the left panel.

Browse PDF pages with the navigation buttons.

Ask questions about the document using the chat interface on the right.

View AI responses with citations. Click citation buttons to jump to specific pages.

📝 Notes

The app handles rate limiting gracefully by showing a modal when the API quota is exceeded.

The AI interaction is optimized to minimize token consumption for efficiency and cost savings.

This is a take-home project demo, ideal for learning or prototyping PDF + AI interaction features.

🧩 Possible Improvements

Implement PDF vectorization & retrieval-augmented generation (RAG) for better answer accuracy.

Add user authentication for saving sessions and documents.

Support multi-document upload and indexing.

Improve UI/UX with animations and enhanced mobile responsiveness.

🎉 Credits

Built with React & Node.js

Uses react-pdf for rendering PDFs

Powered by OpenAI API (or your AI provider)

Inspired by Google NotebookLM

📞 Contact

For questions or feedback, reach out at [your-email@example.com
] or open an issue if you have access.

Happy coding! 🚀