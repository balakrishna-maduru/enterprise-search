#!/usr/bin/env python3
"""
Simple Elasticsearch connection test
"""

from elasticsearch import Elasticsearch
import json

def test_connection():
    """Test various connection methods."""
    print("Testing Elasticsearch connection...")
    
    # Test 1: Basic connection
    try:
        es = Elasticsearch(
            hosts=['http://localhost:9200'],
            request_timeout=30
        )
        
        print("Client created successfully")
        print("Testing ping...")
        
        try:
            ping_result = es.ping()
            print(f"Ping result: {ping_result}")
            
            if ping_result:
                print("✅ Ping successful")
                info = es.info()
                print(f"✅ Connected to Elasticsearch {info['version']['number']}")
                print(f"   Cluster: {info['cluster_name']}")
                print(f"   Cluster UUID: {info['cluster_uuid']}")
                return True
            else:
                print("❌ Ping failed - returned False")
                # Try to get cluster info directly even if ping fails
                try:
                    print("Attempting direct info() call...")
                    info = es.info()
                    print(f"✅ Direct info() successful: {info['cluster_name']}")
                    return True
                except Exception as info_error:
                    print(f"❌ Direct info() failed: {info_error}")
                    return False
                
        except Exception as ping_error:
            print(f"❌ Ping raised exception: {ping_error}")
            print(f"   Ping error type: {type(ping_error).__name__}")
            
            # Try to get cluster info directly
            try:
                print("Attempting direct info() call...")
                info = es.info()
                print(f"✅ Direct info() successful: {info['cluster_name']}")
                return True
            except Exception as info_error:
                print(f"❌ Direct info() failed: {info_error}")
                return False
            
    except Exception as e:
        print(f"❌ Client creation failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    test_connection()
