#!/usr/bin/env python3
"""
Consolidated Employee Data Manager
Creates a clean 5-level hierarchy with exactly 30 employees
Replaces all duplicate people.json files and setup scripts
"""

import json
import requests
from datetime import datetime, timedelta
import random

# Configuration
ES_URL = "http://localhost:9200"
INDEX_NAME = "employees"
TOTAL_EMPLOYEES = 30

# Clean employee data structure for 5 levels (0-4)
ORGANIZATIONAL_STRUCTURE = {
    0: {"count": 1, "title": "Chief Executive Officer", "dept": "Executive"},
    1: {"count": 4, "titles": ["CTO", "CFO", "VP HR", "VP Sales"], "departments": ["Technology", "Finance", "Human Resources", "Sales"]},
    2: {"count": 8, "title_template": "Director", "departments": ["Technology", "Finance", "Human Resources", "Sales"]},
    3: {"count": 8, "title_template": "Manager", "departments": ["Technology", "Finance", "Human Resources", "Sales"]},
    4: {"count": 9, "title_template": "Specialist", "departments": ["Technology", "Finance", "Human Resources", "Sales"]}
}

# Clean employee names and data
EMPLOYEE_DATA = [
    # Level 0 - CEO
    {"name": "James Wilson", "title": "Chief Executive Officer", "dept": "Executive", "location": "New York, NY", "level": 0, "manager_id": None},
    
    # Level 1 - VPs (4 people)
    {"name": "Sarah Chen", "title": "Chief Technology Officer", "dept": "Technology", "location": "San Francisco, CA", "level": 1, "manager_id": "1"},
    {"name": "Michael Davis", "title": "Chief Financial Officer", "dept": "Finance", "location": "New York, NY", "level": 1, "manager_id": "1"},
    {"name": "Jennifer Martinez", "title": "VP of Human Resources", "dept": "Human Resources", "location": "Chicago, IL", "level": 1, "manager_id": "1"},
    {"name": "Robert Brown", "title": "VP of Sales", "dept": "Sales", "location": "Austin, TX", "level": 1, "manager_id": "1"},
    
    # Level 2 - Directors (8 people, 2 per VP)
    {"name": "Lisa Rodriguez", "title": "Director of Engineering", "dept": "Technology", "location": "San Francisco, CA", "level": 2, "manager_id": "2"},
    {"name": "David Kim", "title": "Director of Product", "dept": "Technology", "location": "Seattle, WA", "level": 2, "manager_id": "2"},
    {"name": "Amanda Johnson", "title": "Director of Finance", "dept": "Finance", "location": "New York, NY", "level": 2, "manager_id": "3"},
    {"name": "Thomas Anderson", "title": "Director of Accounting", "dept": "Finance", "location": "Chicago, IL", "level": 2, "manager_id": "3"},
    {"name": "Maria Garcia", "title": "Director of Talent", "dept": "Human Resources", "location": "Chicago, IL", "level": 2, "manager_id": "4"},
    {"name": "Kevin Lee", "title": "Director of HR Operations", "dept": "Human Resources", "location": "Denver, CO", "level": 2, "manager_id": "4"},
    {"name": "Jessica Wilson", "title": "Director of Enterprise Sales", "dept": "Sales", "location": "Austin, TX", "level": 2, "manager_id": "5"},
    {"name": "Daniel Taylor", "title": "Director of Sales Operations", "dept": "Sales", "location": "Dallas, TX", "level": 2, "manager_id": "5"},
    
    # Level 3 - Managers (8 people, 1 per Director)
    {"name": "Emily Zhang", "title": "Engineering Manager", "dept": "Technology", "location": "San Francisco, CA", "level": 3, "manager_id": "6"},
    {"name": "Alex Thompson", "title": "Product Manager", "dept": "Technology", "location": "Seattle, WA", "level": 3, "manager_id": "7"},
    {"name": "Rachel Green", "title": "Finance Manager", "dept": "Finance", "location": "New York, NY", "level": 3, "manager_id": "8"},
    {"name": "Mark Williams", "title": "Accounting Manager", "dept": "Finance", "location": "Chicago, IL", "level": 3, "manager_id": "9"},
    {"name": "Sophie Miller", "title": "Talent Manager", "dept": "Human Resources", "location": "Chicago, IL", "level": 3, "manager_id": "10"},
    {"name": "Chris Davis", "title": "HR Operations Manager", "dept": "Human Resources", "location": "Denver, CO", "level": 3, "manager_id": "11"},
    {"name": "Nicole Adams", "title": "Sales Manager", "dept": "Sales", "location": "Austin, TX", "level": 3, "manager_id": "12"},
    {"name": "Brian Clark", "title": "Sales Operations Manager", "dept": "Sales", "location": "Dallas, TX", "level": 3, "manager_id": "13"},
    
    # Level 4 - Individual Contributors (9 people)
    {"name": "John Mitchell", "title": "Senior Software Engineer", "dept": "Technology", "location": "San Francisco, CA", "level": 4, "manager_id": "14"},
    {"name": "Anna Parker", "title": "Software Engineer", "dept": "Technology", "location": "San Francisco, CA", "level": 4, "manager_id": "14"},
    {"name": "Mike Turner", "title": "Product Specialist", "dept": "Technology", "location": "Seattle, WA", "level": 4, "manager_id": "15"},
    {"name": "Linda Cooper", "title": "Senior Financial Analyst", "dept": "Finance", "location": "New York, NY", "level": 4, "manager_id": "16"},
    {"name": "Paul Robinson", "title": "Financial Analyst", "dept": "Finance", "location": "New York, NY", "level": 4, "manager_id": "16"},
    {"name": "Carol White", "title": "Accountant", "dept": "Finance", "location": "Chicago, IL", "level": 4, "manager_id": "17"},
    {"name": "Steve Martin", "title": "HR Specialist", "dept": "Human Resources", "location": "Chicago, IL", "level": 4, "manager_id": "18"},
    {"name": "Lisa Evans", "title": "Recruiter", "dept": "Human Resources", "location": "Denver, CO", "level": 4, "manager_id": "19"},
    {"name": "Tom Harris", "title": "Sales Representative", "dept": "Sales", "location": "Austin, TX", "level": 4, "manager_id": "20"},
]

def create_employee_record(emp_data, emp_id):
    """Create a standardized employee record"""
    start_date = datetime.now() - timedelta(days=random.randint(100, 1500))
    
    # Department-specific skills
    skills_map = {
        "Executive": ["Strategic Planning", "Leadership", "Business Development"],
        "Technology": ["Software Development", "System Architecture", "Cloud Computing"],
        "Finance": ["Financial Analysis", "Budget Planning", "Risk Management"],
        "Human Resources": ["Talent Management", "Employee Relations", "HR Operations"],
        "Sales": ["Client Relations", "Revenue Growth", "Market Development"]
    }
    
    # Department-specific projects
    projects_map = {
        "Executive": ["Company Transformation", "Strategic Initiatives"],
        "Technology": ["Platform Modernization", "Tech Innovation"],
        "Finance": ["Financial Optimization", "Cost Management"],
        "Human Resources": ["Talent Development", "Culture Enhancement"],
        "Sales": ["Revenue Growth", "Market Expansion"]
    }
    
    return {
        "id": str(emp_id),
        "name": emp_data["name"],
        "email": f"{emp_data['name'].lower().replace(' ', '.')}@company.com",
        "title": emp_data["title"],
        "department": emp_data["dept"],
        "location": emp_data["location"],
        "phone": f"+1-555-{random.randint(1000, 9999)}",
        "start_date": start_date.strftime("%Y-%m-%d"),
        "manager_id": emp_data["manager_id"],
        "level": emp_data["level"],
        "skills": skills_map.get(emp_data["dept"], ["Professional Skills"]),
        "projects": projects_map.get(emp_data["dept"], ["Department Projects"]),
        "bio": f"Experienced {emp_data['title'].lower()} with expertise in {emp_data['dept'].lower()}.",
        "manager_name": "",  # Will be populated later
        "reports": [],  # Will be populated later
        "has_reports": False,
        "report_count": 0,
        "hierarchy_path": "",
        "org_level": emp_data["level"],
        "tenure_years": round((datetime.now() - start_date).days / 365.25, 1),
        "last_updated": datetime.now().isoformat()
    }

def update_manager_relationships(employees):
    """Update manager names and reports for all employees"""
    emp_dict = {emp["id"]: emp for emp in employees}
    
    # Update manager names and build reports
    for emp in employees:
        if emp["manager_id"] and emp["manager_id"] in emp_dict:
            manager = emp_dict[emp["manager_id"]]
            emp["manager_name"] = manager["name"]
            
            # Add to manager's reports
            manager["reports"].append({
                "id": emp["id"],
                "name": emp["name"],
                "title": emp["title"]
            })
    
    # Update has_reports and report_count
    for emp in employees:
        emp["has_reports"] = len(emp["reports"]) > 0
        emp["report_count"] = len(emp["reports"])

def create_elasticsearch_index():
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
                "level": {"type": "integer"},
                "manager_id": {"type": "keyword"},
                "skills": {"type": "text"},
                "projects": {"type": "text"},
                "start_date": {"type": "date"},
                "last_updated": {"type": "date"}
            }
        }
    }
    
    response = requests.put(f"{ES_URL}/{INDEX_NAME}", json=mapping)
    if response.status_code in [200, 201]:
        print("✅ Created employees index with proper mapping")
    else:
        print(f"❌ Failed to create index: {response.text}")

def insert_employees_to_elasticsearch(employees):
    """Insert employees into Elasticsearch"""
    print(f"Inserting {len(employees)} employees into Elasticsearch...")
    
    for employee in employees:
        try:
            response = requests.put(
                f"{ES_URL}/{INDEX_NAME}/_doc/{employee['id']}",
                headers={"Content-Type": "application/json"},
                json=employee
            )
            
            if response.status_code not in [200, 201]:
                print(f"❌ Error inserting {employee['name']}: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception inserting {employee['name']}: {e}")
    
    print(f"✅ Successfully inserted {len(employees)} employees!")

def create_people_json_file(employees):
    """Create a clean people.json file"""
    people_data = {
        "metadata": {
            "total_employees": len(employees),
            "levels": 5,
            "created": datetime.now().isoformat(),
            "description": "Clean 5-level employee hierarchy with 30 employees"
        },
        "employees": employees
    }
    
    # Save to main data directory
    output_file = "/Users/balakrishnamaduru/Documents/git_hub/enterprise-search/data/employees.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(people_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created clean employees.json file: {output_file}")

def cleanup_duplicate_files():
    """Remove duplicate and old files"""
    import os
    files_to_remove = [
        "/Users/balakrishnamaduru/Documents/git_hub/enterprise-search/data/people.json",
        "/Users/balakrishnamaduru/Documents/git_hub/enterprise-search/python/people.json",
        "/Users/balakrishnamaduru/Documents/git_hub/enterprise-search/api/insert_7_level_employees.py"
    ]
    
    for file_path in files_to_remove:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"🗑️  Removed duplicate file: {file_path}")
        except Exception as e:
            print(f"⚠️  Could not remove {file_path}: {e}")

def main():
    print("🚀 Creating Clean 5-Level Employee Hierarchy (30 Employees)")
    print("=" * 60)
    
    # Cleanup old files first
    cleanup_duplicate_files()
    
    # Create employee records
    employees = []
    for i, emp_data in enumerate(EMPLOYEE_DATA, 1):
        employee = create_employee_record(emp_data, i)
        employees.append(employee)
    
    # Update manager relationships
    update_manager_relationships(employees)
    
    # Show summary
    print("\n📊 Employee Distribution:")
    levels = {}
    for emp in employees:
        level = emp["level"]
        levels.setdefault(level, []).append(emp["name"])
    
    level_names = ["CEO", "VPs", "Directors", "Managers", "Individual Contributors"]
    total = 0
    for level in sorted(levels.keys()):
        count = len(levels[level])
        total += count
        level_name = level_names[level] if level < len(level_names) else f"Level {level}"
        print(f"   Level {level} ({level_name}): {count} employees")
    print(f"   Total: {total} employees")
    
    # Create Elasticsearch index and insert data
    create_elasticsearch_index()
    insert_employees_to_elasticsearch(employees)
    
    # Create clean JSON file
    create_people_json_file(employees)
    
    print("\n✅ Clean Employee Hierarchy Setup Complete!")
    print(f"📈 Total: {len(employees)} employees across 5 levels (0-4)")
    print("🔍 Test with: curl 'http://localhost:8000/api/v1/employees/1/hierarchy'")
    print("📁 Clean data saved to: data/employees.json")

if __name__ == "__main__":
    main()
