#!/usr/bin/env python3
"""
Add sample employee data to Elasticsearch for testing the employee search API
"""

import json
import requests
from datetime import datetime
import uuid

# Sample employee data
employees = [
    {
        "id": "emp_001",
        "name": "John Smith",
        "email": "john.smith@company.com",
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "location": "New York",
        "level": 3,
        "phone": "+1-555-0101",
        "manager": "emp_005",
        "start_date": "2020-03-15",
        "skills": ["Python", "JavaScript", "React", "Docker"],
        "projects": ["Enterprise Search", "Data Analytics Platform"]
    },
    {
        "id": "emp_002",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@company.com",
        "title": "Product Manager",
        "department": "Product",
        "location": "San Francisco",
        "level": 4,
        "phone": "+1-555-0102",
        "manager": "emp_006",
        "start_date": "2019-08-20",
        "skills": ["Product Strategy", "User Research", "Analytics"],
        "projects": ["Mobile App", "Customer Portal"]
    },
    {
        "id": "emp_003",
        "name": "Mike Chen",
        "email": "mike.chen@company.com",
        "title": "Software Engineer",
        "department": "Engineering",
        "location": "Seattle",
        "level": 2,
        "phone": "+1-555-0103",
        "manager": "emp_001",
        "start_date": "2022-01-10",
        "skills": ["Java", "Spring Boot", "Kubernetes"],
        "projects": ["API Gateway", "Microservices"]
    },
    {
        "id": "emp_004",
        "name": "Emily Davis",
        "email": "emily.davis@company.com",
        "title": "UX Designer",
        "department": "Design",
        "location": "Austin",
        "level": 3,
        "phone": "+1-555-0104",
        "manager": "emp_002",
        "start_date": "2021-06-01",
        "skills": ["Figma", "User Research", "Prototyping"],
        "projects": ["Design System", "Mobile App"]
    },
    {
        "id": "emp_005",
        "name": "David Wilson",
        "email": "david.wilson@company.com",
        "title": "Engineering Manager",
        "department": "Engineering",
        "location": "New York",
        "level": 5,
        "phone": "+1-555-0105",
        "manager": "emp_007",
        "start_date": "2018-02-12",
        "skills": ["Leadership", "System Architecture", "Python"],
        "projects": ["Platform Modernization", "Team Growth"]
    },
    {
        "id": "emp_006",
        "name": "Lisa Kumar",
        "email": "lisa.kumar@company.com",
        "title": "VP of Product",
        "department": "Product",
        "location": "San Francisco",
        "level": 6,
        "phone": "+1-555-0106",
        "manager": "emp_008",
        "start_date": "2017-11-30",
        "skills": ["Strategic Planning", "Market Analysis", "Leadership"],
        "projects": ["Product Roadmap", "Market Expansion"]
    },
    {
        "id": "emp_007",
        "name": "Alex Thompson",
        "email": "alex.thompson@company.com",
        "title": "VP of Engineering",
        "department": "Engineering",
        "location": "New York",
        "level": 6,
        "phone": "+1-555-0107",
        "manager": "emp_008",
        "start_date": "2016-09-05",
        "skills": ["Technical Leadership", "Architecture", "Strategy"],
        "projects": ["Technical Vision", "Platform Strategy"]
    },
    {
        "id": "emp_008",
        "name": "Jennifer Tan",
        "email": "jennifer.tan@company.com",
        "title": "Chief Technology Officer",
        "department": "Executive",
        "location": "San Francisco",
        "level": 7,
        "phone": "+1-555-0108",
        "manager": None,
        "start_date": "2015-01-15",
        "skills": ["Executive Leadership", "Digital Transformation", "Innovation"],
        "projects": ["Company Digital Strategy", "Technology Roadmap"]
    }
]

def add_employees_to_elasticsearch():
    """Add employee data to Elasticsearch index"""
    es_url = "http://localhost:9200"
    index_name = "employees"
    
    print(f"Adding {len(employees)} employees to {index_name} index...")
    
    for emp in employees:
        doc_id = str(uuid.uuid4())
        
        # Create document structure that matches the expected format
        document = {
            "title": f"Employee Profile: {emp['name']}",
            "content": f"Employee profile for {emp['name']} - {emp['title']} in {emp['department']} department. Located in {emp['location']}. Skills: {', '.join(emp['skills'])}. Projects: {', '.join(emp['projects'])}.",
            "summary": f"{emp['name']} - {emp['title']} in {emp['department']}",
            "source": "hr_system",
            "content_type": "employee",
            "author": "HR System",
            "department": emp['department'],
            "timestamp": datetime.now().isoformat(),
            "tags": ["employee", "profile", emp['department'].lower()],
            "employee_data": emp
        }
        
        # Index the document
        response = requests.put(
            f"{es_url}/{index_name}/_doc/{doc_id}",
            json=document,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Added employee: {emp['name']}")
        else:
            print(f"❌ Failed to add employee: {emp['name']} - {response.text}")
    
    # Refresh index to make documents searchable
    refresh_response = requests.post(f"{es_url}/{index_name}/_refresh")
    if refresh_response.status_code == 200:
        print("✅ Index refreshed successfully")
    else:
        print(f"❌ Failed to refresh index: {refresh_response.text}")
    
    print(f"🎉 Finished adding employee data!")

if __name__ == "__main__":
    add_employees_to_elasticsearch()
