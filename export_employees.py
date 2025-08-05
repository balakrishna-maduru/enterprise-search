#!/usr/bin/env python3
"""
Employee CSV Export Script
Exports all employee data from Elasticsearch to a CSV file
"""

import csv
import json
import requests
from datetime import datetime
import sys
import os

# Configuration
ELASTICSEARCH_URL = "http://localhost:9200"
INDEX_NAME = "employees"
OUTPUT_FILE = "employees_export.csv"

def export_employees_to_csv():
    """Export all employees from Elasticsearch to CSV file"""
    
    print("🔄 Starting employee export...")
    
    try:
        # Get all employees from Elasticsearch
        search_url = f"{ELASTICSEARCH_URL}/{INDEX_NAME}/_search"
        
        # Search for all employees
        search_body = {
            "query": {"match_all": {}},
            "size": 1000,  # Adjust if you have more than 1000 employees
            "sort": [{"id": {"order": "asc"}}]
        }
        
        print(f"📡 Fetching employees from {search_url}...")
        response = requests.post(search_url, json=search_body)
        
        if not response.ok:
            print(f"❌ Error fetching employees: {response.status_code} - {response.text}")
            return False
            
        data = response.json()
        employees = [hit['_source'] for hit in data['hits']['hits']]
        
        if not employees:
            print("❌ No employees found in the index")
            return False
            
        print(f"✅ Found {len(employees)} employees")
        
        # Define CSV field names based on the employee data structure
        fieldnames = [
            'id', 'name', 'email', 'title', 'department', 'location', 
            'phone', 'start_date', 'manager_id', 'level', 'skills', 
            'projects', 'bio', 'manager_name', 'reports', 'has_reports', 
            'report_count', 'hierarchy_path', 'org_level', 'tenure_years', 
            'last_updated'
        ]
        
        # Export to CSV
        print(f"💾 Writing to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header
            writer.writeheader()
            
            # Write employee data
            for employee in employees:
                # Convert lists to JSON strings for CSV storage
                if 'skills' in employee and isinstance(employee['skills'], list):
                    employee['skills'] = json.dumps(employee['skills'])
                if 'projects' in employee and isinstance(employee['projects'], list):
                    employee['projects'] = json.dumps(employee['projects'])
                if 'reports' in employee and isinstance(employee['reports'], list):
                    employee['reports'] = json.dumps(employee['reports'])
                
                # Ensure all fields are present
                csv_row = {}
                for field in fieldnames:
                    csv_row[field] = employee.get(field, '')
                
                writer.writerow(csv_row)
        
        print(f"✅ Successfully exported {len(employees)} employees to {OUTPUT_FILE}")
        print(f"📊 File size: {os.path.getsize(OUTPUT_FILE)} bytes")
        
        # Display first few employees as preview
        print("\n📋 Preview of exported data:")
        for i, emp in enumerate(employees[:3]):
            print(f"  {i+1}. {emp.get('name', 'N/A')} - {emp.get('title', 'N/A')} ({emp.get('department', 'N/A')})")
        
        if len(employees) > 3:
            print(f"  ... and {len(employees) - 3} more employees")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return False

def main():
    """Main function"""
    print("🏢 Employee CSV Export Tool")
    print("=" * 40)
    
    if export_employees_to_csv():
        print(f"\n🎉 Export completed successfully!")
        print(f"📁 File location: {os.path.abspath(OUTPUT_FILE)}")
    else:
        print("\n💥 Export failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
