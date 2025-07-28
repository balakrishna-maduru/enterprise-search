#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    try:
        print("Testing core imports...")
        from config import settings
        print("✅ Config imported successfully")
        print(f"   - Host: {settings.HOST}")
        print(f"   - Port: {settings.PORT}")
        print(f"   - CORS Origins: {settings.CORS_ORIGINS}")
        print(f"   - Debug: {settings.DEBUG}")
        
        print("Testing model imports...")
        from models.user import User, UserRole
        from models.search import SearchRequest, SearchResponse
        from models.llm import SummaryRequest, ChatRequest
        print("✅ Models imported successfully")
        
        print("Testing service imports...")
        from services.elasticsearch_service import ElasticsearchService
        from services.llm_service import LLMService
        print("✅ Services imported successfully")
        
        print("Testing middleware imports...")
        from middleware.auth import get_current_user, create_access_token
        print("✅ Middleware imported successfully")
        
        print("Testing router imports...")
        from routers import search, llm, health, auth
        print("✅ Routers imported successfully")
        
        print("Testing main app...")
        from main import app
        print("✅ Main app imported successfully")
        
        print("\n🎉 All imports successful! API should start without issues.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_imports()