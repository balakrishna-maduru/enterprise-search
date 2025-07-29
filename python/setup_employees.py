#!/usr/bin/env python3
"""
Setup script to load employee data from people.json into Elasticsearch
This script creates the employee index and loads organizational data
"""

import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError, ConnectionError

# Add the current directory to Python path to import setup_elastic
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class EmployeeDataLoader:
    def __init__(self, es_host: str = "localhost", es_port: int = 9200):
        """Initialize the employee data loader."""
        self.es_host = es_host
        self.es_port = es_port
        self.index_name = "employees"
        
        # Initialize Elasticsearch client
        try:
            self.es = Elasticsearch([f"http://{es_host}:{es_port}"])
            # Test connection
            if not self.es.ping():
                raise ConnectionError("Failed to connect to Elasticsearch")
            print(f"✅ Connected to Elasticsearch at {es_host}:{es_port}")
        except Exception as e:
            print(f"❌ Failed to connect to Elasticsearch: {e}")
            sys.exit(1)

    def create_employee_index(self) -> bool:
        """Create the employee index with proper mapping."""
        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "email": {"type": "keyword"},
                    "title": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "department": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "location": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "manager_id": {"type": "keyword"},
                    "manager_name": {"type": "text"},
                    "level": {"type": "integer"},
                    "start_date": {"type": "date"},
                    "phone": {"type": "keyword"},
                    "skills": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "projects": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "bio": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "reports": {
                        "type": "nested",
                        "properties": {
                            "id": {"type": "keyword"},
                            "name": {"type": "text"},
                            "title": {"type": "text"}
                        }
                    },
                    "hierarchy_path": {"type": "keyword"},
                    "org_level": {"type": "integer"},
                    "has_reports": {"type": "boolean"},
                    "report_count": {"type": "integer"},
                    "tenure_years": {"type": "float"},
                    "last_updated": {"type": "date"}
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "employee_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "stop"]
                        }
                    }
                }
            }
        }

        try:
            # Delete index if it exists
            if self.es.indices.exists(index=self.index_name):
                self.es.indices.delete(index=self.index_name)
                print(f"🗑️  Deleted existing index: {self.index_name}")

            # Create new index
            self.es.indices.create(index=self.index_name, body=mapping)
            print(f"✅ Created employee index: {self.index_name}")
            return True

        except Exception as e:
            print(f"❌ Failed to create employee index: {e}")
            return False

    def load_people_data(self, file_path: str) -> Optional[List[Dict[str, Any]]]:
        """Load employee data from people.json file."""
        try:
            if not os.path.exists(file_path):
                print(f"❌ File not found: {file_path}")
                return None

            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # If data is a single object with nested structure, flatten it
            if isinstance(data, dict) and "reports" in data:
                # This is a hierarchical structure, need to flatten
                flattened = self.flatten_hierarchy(data)
                print(f"✅ Flattened hierarchical data to {len(flattened)} employee records")
                return flattened
            elif isinstance(data, list):
                print(f"✅ Loaded {len(data)} employee records from {file_path}")
                return data
            else:
                print(f"❌ Unexpected data format in {file_path}")
                return None

        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in {file_path}: {e}")
            return None
        except Exception as e:
            print(f"❌ Failed to load {file_path}: {e}")
            return None

    def flatten_hierarchy(self, node: Dict[str, Any], manager_id: Optional[str] = None, level: int = 0) -> List[Dict[str, Any]]:
        """Flatten hierarchical employee structure."""
        employees = []
        
        # Create employee record for current node
        employee = {
            "id": str(node.get("id", "")),
            "name": node.get("name", ""),
            "email": node.get("email", ""),
            "title": node.get("title", ""),
            "department": node.get("department", ""),
            "location": node.get("location", ""),
            "phone": node.get("phone", ""),
            "start_date": node.get("startDate", node.get("start_date", "")),
            "manager_id": manager_id,
            "level": level,
            "skills": node.get("skills", []),
            "projects": node.get("projects", []),
            "bio": node.get("bio", "")
        }
        
        employees.append(employee)
        
        # Process reports recursively
        reports = node.get("reports", [])
        for report in reports:
            child_employees = self.flatten_hierarchy(report, str(node.get("id")), level + 1)
            employees.extend(child_employees)
        
        return employees

    def enhance_employee_data(self, employees: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhance employee data with additional computed fields."""
        # Create lookup dictionaries
        employee_lookup = {emp.get('id'): emp for emp in employees}
        manager_lookup = {}
        reports_lookup = {}

        # Build manager and reports relationships
        for emp in employees:
            emp_id = emp.get('id')
            manager_id = emp.get('manager_id')
            
            if manager_id and manager_id in employee_lookup:
                manager_lookup[emp_id] = employee_lookup[manager_id]
                
                # Add to manager's reports
                if manager_id not in reports_lookup:
                    reports_lookup[manager_id] = []
                reports_lookup[manager_id].append(emp)

        # Enhance each employee record
        enhanced_employees = []
        
        for emp in employees:
            emp_id = emp.get('id')
            enhanced_emp = emp.copy()
            
            # Add manager information
            if emp_id in manager_lookup:
                manager = manager_lookup[emp_id]
                enhanced_emp['manager_name'] = manager.get('name', '')
            else:
                enhanced_emp['manager_name'] = ''

            # Add reports information
            reports = reports_lookup.get(emp_id, [])
            enhanced_emp['reports'] = [
                {
                    'id': report.get('id'),
                    'name': report.get('name'),
                    'title': report.get('title')
                }
                for report in reports
            ]
            enhanced_emp['has_reports'] = len(reports) > 0
            enhanced_emp['report_count'] = len(reports)

            # Calculate hierarchy path (chain of command)
            hierarchy_path = []
            current_emp = enhanced_emp
            visited = set()
            
            while current_emp.get('manager_id') and current_emp['manager_id'] not in visited:
                visited.add(current_emp.get('id'))
                manager_id = current_emp['manager_id']
                if manager_id in employee_lookup:
                    hierarchy_path.append(manager_id)
                    current_emp = employee_lookup[manager_id]
                else:
                    break
            
            enhanced_emp['hierarchy_path'] = '->'.join(reversed(hierarchy_path)) if hierarchy_path else ''
            enhanced_emp['org_level'] = len(hierarchy_path)

            # Calculate tenure
            start_date = enhanced_emp.get('start_date')
            if start_date:
                try:
                    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                    tenure_days = (datetime.now() - start_dt).days
                    enhanced_emp['tenure_years'] = round(tenure_days / 365.25, 1)
                except:
                    enhanced_emp['tenure_years'] = 0
            else:
                enhanced_emp['tenure_years'] = 0

            # Add timestamp
            enhanced_emp['last_updated'] = datetime.now().isoformat()

            enhanced_employees.append(enhanced_emp)

        return enhanced_employees

    def index_employees(self, employees: List[Dict[str, Any]]) -> bool:
        """Index employee data into Elasticsearch."""
        try:
            actions = []
            
            for emp in employees:
                action = {
                    "_index": self.index_name,
                    "_id": emp.get('id'),
                    "_source": emp
                }
                actions.append(action)

            # Bulk index
            from elasticsearch.helpers import bulk
            
            success_count, failed_items = bulk(
                self.es,
                actions,
                index=self.index_name,
                refresh=True
            )
            
            print(f"✅ Successfully indexed {success_count} employees")
            
            if failed_items:
                print(f"⚠️  Failed to index {len(failed_items)} employees")
                for item in failed_items[:5]:  # Show first 5 failures
                    print(f"   - {item}")
            
            return True

        except Exception as e:
            print(f"❌ Failed to index employees: {e}")
            return False

    def verify_index(self) -> bool:
        """Verify the indexed data."""
        try:
            # Get index stats
            stats = self.es.indices.stats(index=self.index_name)
            doc_count = stats['indices'][self.index_name]['total']['docs']['count']
            
            print(f"📊 Index verification:")
            print(f"   - Document count: {doc_count}")
            
            # Test search
            search_results = self.es.search(
                index=self.index_name,
                body={
                    "query": {"match_all": {}},
                    "size": 3
                }
            )
            
            print(f"   - Sample employees:")
            for hit in search_results['hits']['hits']:
                source = hit['_source']
                print(f"     * {source.get('name')} - {source.get('title')} ({source.get('department')})")
            
            return True

        except Exception as e:
            print(f"❌ Index verification failed: {e}")
            return False

def main():
    """Main function to setup employee data in Elasticsearch."""
    print("🚀 Starting Employee Data Setup...")
    print("=" * 50)
    
    # Initialize loader
    loader = EmployeeDataLoader()
    
    # Create index
    if not loader.create_employee_index():
        sys.exit(1)
    
    # Load data
    people_file = "people.json"
    if not os.path.exists(people_file):
        # Try looking in parent directory
        people_file = "../people.json"
        if not os.path.exists(people_file):
            print(f"❌ Could not find people.json file")
            print("Please ensure people.json exists in the current directory or parent directory")
            sys.exit(1)
    
    employees = loader.load_people_data(people_file)
    if not employees:
        sys.exit(1)
    
    # Enhance data
    print("🔧 Enhancing employee data with relationships...")
    enhanced_employees = loader.enhance_employee_data(employees)
    
    # Index data
    print("📝 Indexing employee data...")
    if not loader.index_employees(enhanced_employees):
        sys.exit(1)
    
    # Verify
    print("✅ Verifying indexed data...")
    if not loader.verify_index():
        sys.exit(1)
    
    print("=" * 50)
    print("🎉 Employee data setup completed successfully!")
    print(f"   - Index: {loader.index_name}")
    print(f"   - Employees: {len(enhanced_employees)}")
    print(f"   - Elasticsearch: http://{loader.es_host}:{loader.es_port}")

if __name__ == "__main__":
    main()
