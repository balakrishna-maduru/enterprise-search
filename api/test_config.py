#!/usr/bin/env python3
"""
Test config loading separately
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_config():
    try:
        print("Testing config loading...")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Looking for .env file at: {os.path.join(os.getcwd(), '.env')}")
        print(f".env file exists: {os.path.exists('.env')}")
        
        if os.path.exists('.env'):
            print("\n.env file contents:")
            with open('.env', 'r') as f:
                for i, line in enumerate(f, 1):
                    print(f"{i:2d}: {line.rstrip()}")
        
        print("\nTesting individual environment variables:")
        cors_origins = os.getenv('CORS_ORIGINS', 'NOT_SET')
        print(f"CORS_ORIGINS from os.getenv: '{cors_origins}'")
        
        print("\nTesting pydantic-settings loading...")
        from config import Settings
        
        # Try loading without .env first
        print("Creating Settings instance...")
        settings = Settings()
        print("✅ Settings loaded successfully")
        print(f"CORS_ORIGINS: {settings.CORS_ORIGINS}")
        print(f"HOST: {settings.HOST}")
        print(f"PORT: {settings.PORT}")
        
        return True
        
    except Exception as e:
        print(f"❌ Config loading failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_config()