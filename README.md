VETRI CIX – Company Intelligence Extraction Platform

VETRI CIX is an advanced Company Intelligence Extraction (CIX) platform designed to automatically gather, analyze, and structure comprehensive information about companies from their digital footprint.

The system leverages a hybrid AI architecture that combines local Large Language Models (LLMs) with cloud-based fallbacks, ensuring:

🔒 Privacy-first processing

💰 Cost efficiency

⚡ High performance and reliability

A modern React-based frontend provides rich visualization, while a FastAPI backend orchestrates scraping, AI inference, and data storage.

🧠 Key Features

🔍 Automated company data discovery & extraction

🤖 Hybrid AI strategy (Local LLMs + Cloud fallback)

🌐 Advanced web scraping (dynamic & static sites)

📊 Graph-based relationship mapping between companies

📁 Batch processing via CSV / Excel uploads

🔐 Secure authentication with JWT

📈 Interactive analytics & visual dashboards

🌓 Modern UI with Dark Mode & Glassmorphism

🏗️ System Architecture

Frontend (React + Vite)
⬇
FastAPI Backend
⬇
Scraping & Search Layer
⬇
LLM Intelligence Layer (Local + Cloud)
⬇
MongoDB Storage & Analytics

🛠️ Tech Stack
🔙 Backend

Core

Language: Python

API Framework: FastAPI

ASGI Server: Uvicorn

AI / LLM Strategy

🟢 Primary (Local): AirLLM running phi-3-mini (Port 9000)

🟡 Secondary (Local): Ollama running mistral:latest (Port 11434)

🔵 Fallback (Cloud): Groq API running llama-3.3-70b-versatile

Database

MongoDB

Motor (Async)

PyMongo (Sync)

Pydantic (Schema & validation)

Web Scraping & Search

Selenium + webdriver-manager

BeautifulSoup4

Requests, HTTPX

DuckDuckGo Search

Data Processing

Pandas, NumPy

OpenPyXL

NetworkX (graph modeling)

Security

JWT (python-jose)

Password hashing (bcrypt, passlib)

Environment config (python-dotenv)

🎨 Frontend

Core

React 19

Vite 7

UI & Styling

Tailwind CSS 3.4

Lucide React Icons

Glassmorphism + Dark Mode UI

Routing & State

React Router DOM 7

Data & Visualization

Axios

Recharts (Charts)

ReactFlow (Graph visualization)

SheetJS (Excel import/export)

📁 Project Structure
VETRI CIX/
│
├── project explanation.md
├── start_dev.bat
├── backend/
├── frontend/
├── prompts/
├── sample_data/
├── 1.html / 2.html / 3.html / 4.html

🔧 Backend Structure (/backend)

Core Files

main.py – FastAPI entry point

auth.py – Authentication & JWT handling

llm_service.py – Hybrid LLM orchestration engine

scraper.py – Advanced web scraping logic

extractor.py – Data extraction from HTML

batch_processor.py – Bulk company processing

graph_builder.py – Company relationship graphs

search_service.py – DuckDuckGo integration

database.py – MongoDB connection handling

Models & DB

models.py

db_models.py

check_mongo.py

Utilities

html_cache_service.py

similarity_service.py

storage_service.py

🎨 Frontend Structure (/frontend)

Pages

Dashboard

Analyze Company

Analytics

Batch Upload

Reports

Library

Profile

Team

Documentation

Landing Page

Components

BatchUpload

CompanyList

GraphView

Charts

Auth Components

Layout (Sidebar, Navbar, Footer)

Theme & UI components

🔄 Detailed Data Flow

Input

User enters a company URL OR uploads CSV/Excel

Request

Frontend sends request to FastAPI backend

Search & Scraping

DuckDuckGo finds official site (if needed)

Selenium / Requests fetch page content

AI Processing

HTML is sent to LLM pipeline

Priority: AirLLM → Ollama → Groq

Structured Output

LLM returns validated JSON data

Storage

Data stored in MongoDB

Visualization

Dashboards, graphs & analytics rendered in React

🚀 How to Run (Development)
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Frontend
cd frontend
npm install
npm run dev

🔐 Security Best Practices

API keys stored in .env (never committed)

JWT-based authentication

GitHub Push Protection enabled

Role-based access ready

🔮 Future Enhancements

Multi-language company extraction

Real-time data monitoring

Advanced competitor intelligence

Role-based dashboards (Admin / Analyst)

Cloud deployment (Docker + Kubernetes)

🏁 Conclusion

VETRI CIX demonstrates a scalable, secure, and cost-efficient AI-powered intelligence platform.
By combining local LLM privacy with cloud reliability, it delivers enterprise-grade insights while remaining hackathon-ready and production-capable.
