#!/usr/bin/env python3
"""
Simple script to run the Enterprise Search API
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    from config import settings
    
    print("🚀 Starting Enterprise Search API...")
    print(f"📡 Server will run on http://{settings.HOST}:{settings.PORT}")
    print(f"📖 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )