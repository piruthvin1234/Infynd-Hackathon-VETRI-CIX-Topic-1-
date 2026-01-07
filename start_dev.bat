@echo off
echo ===================================================
echo   VETRI CIX - Offline Intelligence System
echo   Starting Development Environment...
echo ===================================================

echo.
echo [1/2] Starting Backend (FastAPI + Ollama)...
echo       - Auto-reload ENABLED
echo       - Port: 8000
start "VETRI CIX Backend" cmd /k "cd backend && uvicorn main:app --reload"

echo.
echo [2/2] Starting Frontend (React + Vite)...
echo       - Hot-reload ENABLED
echo       - Port: 5173
start "VETRI CIX Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   SYSTEM IS RUNNING!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo.
echo   * Edit any file to see changes instantly.
echo ===================================================
pause
