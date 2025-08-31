#!/usr/bin/env python3
"""
Script to populate the employee_hierarchy index.
"""

import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

class HierarchyPopulator:
    def __init__(self):
        self.config = self._load_config()
        self.es = self._create_elasticsearch_client()
        self.source_index = "new_people"
        self.target_index = "employee_hierarchy"

    def _load_config(self):
        config = {
            'host': os.getenv('ELASTIC_HOST', 'localhost'),
            'port': int(os.getenv('ELASTIC_PORT', '9200')),
            'scheme': os.getenv('ELASTIC_SCHEME', 'http'),
            'username': os.getenv('ELASTIC_USERNAME'),
            'password': os.getenv('ELASTIC_PASSWORD'),
            'api_key': os.getenv('ELASTIC_API_KEY'),
            'cloud_id': os.getenv('ELASTIC_CLOUD_ID'),
            'use_ssl': os.getenv('ELASTIC_USE_SSL', 'false').lower() == 'true',
            'verify_certs': os.getenv('ELASTIC_VERIFY_CERTS', 'false').lower() == 'true',
            'ca_certs': os.getenv('ELASTIC_CA_CERTS'),
        }
        return config

    def _create_elasticsearch_client(self):
        connection_params = {}
        if self.config['cloud_id']:
            connection_params['cloud_id'] = self.config['cloud_id']
        else:
            connection_params['hosts'] = [
                f"{self.config['scheme']}://{self.config['host']}:{self.config['port']}"
            ]
        if self.config['api_key']:
            connection_params['api_key'] = self.config['api_key']
        elif self.config['username'] and self.config['password']:
            connection_params['basic_auth'] = (self.config['username'], self.config['password'])
        if self.config['use_ssl']:
            connection_params['use_ssl'] = True
            connection_params['verify_certs'] = self.config['verify_certs']
            if self.config['ca_certs']:
                connection_params['ca_certs'] = self.config['ca_certs']
        connection_params['request_timeout'] = 30
        return Elasticsearch(**connection_params)

    def get_all_employees(self):
        """Get all employees from the source index using a scrolling search."""
        try:
            resp = self.es.search(
                index=self.source_index,
                body={"query": {"match_all": {}}},
                scroll="2m",
                size=1000
            )
            scroll_id = resp['_scroll_id']
            sid = scroll_id
            scroll_size = len(resp['hits']['hits'])

            employees = resp['hits']['hits']

            while scroll_size > 0:
                resp = self.es.scroll(scroll_id=sid, scroll="2m")
                sid = resp['_scroll_id']
                scroll_size = len(resp['hits']['hits'])
                employees.extend(resp['hits']['hits'])

            return [e['_source'] for e in employees]
        except Exception as e:
            print(f"Error fetching employees: {e}")
            return []

    def build_hierarchy_for_employee(self, employee):
        """Builds the hierarchy for a single employee."""
        management_chain_docs = []
        current_emp = employee
        for _ in range(20):  # Max 20 levels
            management_chain_docs.append(current_emp)
            manager_id = current_emp.get('managerEmpId')
            if not manager_id or str(manager_id) == 'null' or str(manager_id) == '':
                break
            manager_result = self.es.search(
                index=self.source_index,
                query={"term": {"employeeId": str(manager_id)}},
                size=1
            )
            if manager_result['hits']['total']['value'] > 0:
                current_emp = manager_result['hits']['hits'][0]['_source']
            else:
                break
        management_chain_docs.reverse()

        reports_result = self.es.search(
            index=self.source_index,
            query={"term": {"managerEmpId": employee["employeeId"]}},
            size=1000,
            _source=["employeeId", "fullName", "designations", "departments", "emailAddress"]
        )
        direct_reports = [hit['_source'] for hit in reports_result['hits']['hits']]

        def format_node(emp_data, level, is_target=False, reports=[]):
            return {
                "id": str(emp_data.get('employeeId')),
                "name": emp_data.get('fullName', 'Unknown'),
                "title": emp_data.get('designations', 'Unknown Title'),
                "department": emp_data.get('departments', 'Unknown Department'),
                "email": emp_data.get('emailAddress', f"{emp_data.get('fullName', 'unknown').lower().replace(' ', '.')}@company.com"),
                "level": level,
                "is_target": is_target,
                "reports": reports
            }

        target_employee_level = len(management_chain_docs) - 1
        direct_reports_nodes = [format_node(report, target_employee_level + 1) for report in direct_reports]
        hierarchy_tree = format_node(management_chain_docs[-1], target_employee_level, is_target=True, reports=direct_reports_nodes)

        for i in range(len(management_chain_docs) - 2, -1, -1):
            manager_data = management_chain_docs[i]
            hierarchy_tree = format_node(manager_data, i, is_target=False, reports=[hierarchy_tree])
        
        return hierarchy_tree

    def populate_hierarchy(self):
        """Populates the hierarchy index."""
        employees = self.get_all_employees()
        if not employees:
            print("No employees found to process.")
            return

        print(f"Found {len(employees)} employees. Starting hierarchy population...")

        for i, employee in enumerate(employees):
            employee_id = employee.get("employeeId")
            if not employee_id:
                continue

            print(f"({i+1}/{len(employees)}) Processing employee: {employee.get('fullName')} ({employee_id})")

            hierarchy_tree = self.build_hierarchy_for_employee(employee)

            doc = {
                "employee_id": employee_id,
                "hierarchy": hierarchy_tree,
                "created_at": datetime.utcnow()
            }

            try:
                self.es.index(index=self.target_index, id=employee_id, document=doc)
            except Exception as e:
                print(f"Error indexing hierarchy for employee {employee_id}: {e}")

        print("\n✅ Hierarchy population completed!")

def main():
    print("Populating Employee Hierarchy Index")
    print("=" * 50)
    populator = HierarchyPopulator()
    populator.populate_hierarchy()

if __name__ == "__main__":
    main()
