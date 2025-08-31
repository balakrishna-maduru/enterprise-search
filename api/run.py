#!/usr/bin/env python3
"""
Simple script to run the Enterprise Search API.
Run this from the project root: `python api/run.py`
"""
import sys
import os

# This script assumes it's being run from the project root.
# No need to modify sys.path if the project structure is correct.

if __name__ == "__main__":
    import uvicorn
    # Use absolute import path
    from api.config import settings
    
    print("🚀 Starting Enterprise Search API...")
    print(f"📡 Server will run on http://{settings.HOST}:{settings.PORT}")
    print(f"📖 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    
    uvicorn.run(
        "api.main:app", # Use absolute path to the app
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        reload_dirs=["api"] # Optional: specify reload directory
    )