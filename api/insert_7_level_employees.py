#!/usr/bin/env python3
"""
Script to insert a complete 7-level employee hierarchy into Elasticsearch.
Levels 0-6 representing CEO to Individual Contributors
"""

import json
import requests
from datetime import datetime, timedelta
import random

# Elasticsearch endpoint
ES_URL = "http://localhost:9200"
INDEX_NAME = "employees"

# Employee data templates by level
LEVEL_TEMPLATES = {
    0: {
        "titles": ["Chief Executive Officer"],
        "departments": ["Executive"],
        "locations": ["New York, NY"],
        "skills_base": ["Strategic Planning", "Leadership", "Business Development"]
    },
    1: {
        "titles": ["Chief Technology Officer", "Chief Financial Officer", "VP of Human Resources", "VP of Sales", "VP of Operations", "VP of Marketing"],
        "departments": ["Technology", "Finance", "Human Resources", "Sales", "Operations", "Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Chicago, IL", "Austin, TX"],
        "skills_base": ["Leadership", "Strategy", "Team Management", "Budget Planning"]
    },
    2: {
        "titles": ["Director of Engineering", "Director of Finance", "Director of HR", "Sales Director", "Operations Director", "Marketing Director"],
        "departments": ["Engineering", "Finance", "Human Resources", "Sales", "Operations", "Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Chicago, IL", "Austin, TX", "Seattle, WA"],
        "skills_base": ["Team Leadership", "Project Management", "Department Operations", "Cross-functional Collaboration"]
    },
    3: {
        "titles": ["Engineering Manager", "Finance Manager", "HR Manager", "Sales Manager", "Operations Manager", "Marketing Manager"],
        "departments": ["Engineering", "Finance", "Human Resources", "Sales", "Operations", "Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Chicago, IL", "Austin, TX", "Seattle, WA", "Denver, CO"],
        "skills_base": ["Team Management", "Process Improvement", "Performance Management", "Resource Planning"]
    },
    4: {
        "titles": ["Senior Software Engineer", "Senior Financial Analyst", "Senior HR Specialist", "Senior Sales Representative", "Senior Operations Analyst", "Senior Marketing Specialist"],
        "departments": ["Engineering", "Finance", "Human Resources", "Sales", "Operations", "Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Chicago, IL", "Austin, TX", "Seattle, WA", "Denver, CO", "Boston, MA"],
        "skills_base": ["Technical Expertise", "Analysis", "Problem Solving", "Mentoring"]
    },
    5: {
        "titles": ["Software Engineer", "Financial Analyst", "HR Specialist", "Sales Representative", "Operations Analyst", "Marketing Specialist"],
        "departments": ["Engineering", "Finance", "Human Resources", "Sales", "Operations", "Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Chicago, IL", "Austin, TX", "Seattle, WA", "Denver, CO", "Boston, MA", "Portland, OR"],
        "skills_base": ["Professional Skills", "Analysis", "Communication", "Collaboration"]
    },
    6: {
        "titles": ["Junior Software Engineer", "Junior Financial Analyst", "Junior HR Associate", "Junior Sales Associate", "Junior Operations Associate", "Junior Marketing Associate"],
        "departments": ["Engineering", "Finance", "Human Resources", "Sales", "Operations", "Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Chicago, IL", "Austin, TX", "Seattle, WA", "Denver, CO", "Boston, MA", "Portland, OR", "Atlanta, GA"],
        "skills_base": ["Learning", "Support", "Basic Analysis", "Team Collaboration"]
    }
}

# Names pool
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
               "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen",
               "Charles", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Helen", "Mark", "Sandra",
               "Donald", "Donna", "Steven", "Carol", "Paul", "Ruth", "Andrew", "Sharon", "Kenneth", "Michelle",
               "Joshua", "Laura", "Kevin", "Sarah", "Brian", "Kimberly", "George", "Deborah", "Timothy", "Dorothy",
               "Ronald", "Amy", "Jason", "Angela", "Edward", "Ashley", "Jeffrey", "Brenda", "Ryan", "Emma"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
              "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
              "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
              "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]

def generate_employee_data():
    """Generate comprehensive employee data for 7 levels"""
    employees = []
    employee_id = 100  # Start from 100 to avoid conflicts with existing data
    
    # Level 0 - CEO (1 person)
    ceo = create_employee(
        employee_id, "James", "Wilson", 0, None, 
        "Chief Executive Officer", "Executive", "New York, NY",
        ["Strategic Planning", "Leadership", "Business Development", "Corporate Vision"],
        ["Company Transformation", "Global Expansion", "Digital Innovation"]
    )
    employees.append(ceo)
    ceo_id = employee_id
    employee_id += 1
    
    # Level 1 - VPs (6 people reporting to CEO)
    vp_data = [
        ("Michael", "Chen", "Chief Technology Officer", "Technology", "San Francisco, CA", ["Cloud Architecture", "AI/ML", "Engineering Leadership"]),
        ("Sarah", "Davis", "Chief Financial Officer", "Finance", "New York, NY", ["Financial Planning", "Risk Management", "Corporate Finance"]),
        ("Jennifer", "Garcia", "VP of Human Resources", "Human Resources", "Chicago, IL", ["Talent Management", "Organizational Development", "Employee Relations"]),
        ("Robert", "Martinez", "VP of Sales", "Sales", "Austin, TX", ["Sales Strategy", "Client Relations", "Revenue Growth"]),
        ("Lisa", "Anderson", "VP of Operations", "Operations", "Seattle, WA", ["Process Optimization", "Supply Chain", "Quality Management"]),
        ("David", "Thompson", "VP of Marketing", "Marketing", "Boston, MA", ["Brand Strategy", "Digital Marketing", "Market Research"])
    ]
    
    vp_ids = []
    for first, last, title, dept, location, skills in vp_data:
        emp = create_employee(employee_id, first, last, 1, ceo_id, title, dept, location, 
                            ["Leadership", "Strategy", "Team Management"] + skills,
                            [f"{dept} Modernization", "Strategic Initiatives"])
        employees.append(emp)
        vp_ids.append(employee_id)
        employee_id += 1
    
    # Level 2 - Directors (2-3 per VP, total ~15 people)
    director_titles_by_dept = {
        "Technology": ["Director of Engineering", "Director of Product", "Director of Data Science"],
        "Finance": ["Director of Financial Planning", "Director of Accounting"],
        "Human Resources": ["Director of Talent Acquisition", "Director of Compensation"],
        "Sales": ["Director of Enterprise Sales", "Director of Channel Sales"],
        "Operations": ["Director of Supply Chain", "Director of Quality Assurance"],
        "Marketing": ["Director of Digital Marketing", "Director of Product Marketing"]
    }
    
    director_ids = []
    for i, vp_id in enumerate(vp_ids):
        dept = vp_data[i][3]  # department
        titles = director_titles_by_dept[dept]
        for j, title in enumerate(titles):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            location = random.choice(LEVEL_TEMPLATES[2]["locations"])
            skills = LEVEL_TEMPLATES[2]["skills_base"] + [f"{dept} Operations", "Strategic Planning"]
            
            emp = create_employee(employee_id, first_name, last_name, 2, vp_id, title, dept, location, 
                                skills, [f"{dept} Excellence Program", "Process Optimization"])
            employees.append(emp)
            director_ids.append((employee_id, dept))
            employee_id += 1
    
    # Level 3 - Managers (2-3 per Director, total ~30 people)
    manager_ids = []
    for director_id, dept in director_ids:
        num_managers = random.randint(2, 3)
        for _ in range(num_managers):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            title = f"{dept} Manager"
            location = random.choice(LEVEL_TEMPLATES[3]["locations"])
            skills = LEVEL_TEMPLATES[3]["skills_base"] + [f"{dept} Expertise", "People Management"]
            
            emp = create_employee(employee_id, first_name, last_name, 3, director_id, title, dept, location,
                                skills, [f"{dept} Team Development", "Operational Excellence"])
            employees.append(emp)
            manager_ids.append((employee_id, dept))
            employee_id += 1
    
    # Level 4 - Senior Individual Contributors (3-4 per Manager, total ~100 people)
    senior_ids = []
    for manager_id, dept in manager_ids:
        num_seniors = random.randint(3, 4)
        for _ in range(num_seniors):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            title = f"Senior {dept} Specialist"
            if dept == "Engineering":
                title = "Senior Software Engineer"
            elif dept == "Finance":
                title = "Senior Financial Analyst"
            location = random.choice(LEVEL_TEMPLATES[4]["locations"])
            skills = LEVEL_TEMPLATES[4]["skills_base"] + [f"Advanced {dept}", "Technical Leadership"]
            
            emp = create_employee(employee_id, first_name, last_name, 4, manager_id, title, dept, location,
                                skills, [f"{dept} Innovation", "Best Practices Implementation"])
            employees.append(emp)
            senior_ids.append((employee_id, dept))
            employee_id += 1
    
    # Level 5 - Individual Contributors (2-3 per Senior, total ~250 people)
    ic_ids = []
    for senior_id, dept in senior_ids[:50]:  # Limit to first 50 to keep reasonable size
        num_ics = random.randint(2, 3)
        for _ in range(num_ics):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            title = f"{dept} Specialist"
            if dept == "Engineering":
                title = "Software Engineer"
            elif dept == "Finance":
                title = "Financial Analyst"
            location = random.choice(LEVEL_TEMPLATES[5]["locations"])
            skills = LEVEL_TEMPLATES[5]["skills_base"] + [f"{dept} Skills", "Problem Solving"]
            
            emp = create_employee(employee_id, first_name, last_name, 5, senior_id, title, dept, location,
                                skills, [f"{dept} Support", "Process Improvement"])
            employees.append(emp)
            ic_ids.append((employee_id, dept))
            employee_id += 1
    
    # Level 6 - Junior Individual Contributors (1-2 per IC, total ~150 people)
    for ic_id, dept in ic_ids[:75]:  # Limit to first 75 to keep reasonable size
        num_juniors = random.randint(1, 2)
        for _ in range(num_juniors):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            title = f"Junior {dept} Associate"
            if dept == "Engineering":
                title = "Junior Software Engineer"
            elif dept == "Finance":
                title = "Junior Financial Analyst"
            location = random.choice(LEVEL_TEMPLATES[6]["locations"])
            skills = LEVEL_TEMPLATES[6]["skills_base"] + [f"Basic {dept}", "Eagerness to Learn"]
            
            emp = create_employee(employee_id, first_name, last_name, 6, ic_id, title, dept, location,
                                skills, [f"{dept} Learning Program", "Skill Development"])
            employees.append(emp)
            employee_id += 1
    
    return employees

def create_employee(emp_id, first_name, last_name, level, manager_id, title, department, location, skills, projects):
    """Create an employee record"""
    name = f"{first_name} {last_name}"
    start_date = datetime.now() - timedelta(days=random.randint(30, 2000))
    
    return {
        "id": str(emp_id),
        "name": name,
        "email": f"{first_name.lower()}.{last_name.lower()}@company.com",
        "title": title,
        "department": department,
        "location": location,
        "phone": f"+1-555-{random.randint(1000, 9999)}",
        "start_date": start_date.strftime("%Y-%m-%d"),
        "manager_id": str(manager_id) if manager_id else None,
        "level": level,
        "skills": skills,
        "projects": projects,
        "bio": f"Experienced {title.lower()} with expertise in {department.lower()}.",
        "manager_name": "",  # Will be populated later
        "reports": [],  # Will be populated later
        "has_reports": False,  # Will be updated later
        "report_count": 0,  # Will be updated later
        "hierarchy_path": "",  # Will be populated later
        "org_level": level,
        "tenure_years": round((datetime.now() - start_date).days / 365.25, 1),
        "last_updated": datetime.now().isoformat()
    }

def update_reports_and_managers(employees):
    """Update manager names and reports for all employees"""
    emp_dict = {emp["id"]: emp for emp in employees}
    
    for emp in employees:
        if emp["manager_id"] and emp["manager_id"] in emp_dict:
            manager = emp_dict[emp["manager_id"]]
            emp["manager_name"] = manager["name"]
            
            # Add to manager's reports
            if "reports" not in manager:
                manager["reports"] = []
            manager["reports"].append({
                "id": emp["id"],
                "name": emp["name"],
                "title": emp["title"]
            })
    
    # Update has_reports and report_count
    for emp in employees:
        emp["has_reports"] = len(emp.get("reports", [])) > 0
        emp["report_count"] = len(emp.get("reports", []))

def insert_employees_to_elasticsearch(employees):
    """Insert employees into Elasticsearch"""
    print(f"Inserting {len(employees)} employees into Elasticsearch...")
    
    for i, employee in enumerate(employees):
        try:
            response = requests.put(
                f"{ES_URL}/{INDEX_NAME}/_doc/{employee['id']}",
                headers={"Content-Type": "application/json"},
                json=employee
            )
            
            if response.status_code not in [200, 201]:
                print(f"Error inserting employee {employee['name']}: {response.text}")
            elif i % 50 == 0:  # Progress update every 50 employees
                print(f"Inserted {i+1}/{len(employees)} employees...")
                
        except Exception as e:
            print(f"Exception inserting employee {employee['name']}: {e}")
    
    print(f"✅ Successfully inserted {len(employees)} employees!")

def main():
    print("🚀 Generating 7-level employee hierarchy...")
    
    # Generate employee data
    employees = generate_employee_data()
    
    # Update manager relationships
    update_reports_and_managers(employees)
    
    # Show summary
    levels = {}
    for emp in employees:
        level = emp["level"]
        if level not in levels:
            levels[level] = []
        levels[level].append(emp["name"])
    
    print("\n📊 Employee Distribution by Level:")
    total = 0
    for level in sorted(levels.keys()):
        count = len(levels[level])
        total += count
        print(f"  Level {level}: {count} employees")
    print(f"  Total: {total} employees")
    
    # Insert into Elasticsearch
    insert_employees_to_elasticsearch(employees)
    
    print("\n✅ Employee hierarchy creation completed!")
    print("🔍 You can now test the hierarchy with any employee ID using:")
    print("   curl 'http://localhost:8000/api/v1/employees/{employee_id}/hierarchy'")

if __name__ == "__main__":
    main()
