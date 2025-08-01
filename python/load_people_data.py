#!/usr/bin/env python3
"""
Load People Data into Elasticsearch
Loads employee/people data from people.json into the enterprise_documents index
"""

import json
import os
from elasticsearch import Elasticsearch
from datetime import datetime
import uuid

class PeopleDataLoader:
    def __init__(self):
        """Initialize Elasticsearch connection."""
        # Use same connection as setup_elastic.py
        self.es = Elasticsearch(
            [{'host': 'localhost', 'port': 9200, 'scheme': 'http'}],
            timeout=30,
            max_retries=3,
            retry_on_timeout=True
        )
        self.index_name = 'enterprise_documents'
        
    def flatten_employees(self, employee_data, level=0, manager_id=None):
        """Recursively flatten the nested employee structure."""
        employees = []
        
        # Process current employee
        if isinstance(employee_data, dict):
            # Create employee document
            employee = {
                'id': f"employee_{employee_data.get('id', str(uuid.uuid4()))}",
                'title': employee_data.get('name', 'Unknown Employee'),
                'content': f"{employee_data.get('name', '')} - {employee_data.get('title', '')} in {employee_data.get('department', '')}. {employee_data.get('bio', '')}",
                'summary': f"{employee_data.get('name', '')} - {employee_data.get('title', '')} in {employee_data.get('department', '')}",
                'source': 'people-directory',
                'author': 'HR System',
                'content_type': 'employee',
                'department': employee_data.get('department', 'Unknown'),
                'tags': [
                    employee_data.get('department', '').lower().replace(' ', '-'),
                    employee_data.get('title', '').lower().replace(' ', '-'),
                    'employee',
                    'staff',
                    'directory'
                ] + [skill.lower().replace(' ', '-') for skill in employee_data.get('skills', [])],
                'timestamp': datetime.now().isoformat(),
                'url': f"mailto:{employee_data.get('email', '')}",
                
                # Employee-specific fields
                'employee_data': {
                    'id': int(employee_data.get('id', 0)),
                    'name': employee_data.get('name', ''),
                    'title': employee_data.get('title', ''),
                    'email': employee_data.get('email', ''),
                    'department': employee_data.get('department', ''),
                    'location': employee_data.get('location', ''),
                    'phone': employee_data.get('phone', ''),
                    'start_date': employee_data.get('startDate', ''),
                    'manager_id': manager_id,
                    'level': level,
                    'has_reports': len(employee_data.get('reports', [])) > 0,
                    'report_count': len(employee_data.get('reports', [])),
                    'skills': employee_data.get('skills', []),
                    'projects': employee_data.get('projects', []),
                    'bio': employee_data.get('bio', ''),
                    'document_type': 'employee',
                    'indexed_at': datetime.now().isoformat(),
                    'search_text': f"{employee_data.get('name', '')} {employee_data.get('title', '')} {employee_data.get('department', '')} {' '.join(employee_data.get('skills', []))}"
                }
            }
            
            employees.append(employee)
            
            # Process reports (subordinates)
            for report in employee_data.get('reports', []):
                employees.extend(
                    self.flatten_employees(
                        report, 
                        level + 1, 
                        int(employee_data.get('id', 0))
                    )
                )
        
        return employees
    
    def load_people_from_file(self, file_path):
        """Load and process people data from JSON file."""
        print(f"Loading people data from {file_path}")
        
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Handle both single employee and array formats
            if isinstance(data, dict):
                # Single employee at root (like python/people.json)
                employees = self.flatten_employees(data)
            elif isinstance(data, list):
                # Array of employees (like data/people.json)
                employees = []
                for emp in data:
                    employees.extend(self.flatten_employees(emp))
            else:
                print(f"❌ Unexpected data format in {file_path}")
                return []
            
            print(f"✅ Processed {len(employees)} employees from {file_path}")
            return employees
            
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
            return []
    
    def index_employees(self, employees):
        """Index employee documents into Elasticsearch."""
        print(f"🔍 Indexing {len(employees)} employees into {self.index_name}")
        
        success_count = 0
        error_count = 0
        
        for employee in employees:
            try:
                # Index the employee document
                response = self.es.index(
                    index=self.index_name,
                    id=employee['id'],
                    body=employee
                )
                
                if response.get('result') in ['created', 'updated']:
                    success_count += 1
                else:
                    error_count += 1
                    print(f"⚠️ Unexpected response for {employee['id']}: {response}")
                    
            except Exception as e:
                error_count += 1
                print(f"❌ Error indexing {employee['id']}: {e}")
        
        print(f"✅ Successfully indexed {success_count} employees")
        if error_count > 0:
            print(f"❌ Failed to index {error_count} employees")
        
        return success_count, error_count
    
    def run(self):
        """Main execution function."""
        print("🚀 Starting People Data Loader for Enterprise Search")
        
        # Check Elasticsearch connection
        try:
            info = self.es.info()
            print(f"✅ Connected to Elasticsearch: {info['version']['number']}")
        except Exception as e:
            print(f"❌ Failed to connect to Elasticsearch: {e}")
            return
        
        # Check if index exists
        if not self.es.indices.exists(index=self.index_name):
            print(f"❌ Index {self.index_name} does not exist. Run setup_elastic.py first.")
            return
        
        # Load people data from both files
        all_employees = []
        
        # Load from python/people.json (hierarchical structure)
        python_people_file = os.path.join(os.path.dirname(__file__), 'people.json')
        if os.path.exists(python_people_file):
            employees = self.load_people_from_file(python_people_file)
            all_employees.extend(employees)
        
        # Load from data/people.json (if it exists and has different data)
        data_people_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'people.json')
        if os.path.exists(data_people_file):
            employees = self.load_people_from_file(data_people_file)
            all_employees.extend(employees)
        
        if not all_employees:
            print("❌ No employee data found to load")
            return
        
        # Remove duplicates based on employee ID
        unique_employees = {}
        for emp in all_employees:
            emp_id = emp['employee_data']['id']
            if emp_id not in unique_employees:
                unique_employees[emp_id] = emp
        
        final_employees = list(unique_employees.values())
        print(f"📊 Total unique employees to index: {len(final_employees)}")
        
        # Index the employees
        success, errors = self.index_employees(final_employees)
        
        # Refresh the index
        self.es.indices.refresh(index=self.index_name)
        
        print(f"🎉 People data loading completed!")
        print(f"   Indexed: {success} employees")
        print(f"   Errors: {errors}")
        
        # Show final index stats
        try:
            count_response = self.es.count(index=self.index_name, body={
                "query": {"term": {"content_type": "employee"}}
            })
            employee_count = count_response['count']
            print(f"📈 Total employees in index: {employee_count}")
        except Exception as e:
            print(f"⚠️ Could not get employee count: {e}")

if __name__ == "__main__":
    loader = PeopleDataLoader()
    loader.run()
