#!/usr/bin/env python3
"""
VETRI CIX Backend Startup Script
Run this file AFTER activating environment:
    python mainapp.py
"""

import sys
import os
from pathlib import Path

# --------------------------------------------------
# Set backend directory
# --------------------------------------------------
BACKEND_DIR = Path(__file__).parent.resolve()

# Ensure backend directory is in PYTHONPATH
sys.path.insert(0, str(BACKEND_DIR))

# Change working directory to backend
os.chdir(BACKEND_DIR)

# --------------------------------------------------
# Import FastAPI app
# --------------------------------------------------
try:
    import uvicorn
    from main import app
except ImportError as e:
    print("=" * 60)
    print("  ❌ ERROR: Missing dependencies")
    print("=" * 60)
    print()
    print(f"  {e}")
    print()
    print("  Fix:")
    print(f"  cd {BACKEND_DIR}")
    print("  pip install -r requirements.txt")
    print("=" * 60)
    sys.exit(1)

# --------------------------------------------------
# Start Server
# --------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("  🚀 VETRI CIX - Backend Server Starting")
    print("=" * 60)
    print()
    print("  🔗 URLs:")
    print("     - Local:     http://localhost:8000")
    print("     - Network:  http://0.0.0.0:8000")
    print("     - Swagger:  http://localhost:8000/docs")
    print()
    print("  ⛔ Press CTRL + C to stop the server")
    print("=" * 60)
    print()

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
