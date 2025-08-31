#!/usr/bin/env python3
"""
Employee CSV Import Script
Imports employee data from CSV file back to Elasticsearch
"""

import csv
import json
import requests
from datetime import datetime
import sys
import os
import argparse

# Configuration
ELASTICSEARCH_URL = "http://localhost:9200"
INDEX_NAME = "new_people"
DEFAULT_CSV_FILE = "employees_export.csv"

def create_target_index():
    """Create the target index with proper mapping if it doesn't exist."""
    
    index_body = {
        "settings": {
            "analysis": {
                "analyzer": {
                    "edge_ngram_analyzer": {
                        "tokenizer": "edge_ngram_tokenizer",
                        "filter": ["lowercase"]
                    }
                },
                "tokenizer": {
                    "edge_ngram_tokenizer": {
                        "type": "edge_ngram",
                        "min_gram": 2,
                        "max_gram": 20,
                        "token_chars": ["letter", "digit"]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "name": {
                    "type": "text",
                    "fields": {
                        "keyword": {"type": "keyword"},
                        "edge_ngram": {
                            "type": "text",
                            "analyzer": "edge_ngram_analyzer",
                            "search_analyzer": "standard"
                        }
                    }
                },
                "email": {"type": "keyword"},
                "title": {
                    "type": "text",
                    "fields": {
                        "keyword": {"type": "keyword"},
                        "edge_ngram": {
                            "type": "text",
                            "analyzer": "edge_ngram_analyzer",
                            "search_analyzer": "standard"
                        }
                    }
                },
                "department": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword"}}
                },
                "location": {
                    "type": "text",
                    "fields": {"keyword": {"type": "keyword"}}
                },
                "phone": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "start_date": {"type": "date"},
                "manager_id": {"type": "keyword"},
                "level": {"type": "integer"},
                "skills": {"type": "text"},
                "projects": {"type": "text"},
                "bio": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "manager_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "reports": {"type": "object"},
                "has_reports": {"type": "boolean"},
                "report_count": {"type": "long"},
                "hierarchy_path": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "org_level": {"type": "long"},
                "tenure_years": {"type": "float"},
                "last_updated": {"type": "date"}
            }
        }
    }
    
    index_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}"
    
    # Check if index exists
    check_response = requests.head(index_url)
    if check_response.status_code == 200:
        print(f"⚠️  Index '{INDEX_NAME}' already exists. For mapping changes to apply, delete the index and re-run.")
        return True
    
    # Create index
    print(f"🔧 Creating index '{INDEX_NAME}' with optimized mapping...")
    response = requests.put(index_url, json=index_body)
    
    if response.ok:
        print(f"✅ Index '{INDEX_NAME}' created successfully")
        return True
    else:
        print(f"❌ Failed to create index: {response.status_code} - {response.text}")
        return False

def build_hierarchy_data(employees):
    """Build hierarchy data for employees based on manager-employee relationships"""
    
    print("🌳 Building organizational hierarchy...")
    
    # Create lookup dictionaries
    employee_by_id = {emp['id']: emp for emp in employees}
    reports_by_manager = {}
    
    # Build reports mapping
    for emp in employees:
        manager_id = emp.get('manager_id')
        if manager_id and manager_id in employee_by_id:
            if manager_id not in reports_by_manager:
                reports_by_manager[manager_id] = []
            reports_by_manager[manager_id].append(emp)
    
    # Calculate hierarchy data for each employee
    for emp in employees:
        emp_id = emp['id']
        
        # Get direct reports
        direct_reports = reports_by_manager.get(emp_id, [])
        emp['reports'] = [{'id': r['id'], 'name': r['name'], 'title': r['title']} for r in direct_reports]
        emp['has_reports'] = len(direct_reports) > 0
        emp['report_count'] = len(direct_reports)
        
        # Calculate org level (distance from CEO)
        level = 0
        current_id = emp_id
        visited = set()
        
        while current_id and current_id not in visited:
            visited.add(current_id)
            current_emp = employee_by_id.get(current_id)
            if not current_emp or not current_emp.get('manager_id'):
                break
            current_id = current_emp['manager_id']
            level += 1
            
            # Prevent infinite loops in case of data cycles
            if level > 20:
                break
        
        emp['level'] = level
        emp['org_level'] = level
        
        # Build hierarchy path
        path_parts = []
        current_id = emp_id
        visited = set()
        
        while current_id and current_id not in visited:
            visited.add(current_id)
            current_emp = employee_by_id.get(current_id)
            if not current_emp:
                break
            path_parts.append(current_emp['name'])
            current_id = current_emp.get('manager_id')
            
            # Prevent infinite loops
            if len(path_parts) > 20:
                break
        
        # Reverse to get top-down hierarchy
        path_parts.reverse()
        emp['hierarchy_path'] = ' > '.join(path_parts)
        
        # Calculate tenure years if start_date exists
        if emp.get('start_date'):
            try:
                from datetime import datetime
                start_date = datetime.strptime(emp['start_date'], '%Y-%m-%d')
                current_date = datetime.now()
                tenure_days = (current_date - start_date).days
                emp['tenure_years'] = round(tenure_days / 365.25, 1)
            except:
                emp['tenure_years'] = 0.0
        else:
            emp['tenure_years'] = 0.0
        
        # Add manager name if not present
        if emp.get('manager_id') and emp['manager_id'] in employee_by_id:
            manager = employee_by_id[emp['manager_id']]
            emp['manager_name'] = manager.get('name', '')
        
        # Add last_updated timestamp
        emp['last_updated'] = datetime.now().isoformat()
    
    print(f"✅ Hierarchy built for {len(employees)} employees")
    return employees

def import_employees_from_csv(csv_file, clear_existing=False):
    """Import employees from CSV file to Elasticsearch"""
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file not found: {csv_file}")
        return False
    
    print(f"🔄 Starting import from {csv_file} to index '{INDEX_NAME}'...")
    
    try:
        # Clear existing data if requested
        if clear_existing:
            print(f"🗑️  Clearing existing data from index '{INDEX_NAME}'...")
            delete_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}/_delete_by_query"
            delete_body = {"query": {"match_all": {}}}
            requests.post(delete_url, json=delete_body)
        
        # Create index if it doesn't exist
        if not create_target_index():
            return False
        
        # Read CSV file
        employees = []
        
        with open(csv_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # Convert JSON strings back to lists
                if row.get('skills'):
                    try:
                        row['skills'] = json.loads(row['skills'])
                    except json.JSONDecodeError:
                        row['skills'] = row['skills'].split(',') if row['skills'] else []
                
                if row.get('projects'):
                    try:
                        row['projects'] = json.loads(row['projects'])
                    except json.JSONDecodeError:
                        row['projects'] = row['projects'].split(',') if row['projects'] else []
                
                if row.get('reports'):
                    try:
                        row['reports'] = json.loads(row['reports'])
                    except json.JSONDecodeError:
                        row['reports'] = []
                
                # Convert string booleans and numbers only if they exist
                if row.get('has_reports'):
                    row['has_reports'] = row['has_reports'].lower() in ('true', '1', 'yes')
                
                if row.get('level'):
                    try:
                        row['level'] = int(row['level'])
                    except ValueError:
                        row['level'] = None # Set to None if invalid, will be recalculated
                
                if row.get('org_level'):
                    try:
                        row['org_level'] = int(row['org_level'])
                    except ValueError:
                        row['org_level'] = None # Set to None if invalid
                
                if row.get('report_count'):
                    try:
                        row['report_count'] = int(row['report_count'])
                    except ValueError:
                        row['report_count'] = None # Set to None if invalid
                
                if row.get('tenure_years'):
                    try:
                        row['tenure_years'] = float(row['tenure_years'])
                    except ValueError:
                        row['tenure_years'] = 0.0
                
                # Remove empty fields
                employee = {k: v for k, v in row.items() if v is not None and v != ''}
                employees.append(employee)
        
        print(f"📊 Read {len(employees)} employees from CSV")
        
        # Always rebuild hierarchy data from manager_id to ensure data integrity
        print("🔧 Recalculating all hierarchy data (levels, reports, etc.) to ensure consistency...")
        employees = build_hierarchy_data(employees)
        
        # Bulk import to Elasticsearch
        print("📤 Uploading to Elasticsearch...")
        
        bulk_data = []
        for employee in employees:
            # Index action
            bulk_data.append(json.dumps({"index": {"_index": INDEX_NAME, "_id": employee.get('id')}}))
            # Document data
            bulk_data.append(json.dumps(employee))
        
        bulk_body = '\n'.join(bulk_data) + '\n'
        
        bulk_url = f"{ELASTICSEARCH_URL}/_bulk"
        headers = {'Content-Type': 'application/x-ndjson'}
        
        response = requests.post(bulk_url, data=bulk_body, headers=headers)
        
        if response.ok:
            result = response.json()
            
            if 'errors' in result and result['errors']:
                print("⚠️  Some errors occurred during import:")
                for item in result['items']:
                    if 'index' in item and 'error' in item['index']:
                        print(f"  - Error indexing {item['index'].get('_id', 'unknown')}: {item['index']['error']}")
            else:
                print(f"✅ Successfully imported {len(employees)} documents into '{INDEX_NAME}'")
            
            # Refresh index
            refresh_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}/_refresh"
            requests.post(refresh_url)
            
            return True
        else:
            print(f"❌ Bulk import failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def verify_import():
    """Verify the import by checking document count"""
    
    try:
        count_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}/_count"
        response = requests.get(count_url)
        
        if response.ok:
            data = response.json()
            count = data['count']
            print(f"📊 Verification: {count} documents in index '{INDEX_NAME}'")
            
            # Get a sample employee
            search_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}/_search"
            search_body = {"query": {"match_all": {}}, "size": 1}
            search_response = requests.post(search_url, json=search_body)
            
            if search_response.ok:
                search_data = search_response.json()
                if search_data['hits']['hits']:
                    sample = search_data['hits']['hits'][0]['_source']
                    print(f"📋 Sample employee: {sample.get('name', 'N/A')} - {sample.get('title', 'N/A')}")
            
            return True
        else:
            print(f"❌ Verification failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Import data from CSV to Elasticsearch.')
    parser.add_argument('--file', '-f', default=DEFAULT_CSV_FILE, help='CSV file to import')
    parser.add_argument('--clear', '-c', action='store_true', help='Clear existing data before import')
    
    args = parser.parse_args()
    
    print("🏢 CSV Data Import Tool for Elasticsearch")
    print("=" * 40)
    
    if import_employees_from_csv(args.file, args.clear):
        print(f"\n🎉 Import completed successfully!")
        verify_import()
    else:
        print("\n💥 Import failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
