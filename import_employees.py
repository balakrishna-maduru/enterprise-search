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
INDEX_NAME = "employees"
DEFAULT_CSV_FILE = "employees_export.csv"

def create_employees_index():
    """Create the employees index with proper mapping"""
    
    mapping = {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "email": {"type": "keyword"},
                "title": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "department": {"type": "keyword"},
                "location": {"type": "keyword"},
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
        print(f"⚠️  Index '{INDEX_NAME}' already exists")
        return True
    
    # Create index
    print(f"🔧 Creating index '{INDEX_NAME}'...")
    response = requests.put(index_url, json=mapping)
    
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
            
            # Prevent infinite loops
            if level > 10:
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
            if len(path_parts) > 10:
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
    
    print(f"🔄 Starting employee import from {csv_file}...")
    
    try:
        # Clear existing data if requested
        if clear_existing:
            print("🗑️  Clearing existing employee data...")
            delete_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}/_delete_by_query"
            delete_body = {"query": {"match_all": {}}}
            requests.post(delete_url, json=delete_body)
        
        # Create index if it doesn't exist
        if not create_employees_index():
            return False
        
        # Read CSV file
        employees = []
        missing_hierarchy_columns = False
        
        with open(csv_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            # Check if hierarchy columns are missing
            fieldnames = reader.fieldnames or []
            hierarchy_fields = ['level', 'reports', 'has_reports', 'report_count']
            missing_fields = [field for field in hierarchy_fields if field not in fieldnames]
            
            if missing_fields:
                missing_hierarchy_columns = True
                print(f"⚠️  Missing hierarchy columns: {', '.join(missing_fields)}")
                print("🔧 Will auto-generate hierarchy data from manager relationships")
            
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
                
                if row.get('reports') and not missing_hierarchy_columns:
                    try:
                        row['reports'] = json.loads(row['reports'])
                    except json.JSONDecodeError:
                        row['reports'] = []
                
                # Convert string booleans and numbers only if they exist
                if row.get('has_reports') and not missing_hierarchy_columns:
                    row['has_reports'] = row['has_reports'].lower() in ('true', '1', 'yes')
                
                if row.get('level') and not missing_hierarchy_columns:
                    try:
                        row['level'] = int(row['level'])
                    except ValueError:
                        row['level'] = 0
                
                if row.get('org_level'):
                    try:
                        row['org_level'] = int(row['org_level'])
                    except ValueError:
                        row['org_level'] = 0
                
                if row.get('report_count') and not missing_hierarchy_columns:
                    try:
                        row['report_count'] = int(row['report_count'])
                    except ValueError:
                        row['report_count'] = 0
                
                if row.get('tenure_years'):
                    try:
                        row['tenure_years'] = float(row['tenure_years'])
                    except ValueError:
                        row['tenure_years'] = 0.0
                
                # Remove empty fields
                employee = {k: v for k, v in row.items() if v}
                employees.append(employee)
        
        print(f"📊 Read {len(employees)} employees from CSV")
        
        # Build hierarchy data if columns are missing
        if missing_hierarchy_columns:
            employees = build_hierarchy_data(employees)
        
        print(f"📊 Read {len(employees)} employees from CSV")
        
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
                print(f"✅ Successfully imported {len(employees)} employees")
            
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
            print(f"📊 Verification: {count} employees in index")
            
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
    parser = argparse.ArgumentParser(description='Import employee data from CSV to Elasticsearch')
    parser.add_argument('--file', '-f', default=DEFAULT_CSV_FILE, help='CSV file to import')
    parser.add_argument('--clear', '-c', action='store_true', help='Clear existing data before import')
    
    args = parser.parse_args()
    
    print("🏢 Employee CSV Import Tool")
    print("=" * 40)
    
    if import_employees_from_csv(args.file, args.clear):
        print(f"\n🎉 Import completed successfully!")
        verify_import()
    else:
        print("\n💥 Import failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
