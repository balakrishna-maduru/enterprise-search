#!/usr/bin/env python3
"""
Test script to verify employee search functionality
"""

import requests
import json

def test_employee_search():
    """Test employee search via Elasticsearch"""
    
    # Test direct Elasticsearch query
    print("🧪 Testing Employee Search...")
    print("=" * 40)
    
    # Search for employees
    search_query = {
        "query": {
            "multi_match": {
                "query": "john",
                "fields": ["name^3", "title^2", "department", "skills", "bio"],
                "type": "best_fields",
                "fuzziness": "AUTO"
            }
        },
        "size": 5
    }
    
    try:
        response = requests.post(
            "http://localhost:9200/employees/_search",
            headers={"Content-Type": "application/json"},
            data=json.dumps(search_query)
        )
        
        if response.status_code == 200:
            data = response.json()
            hits = data.get('hits', {}).get('hits', [])
            
            print(f"✅ Found {len(hits)} employees matching 'john':")
            for hit in hits:
                source = hit['_source']
                print(f"   - {source.get('name')} ({source.get('title')}) - Score: {hit['_score']:.2f}")
        else:
            print(f"❌ Search failed: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"❌ Error testing employee search: {e}")
    
    print()
    
    # Test department search
    dept_query = {
        "query": {
            "match": {
                "department": "technology"
            }
        },
        "size": 10
    }
    
    try:
        response = requests.post(
            "http://localhost:9200/employees/_search",
            headers={"Content-Type": "application/json"},
            data=json.dumps(dept_query)
        )
        
        if response.status_code == 200:
            data = response.json()
            hits = data.get('hits', {}).get('hits', [])
            
            print(f"✅ Found {len(hits)} employees in Technology department:")
            for hit in hits:
                source = hit['_source']
                manager_name = source.get('manager_name', 'No manager')
                print(f"   - {source.get('name')} ({source.get('title')}) - Manager: {manager_name}")
        else:
            print(f"❌ Department search failed: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error testing department search: {e}")

def test_hierarchy_data():
    """Test hierarchical relationship data"""
    
    print("\n🌳 Testing Hierarchy Data...")
    print("=" * 40)
    
    # Get employees with their reporting structure
    hierarchy_query = {
        "query": {"match_all": {}},
        "sort": [{"org_level": {"order": "asc"}}, {"name.keyword": {"order": "asc"}}],
        "size": 20
    }
    
    try:
        response = requests.post(
            "http://localhost:9200/employees/_search",
            headers={"Content-Type": "application/json"},
            data=json.dumps(hierarchy_query)
        )
        
        if response.status_code == 200:
            data = response.json()
            hits = data.get('hits', {}).get('hits', [])
            
            print("✅ Employee Hierarchy:")
            for hit in hits:
                source = hit['_source']
                level = source.get('org_level', 0)
                indent = "  " * level
                report_count = source.get('report_count', 0)
                reports_text = f"({report_count} reports)" if report_count > 0 else ""
                
                print(f"{indent}📋 {source.get('name')} - {source.get('title')} {reports_text}")
                
        else:
            print(f"❌ Hierarchy query failed: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error testing hierarchy: {e}")

if __name__ == "__main__":
    test_employee_search()
    test_hierarchy_data()
    print("\n🎉 Employee search testing completed!")
