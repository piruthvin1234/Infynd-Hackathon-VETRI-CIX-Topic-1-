# Project Explanation: VETRI CIX

## Overview
VETRI CIX is an advanced Company Intelligence Extraction platform. It is designed to automate the process of gathering, analyzing, and structuring comprehensive data about companies from their digital footprint. The system leverages a hybrid AI architecture, combining local Large Language Models (LLMs) with cloud-based fallbacks to ensure robust, cost-effective, and private data extraction.

The application features a modern, responsive React frontend for user interaction and visualization, backed by a high-performance FastAPI backend that orchestrates web scraping, AI processing, and database management.

---

## Tech Stack

### Backend
**Core Framework:**
- **Language:** Python
- **API Framework:** FastAPI (`fastapi`)
- **ASGI Server:** Uvicorn (`uvicorn`)

**Artificial Intelligence (LLM) Strategy:**
- **Primary Node (Local):** AirLLM running `phi-3-mini` (Port 9000) for cost-free, private extraction.
- **Secondary Node (Local):** Ollama running `mistral:latest` (Port 11434) as a robust local backup.
- **Fallback Node (Cloud):** Groq API running `llama-3.3-70b-versatile` for high-complexity tasks when local models fail.

**Database & Storage:**
- **Database:** MongoDB
- **Async Driver:** Motor (`motor`)
- **Sync Driver:** PyMongo (`pymongo`)
- **Object Modeling:** Pydantic (`pydantic`) for data validation and schema definition.

**Web Scraping & Search:**
- **Headless Browser:** Selenium (`selenium`) with `webdriver-manager` for dynamic content.
- **HTML Parsing:** BeautifulSoup4 (`beautifulsoup4`) for static content extraction.
- **HTTP Requests:** `requests`, `httpx` for API calls and fetching pages.
- **Search Engine:** `duckduckgo-search` for discovering company URLs.

**Data Processing & Analysis:**
- **Data Manipulation:** Pandas (`pandas`), NumPy (`numpy`).
- **Excel Processing:** OpenPyXL (`openpyxl`).
- **Graph Theory:** NetworkX (`networkx`) for relationship mapping.

**Authentication & Security:**
- **JWT Handling:** `python-jose[cryptography]`.
- **Password Hashing:** `bcrypt`, `passlib`.
- **Environment config:** `python-dotenv`.

### Frontend
**Core Framework:**
- **Library:** React 19 (`react`, `react-dom`).
- **Build Tool:** Vite 7 (`vite`) for lightning-fast development and building.

**Styling & UI:**
- **CSS Framework:** Tailwind CSS 3.4 (`tailwindcss`, `postcss`, `autoprefixer`).
- **Icons:** Lucide React (`lucide-react`).
- **Components:** Custom built components with a focus on "Rich Aesthetics" (Glassmorphism, Dark Mode).

**State & Routing:**
- **Routing:** React Router DOM 7 (`react-router-dom`).

**Data Handling & Visualization:**
- **HTTP Client:** Axios (`axios`).
- **Charts:** Recharts (`recharts`) for analytics visualization.
- **Flow/Graph:** ReactFlow (`reactflow`) for visualizing company connections.
- **File Handling:** SheetJS (`xlsx`) for handling Excel imports/exports in the browser.

---

## Project Structure & File Inventory

### Root Directory (`p:\Projects\Infynd\VETRI CIX`)
*   `project explanation .md`: This detailed project documentation.
*   `start_dev.bat`: Batch script to launch the development environment.
*   `1.html`, `2.HTML`, `3.html`, `4.html`: Sample HTML files used for testing extraction logic.
*   **Directories:** `backend`, `frontend`, `prompts`, `sample_data`.

### Backend (`/backend`)
**Application Logic:**
*   `main.py`: The entry point for the FastAPI application. Initializes routes and middleware.
*   `mainapp.py`: Alternative entry point or testing script.
*   `auth.py`: Handles user authentication, token generation, and security dependencies.
*   `llm_service.py`: The core intelligence engine. Implements the triple-strategy (AirLLM -> Ollama -> Groq) for data extraction.
*   `llm_service copy.py`: Backup/Variant of the LLM service.
*   `batch_processor.py`: Manages the processing of bulk company lists (CSV/Excel).
*   `extractor.py`: Logic regarding the extraction of specific data points from raw HTML.
*   `scraper.py`: Advanced scraping logic using Selenium/Requests to fetch web content.
*   `scrape_only.py`: Dedicated script for isolated scraping tasks.
*   `graph_builder.py`: Constructs graph networks from company data using `networkx`.
*   `search_service.py`: Integration with DuckDuckGo for finding company websites.
*   `similarity_service.py`: Logic to determine similarity between companies (likely for deduplication or comparison).
*   `storage_service.py`: Manages file uploads and storage (local or cloud-ready).
*   `html_cache_service.py`: Caches scraped HTML to prevent redundant network requests.
*   `user.py`: User management logic (likely Profile/Settings).

**Database & Models:**
*   `database.py`: MongoDB connection management.
*   `db_models.py`: Database schema definitions (likely Pydantic models mapping to MongoDB documents).
*   `models.py`: Shared data models used across the application.
*   `check_mongo.py`: Utility script to verify MongoDB connectivity.

**Testing & Config:**
*   `test_cache.py`: Unit tests for the caching service.
*   `test_reg.py`: Regex testing script.
*   `requirements.txt`: Python dependency list.

**Directories:**
*   `__pycache__/`: Compiled Python bytecodes.
*   `scraped_html/`: Storage for downloaded raw HTML files.
*   `storage/`: General file storage.
*   `uploads/`: Temporary directory for user-uploaded files (batch processing).
*   `venv/`: Python virtual environment.

### Frontend (`/frontend`)
**Configuration:**
*   `package.json` & `package-lock.json`: Node.js dependencies and scripts.
*   `vite.config.js`: Configuration for the Vite build tool.
*   `tailwind.config.js`: Tailwind CSS configuration (theme extensions, colors).
*   `postcss.config.js`: PostCSS configuration for Tailwind.
*   `eslint.config.js`: Code linting rules.
*   `index.html`: The main HTML entry point for the React app.

**Source Code (`/src`):**
*   `main.jsx`: Application entry point, mounts the React app to the DOM.
*   `App.jsx`: Main application component, handles routing structure.
*   `App.css` & `index.css`: Global styles (including Tailwind directives).

**Pages (`/src/pages`):**
*   `Dashboard.jsx`: The central command center, displaying key metrics and recent activities.
*   `AnalyzePage.jsx`: The primary interface for single-company analysis.
*   `AnalyticsPage.jsx`: Deep-dive data visualization and aggregation view.
*   `BatchPage.jsx`: Interface for uploading and managing bulk processing jobs.
*   `ReportsPage.jsx`: View for generating and downloading structured reports.
*   `ProfilePage.jsx`: User profile settings and management.
*   `TeamPage.jsx`: Team collaboration settings.
*   `LibraryPage.jsx`: Archive of previously analyzed companies.
*   `DocsPage.jsx`: Documentation or help section for the user.
*   `LandingPage.jsx`: The public-facing introductory page.

**Components (`/src/components`):**
*   `BatchUpload.jsx`: Component handling the drag-and-drop file upload for batches.
*   `CompanyList.jsx`: Reusable list view component for displaying company summaries.
*   `GraphView.jsx`: Interactive component (using ReactFlow) to visualize company networks.
*   **Sub-directories:**
    *   `auth/`: Authentication forms (Login/Signup).
    *   `charts/`: Reusable chart components using Recharts.
    *   `layout/`: Structural components like Sidebar, Navbar, Footer.
    *   `theme/`: Theme toggle or customization components.
    *   `ui/`: Generic UI elements (Buttons, Inputs, Modals).
    *   `user/`: User-specific widgets (Avatar, Dropdown).

**Services (`/src/services`):**
*   `api.js` (Assumed): Centralized Axios instance for making API calls to the Python backend.

**Contexts (`/src/contexts`):**
*   `AuthContext.jsx` (Assumed): Manages global user authentication state.
*   `ThemeContext.jsx` (Assumed): Manages application theme/mode.

---

## Detailed Data Flow
1.  **Input**: User inputs a URL (Analyze Page) or uploads a CSV (Batch Page).
2.  **Request**: Frontend sends a request to the FastAPI backend (`main.py`).
3.  **Search/Scrape**:
    *   If a name is provided, `search_service.py` finds the URL.
    *   `scraper.py` (via Selenium) visits the site and captures the HTML content.
4.  **Extraction**:
    *   `extractor.py` prepares the content.
    *   `llm_service.py` constructs a prompt and sends it to the best available LLM (AirLLM -> Ollama -> Groq).
5.  **Parsing**: The LLM returns a JSON object with fields like `company_name`, `key_people`, `tech_stack_signals`, etc.
6.  **Storage**: Data is validated via `db_models.py` and saved to MongoDB via `database.py`.
7.  **Response**: The structured data is sent back to the frontend.
8.  **Visualization**:
    *   `AnalyzePage.jsx` displays the raw data.
    *   `GraphView.jsx` plots connections.
    *   `Dashboard.jsx` updates with new metrics.
