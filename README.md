# AI Interview Assistant

An autonomous, multi-round technical assessment platform that simulates real-world job interviews using role-based Retrieval-Augmented Generation (RAG) and LangGraph agentic workflows. Built with a high-performance FastAPI backend and a modern cross-platform React Native (Expo) frontend.

## Architecture & Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Backend** | Python, FastAPI, LangChain, LangGraph, ChromaDB, PyTorch, SQLite |
| **Frontend** | React Native, Expo, JavaScript, Custom StyleSheet UI |
| **AI / RAG** | Role-based embeddings, Vector search, Agentic state machine tracking |

## Core Features

* **Role-Based RAG:** Dynamically generates and customizes technical interview questions tailored to specific engineering roles and candidate seniority using vector similarity search.
* **Autonomous Multi-Round Flow:** Manages an intelligent interview tracking loop via LangGraph, maintaining conversation context and adapting question complexity based on previous answers.
* **Modern Developer UI:** Features a high-contrast dark-mode interface optimized for a sleek, responsive mobile experience.
* **Asynchronous API:** Built on FastAPI to ensure reliable, low-latency communication between the mobile client and the AI inference pipeline.

## Getting Started

### Prerequisites
* Python 3.10+
* Node.js & npm
* Expo CLI

### Backend Setup
1. Navigate to the project root or backend directory.
2. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   venv\Scripts\activate
