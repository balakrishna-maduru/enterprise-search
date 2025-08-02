#!/usr/bin/env python3
"""
Employee Data Generator for Enterprise Search
Generates realistic employee data with hierarchy information for Elasticsearch
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmployeeDataGenerator:
    def __init__(self):
        """Initialize the employee data generator."""
        self.config = self._load_config()
        self.es = self._create_elasticsearch_client()
        self.index_name = self.config['index']
        
        # Define organizational hierarchy
        self.employees_data = [
            # CEO Level
            {
                "id": 1,
                "name": "Jennifer Park",
                "title": "Chief Executive Officer",
                "email": "jennifer.park@dbs.com",
                "department": "Executive",
                "location": "Singapore",
                "phone": "+65 6878 8888",
                "start_date": "2015-01-15",
                "manager_id": None,
                "level": 4,
                "has_reports": True,
                "report_count": 3,
                "skills": ["Leadership", "Strategy", "Banking", "Digital Transformation"],
                "bio": "Experienced banking executive with over 20 years in the industry"
            },
            # Senior Management Level
            {
                "id": 2,
                "name": "Michael Wong",
                "title": "Chief Technology Officer",
                "email": "michael.wong@dbs.com",
                "department": "Technology",
                "location": "Singapore",
                "phone": "+65 6878 8881",
                "start_date": "2018-03-01",
                "manager_id": 1,
                "level": 3,
                "has_reports": True,
                "report_count": 5,
                "skills": ["Technology Strategy", "Digital Banking", "Cloud Computing", "AI/ML"],
                "bio": "Technology leader driving digital transformation in banking"
            },
            {
                "id": 3,
                "name": "Sarah Chen",
                "title": "Chief Risk Officer",
                "email": "sarah.chen@dbs.com",
                "department": "Risk Management",
                "location": "Singapore",
                "phone": "+65 6878 8882",
                "start_date": "2017-06-15",
                "manager_id": 1,
                "level": 3,
                "has_reports": True,
                "report_count": 4,
                "skills": ["Risk Management", "Compliance", "Analytics", "Banking Regulations"],
                "bio": "Risk management expert with deep expertise in banking regulations"
            },
            {
                "id": 4,
                "name": "David Lim",
                "title": "Chief Financial Officer",
                "email": "david.lim@dbs.com",
                "department": "Finance",
                "location": "Singapore",
                "phone": "+65 6878 8883",
                "start_date": "2016-09-01",
                "manager_id": 1,
                "level": 3,
                "has_reports": True,
                "report_count": 3,
                "skills": ["Financial Planning", "Banking Finance", "Investment Analysis", "Budgeting"],
                "bio": "Seasoned finance professional with extensive banking experience"
            },
            # Middle Management Level
            {
                "id": 5,
                "name": "Alex Kumar",
                "title": "Senior Engineering Manager",
                "email": "alex.kumar@dbs.com",
                "department": "Technology",
                "location": "Singapore",
                "phone": "+65 6878 8884",
                "start_date": "2019-01-15",
                "manager_id": 2,
                "level": 2,
                "has_reports": True,
                "report_count": 8,
                "skills": ["Software Engineering", "Team Leadership", "Microservices", "DevOps"],
                "bio": "Engineering manager leading core banking platform development"
            },
            {
                "id": 6,
                "name": "Emma Thompson",
                "title": "Product Manager - Digital Banking",
                "email": "emma.thompson@dbs.com",
                "department": "Technology",
                "location": "Singapore",
                "phone": "+65 6878 8885",
                "start_date": "2019-08-01",
                "manager_id": 2,
                "level": 2,
                "has_reports": True,
                "report_count": 4,
                "skills": ["Product Management", "Digital Banking", "User Experience", "Agile"],
                "bio": "Product manager focused on digital banking innovations"
            },
            {
                "id": 7,
                "name": "Rachel Tan",
                "title": "Risk Analyst Manager",
                "email": "rachel.tan@dbs.com",
                "department": "Risk Management",
                "location": "Singapore",
                "phone": "+65 6878 8886",
                "start_date": "2020-02-01",
                "manager_id": 3,
                "level": 2,
                "has_reports": True,
                "report_count": 6,
                "skills": ["Risk Analysis", "Data Analytics", "Regulatory Compliance", "Team Management"],
                "bio": "Risk analyst manager specializing in credit and operational risk"
            },
            # Individual Contributor Level
            {
                "id": 8,
                "name": "James Liu",
                "title": "Senior Software Engineer",
                "email": "james.liu@dbs.com",
                "department": "Technology",
                "location": "Singapore",
                "phone": "+65 6878 8887",
                "start_date": "2020-06-15",
                "manager_id": 5,
                "level": 1,
                "has_reports": False,
                "report_count": 0,
                "skills": ["Java", "Spring Boot", "Microservices", "API Development"],
                "bio": "Senior software engineer working on core banking APIs"
            },
            {
                "id": 9,
                "name": "Lisa Zhang",
                "title": "Software Engineer",
                "email": "lisa.zhang@dbs.com",
                "department": "Technology",
                "location": "Singapore",
                "phone": "+65 6878 8888",
                "start_date": "2021-03-01",
                "manager_id": 5,
                "level": 1,
                "has_reports": False,
                "report_count": 0,
                "skills": ["Python", "FastAPI", "Database Design", "Testing"],
                "bio": "Software engineer specializing in API development and testing"
            },
            {
                "id": 10,
                "name": "Robert Singh",
                "title": "UX Designer",
                "email": "robert.singh@dbs.com",
                "department": "Technology",
                "location": "Singapore",
                "phone": "+65 6878 8889",
                "start_date": "2021-07-15",
                "manager_id": 6,
                "level": 1,
                "has_reports": False,
                "report_count": 0,
                "skills": ["UX Design", "Figma", "User Research", "Prototype"],
                "bio": "UX designer creating intuitive banking experiences"
            },
            {
                "id": 11,
                "name": "Maria Garcia",
                "title": "Risk Analyst",
                "email": "maria.garcia@dbs.com",
                "department": "Risk Management",
                "location": "Singapore",
                "phone": "+65 6878 8890",
                "start_date": "2021-11-01",
                "manager_id": 7,
                "level": 1,
                "has_reports": False,
                "report_count": 0,
                "skills": ["Risk Modeling", "Excel", "SQL", "Statistical Analysis"],
                "bio": "Risk analyst focusing on credit risk assessment and modeling"
            },
            {
                "id": 12,
                "name": "Kevin Ng",
                "title": "Compliance Officer",
                "email": "kevin.ng@dbs.com",
                "department": "Risk Management",
                "location": "Singapore",
                "phone": "+65 6878 8891",
                "start_date": "2022-01-15",
                "manager_id": 7,
                "level": 1,
                "has_reports": False,
                "report_count": 0,
                "skills": ["Regulatory Compliance", "AML", "KYC", "Policy Development"],
                "bio": "Compliance officer ensuring adherence to banking regulations"
            }
        ]

    def _load_config(self):
        """Load configuration from environment variables."""
        return {
            'host': os.getenv('ELASTIC_HOST', 'localhost'),
            'port': int(os.getenv('ELASTIC_PORT', '9200')),
            'scheme': os.getenv('ELASTIC_SCHEME', 'http'),
            'index': os.getenv('ELASTIC_INDEX', 'enterprise_documents'),
            'username': os.getenv('ELASTIC_USERNAME'),
            'password': os.getenv('ELASTIC_PASSWORD'),
            'use_ssl': os.getenv('ELASTIC_USE_SSL', 'false').lower() == 'true',
            'verify_certs': os.getenv('ELASTIC_VERIFY_CERTS', 'false').lower() == 'true',
            'debug': os.getenv('DEBUG', 'false').lower() == 'true'
        }

    def _create_elasticsearch_client(self):
        """Create and return an Elasticsearch client."""
        config = self.config
        
        connection_params = {
            'hosts': [{'host': config['host'], 'port': config['port'], 'scheme': config['scheme']}],
            'timeout': 30,
            'max_retries': 3,
            'retry_on_timeout': True
        }

        if config['username'] and config['password']:
            connection_params['basic_auth'] = (config['username'], config['password'])

        if config['use_ssl']:
            connection_params['use_ssl'] = True
            connection_params['verify_certs'] = config['verify_certs']

        return Elasticsearch(**connection_params)

    def generate_employee_documents(self):
        """Generate employee documents for Elasticsearch."""
        documents = []
        
        for emp in self.employees_data:
            # Create search text
            search_text = f"{emp['name']} {emp['title']} {emp['department']} {' '.join(emp.get('skills', []))}"
            
            # Create document
            doc = {
                "title": emp['name'],
                "content": f"{emp['title']} in {emp['department']} at DBS Bank. {emp.get('bio', '')}",
                "summary": f"{emp['name']} - {emp['title']} in {emp['department']}. Skills: {', '.join(emp.get('skills', []))}",
                "source": "employee-directory",
                "author": "HR System",
                "department": emp['department'],
                "content_type": "employee",
                "tags": [emp['department'].lower().replace(' ', '-')] + [skill.lower().replace(' ', '-') for skill in emp.get('skills', [])],
                "timestamp": datetime.now().isoformat(),
                "url": f"mailto:{emp['email']}",
                "employee_data": {
                    "id": emp['id'],
                    "name": emp['name'],
                    "title": emp['title'],
                    "email": emp['email'],
                    "department": emp['department'],
                    "location": emp['location'],
                    "phone": emp['phone'],
                    "start_date": emp['start_date'],
                    "manager_id": emp['manager_id'],
                    "level": emp['level'],
                    "has_reports": emp['has_reports'],
                    "report_count": emp['report_count'],
                    "document_type": "employee",
                    "indexed_at": datetime.now().isoformat(),
                    "search_text": search_text
                }
            }
            documents.append(doc)
        
        return documents

    def insert_employee_data(self):
        """Insert employee data into Elasticsearch."""
        try:
            print("🔄 Generating employee documents...")
            documents = self.generate_employee_documents()
            
            print(f"💾 Inserting {len(documents)} employee documents into Elasticsearch...")
            
            actions = []
            for doc in documents:
                action = {
                    "_index": self.index_name,
                    "_id": f"employee_{doc['employee_data']['id']}",
                    "_source": doc
                }
                actions.append(action)
            
            success, failed = bulk(self.es, actions, chunk_size=100)
            print(f"✅ Successfully inserted: {success} employee documents")
            if failed:
                print(f"❌ Failed to insert: {len(failed)} documents")
            
            # Refresh index
            self.es.indices.refresh(index=self.index_name)
            print("🔄 Index refreshed")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to insert employee data: {e}")
            return False

    def get_employee_hierarchy(self, employee_id: int):
        """Get employee hierarchy for a specific employee."""
        try:
            # Find the employee
            employee = next((emp for emp in self.employees_data if emp['id'] == employee_id), None)
            if not employee:
                return None
            
            # Build hierarchy tree
            def build_hierarchy_node(emp_data):
                # Find direct reports
                reports = [emp for emp in self.employees_data if emp.get('manager_id') == emp_data['id']]
                
                return {
                    "id": str(emp_data['id']),
                    "name": emp_data['name'], 
                    "title": emp_data['title'],
                    "department": emp_data['department'],
                    "email": emp_data['email'],
                    "level": emp_data['level'],
                    "reports": [build_hierarchy_node(report) for report in reports],
                    "is_target": emp_data['id'] == employee_id
                }
            
            # Build management chain
            def build_management_chain(emp_data):
                chain = []
                current = emp_data
                while current:
                    chain.append({
                        "id": str(current['id']),
                        "name": current['name'],
                        "title": current['title'], 
                        "department": current['department'],
                        "email": current['email'],
                        "level": current['level'],
                        "reports": [],
                        "is_target": current['id'] == employee_id
                    })
                    
                    if current.get('manager_id'):
                        current = next((emp for emp in self.employees_data if emp['id'] == current['manager_id']), None)
                    else:
                        current = None
                
                return list(reversed(chain))
            
            hierarchy_tree = build_hierarchy_node(employee)
            management_chain = build_management_chain(employee)
            
            return {
                "employee": employee,
                "hierarchy_tree": hierarchy_tree,
                "management_chain": management_chain,
                "total_employees": len(self.employees_data)
            }
            
        except Exception as e:
            print(f"❌ Failed to get employee hierarchy: {e}")
            return None

def main():
    """Main function to run the employee data generator."""
    print("🚀 Starting Employee Data Generator...")
    
    generator = EmployeeDataGenerator()
    
    # Insert employee data
    if generator.insert_employee_data():
        print("✅ Employee data generation completed successfully!")
        
        # Test hierarchy for a few employees
        print("\n🔍 Testing employee hierarchy...")
        for emp_id in [1, 5, 8]:
            hierarchy = generator.get_employee_hierarchy(emp_id)
            if hierarchy:
                print(f"   Employee {emp_id} ({hierarchy['employee']['name']}) hierarchy generated")
            else:
                print(f"   Failed to generate hierarchy for employee {emp_id}")
    else:
        print("❌ Employee data generation failed!")

if __name__ == "__main__":
    main()
