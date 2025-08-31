
import json
import os

def generate_hierarchy(employee_name):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    with open(os.path.join(project_root, 'new_people_data_generated.json'), 'r') as f:
        employees = json.load(f)

    employees_by_id = {emp['employeeId']: emp for emp in employees}
    
    selected_employee = None
    for emp in employees:
        if emp['fullName'] == employee_name:
            selected_employee = emp
            break

    if not selected_employee:
        print(f"Employee '{employee_name}' not found.")
        return

    path_to_ceo = []
    current_employee = selected_employee
    while current_employee:
        path_to_ceo.append(current_employee)
        manager_id = current_employee.get('managerEmpId')
        if manager_id:
            current_employee = employees_by_id.get(manager_id)
        else:
            current_employee = None
    
    path_to_ceo.reverse()

    def build_node(employee, reports=[]):
        return {
            "id": employee['employeeId'],
            "name": employee['fullName'],
            "title": employee['designations'],
            "is_target": employee['employeeId'] == selected_employee['employeeId'],
            "reports": reports
        }

    def get_all_reports(employee_id):
        reports = []
        for emp in employees:
            if emp.get('managerEmpId') == employee_id:
                reports.append(emp)
        return reports

    def build_hierarchy_tree(path):
        if not path:
            return None
        
        employee = path[0]
        remaining_path = path[1:]
        
        all_reports = get_all_reports(employee['employeeId'])
        report_nodes = []

        for report in all_reports:
            if remaining_path and report['employeeId'] == remaining_path[0]['employeeId']:
                report_nodes.append(build_hierarchy_tree(remaining_path))
            else:
                # Add other reports as simple nodes without their own reports
                report_nodes.append(build_node(report, []))

        # Special handling for the selected employee to ensure their reports are included
        if employee['employeeId'] == selected_employee['employeeId']:
            selected_employee_reports = get_all_reports(selected_employee['employeeId'])
            report_nodes = [build_node(r, []) for r in selected_employee_reports]

        return build_node(employee, report_nodes)

    hierarchy_tree = build_hierarchy_tree(path_to_ceo)
    
    final_hierarchy = {
        "employee": {
            "id": selected_employee['employeeId'],
            "name": selected_employee['fullName'],
            "title": selected_employee['designations']
        },
        "hierarchy_tree": hierarchy_tree
    }

    output_path = os.path.join(project_root, 'src', 'data', 'hierarchy.json')
    with open(output_path, 'w') as f:
        json.dump(final_hierarchy, f, indent=2)

    print(f"Hierarchy for {employee_name} generated in {output_path}")

if __name__ == '__main__':
    generate_hierarchy('James Wilson')
