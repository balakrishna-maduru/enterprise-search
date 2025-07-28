#!/usr/bin/env python3
"""
Test script to debug the chat API issue
"""
import requests
import json
import sys

def test_chat_api():
    # First, get a token
    print("🔐 Getting authentication token...")
    login_response = requests.post('http://localhost:8000/api/v1/auth/login', json={
        'email': 'john.smith@testbank.com'
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()['access_token']
    print("✅ Got authentication token")
    
    # Test chat request
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Chat request with search context (React format)
    chat_data = {
        'message': 'Tell me about the search results',
        'search_context': [
            {
                'id': '1',
                'title': 'Test Document',
                'summary': 'This is a test document summary',
                'source': 'confluence',
                'url': 'https://example.com',
                'author': 'John Doe',
                'date': '2024-01-01',
                'contentType': 'document',  # React camelCase format
                'tags': ['test', 'document'],
                'relevanceScore': 95,  # React camelCase format
                'highlights': {},
                'content': 'This is the full content of the test document'
            }
        ],
        'conversation_history': []
    }
    
    print("💬 Testing chat API...")
    print(f"Sending: {json.dumps(chat_data, indent=2)}")
    
    chat_response = requests.post(
        'http://localhost:8000/api/v1/llm/chat',
        headers=headers,
        json=chat_data
    )
    
    print(f"Response status: {chat_response.status_code}")
    
    if chat_response.status_code == 200:
        print("✅ Chat API working!")
        print(f"Response: {chat_response.json()}")
    else:
        print("❌ Chat API failed")
        print(f"Error: {chat_response.text}")

if __name__ == "__main__":
    test_chat_api()