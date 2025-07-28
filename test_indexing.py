#!/usr/bin/env python3
"""
Simple test data script to debug indexing issues
"""

from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import os
import uuid

# Load environment variables
load_dotenv()

def create_test_document():
    """Create a simple test document."""
    return {
        "title": "Test Document",
        "content": "This is a test document for the enterprise search system.",
        "source": "test",
        "document_type": "document",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "author": "Test User",
        "url": "https://example.com/test",
        "tags": ["test", "sample"],
        "department": "IT",
        "project": "Enterprise Search",
        "status": "published",
        "priority": "medium",
        "rating": 5.0,
        "view_count": 10
    }

def test_indexing():
    """Test adding a single document."""
    # Connect to Elasticsearch
    es = Elasticsearch(
        hosts=['http://localhost:9200'],
        request_timeout=30
    )
    
    if not es.ping():
        print("❌ Cannot connect to Elasticsearch")
        return
    
    index_name = os.getenv('ELASTIC_INDEX', 'enterprise_documents')
    
    # Create test document
    doc = create_test_document()
    doc_id = str(uuid.uuid4())
    
    try:
        print(f"Attempting to index document to index: {index_name}")
        response = es.index(
            index=index_name,
            id=doc_id,
            body=doc
        )
        print(f"✅ Successfully indexed document: {response['_id']}")
        print(f"   Result: {response['result']}")
        
        # Test search
        print("Testing search...")
        es.indices.refresh(index=index_name)
        search_response = es.search(
            index=index_name,
            body={"query": {"match_all": {}}}
        )
        print(f"✅ Search successful. Found {search_response['hits']['total']['value']} documents")
        
    except Exception as e:
        print(f"❌ Failed to index document: {e}")
        print(f"   Error type: {type(e).__name__}")

if __name__ == "__main__":
    test_indexing()
