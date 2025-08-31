#!/usr/bin/env python3
"""
Script to generate sample data for 30 employees with 5 levels.
The output is a JSON file named new_people_data_generated.json.
"""

import json
from datetime import datetime
import random
import os

# Configuration
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "new_people_data_generated.json")

# Source data for 30 employees across 5 levels
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
    """Create a standardized employee record based on the new schema."""
    full_name = emp_data["name"]
    name_parts = full_name.split(" ")
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
    
    screen_name = f"{first_name.lower()}{last_name.lower().replace(' ', '')}"
    email = f"{screen_name}@abc.com"
    
    city, _ = emp_data["location"].split(", ")
    country = "Singapore"  # To match the desired output format
    
    # Use a base employee ID and add the generated ID to it to get a realistic number
    base_employee_id = 537000
    employee_id = base_employee_id + emp_id
    
    return {
        "lastName": last_name,
        "country": country,
        "userImageUrl": "https://go.myabc.net/documents/367451/17907701/default_profile_image/23f8e646-93db-a25f-9991-5361c2b4d937",
        "contactNos": f"{random.randint(80000000, 99999999)}",
        "city": city,
        "lanIds": f"{first_name[0].upper()}{last_name[0].upper() if last_name else ''}{random.randint(100,999)}",
        "screenName": screen_name,
        "title": full_name,
        "divisions": emp_data["dept"],
        "uid": f"com.abc.myabc.service.hris.model.Emp_Info_PORTLET_{employee_id}",
        "emailAddress": email,
        "designations": emp_data["title"],
        "modified": datetime.now().strftime("%Y%m%d%H%M%S"),
        "departments": f"{emp_data['dept']} Department",
        "landLineNo": f"6682{random.randint(1000, 9999)}",
        "fullName": full_name,
        "employeeId": str(employee_id),
        "firstName": first_name,
        "companyId": "20100",
        "profileUrl": f"https://go.myabc.net/web/myabc/profile?onexyzId={screen_name}",
        "managerEmailId": None,
        "managerEmpId": str(base_employee_id + int(emp_data["manager_id"])) if emp_data["manager_id"] else None,
    }

def update_manager_relationships(employees):
    """Update manager email addresses for all employees."""
    emp_dict = {emp["employeeId"]: emp for emp in employees}
    
    for emp in employees:
        if emp["managerEmpId"] and emp["managerEmpId"] in emp_dict:
            manager = emp_dict[emp["managerEmpId"]]
            emp["managerEmailId"] = manager["emailAddress"]

def generate_and_save_data():
    """Generate employee data and save it to a JSON file."""
    print("🚀 Generating 5-Level Employee Hierarchy (30 Employees) with the requested schema")
    
    # Create employee records
    employees = []
    for i, emp_data in enumerate(EMPLOYEE_DATA, 1):
        employee = create_employee_record(emp_data, i)
        employees.append(employee)
    
    # Update manager relationships
    update_manager_relationships(employees)
    
    # Save to JSON file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(employees, f, indent=4, ensure_ascii=False)
    
    print(f"\n✅ Successfully generated and saved data to: {OUTPUT_FILE}")
    print(f"📈 Total: {len(employees)} employees across 5 levels (0-4)")

def main():
    """Main function to run the script."""
    generate_and_save_data()

if __name__ == "__main__":
    main()