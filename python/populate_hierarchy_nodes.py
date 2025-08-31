#!/usr/bin/env python3
"""
Script to populate the employee_hierarchy index with individual employee nodes.
"""

import os
from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
from collections import defaultdict

# Load environment variables
load_dotenv()

class HierarchyNodePopulator:
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

    def populate_nodes(self):
        """Populates the hierarchy index with employee nodes."""
        employees = self.get_all_employees()
        if not employees:
            print("No employees found to process.")
            return

        print(f"Found {len(employees)} employees. Preparing documents...")

        # Create a map for quick lookup of employees by their ID
        employee_by_id = {emp.get('employeeId'): emp for emp in employees if emp.get('employeeId')}

        reports_map = defaultdict(list)
        for emp in employees:
            manager_id = emp.get('managerEmpId')
            if manager_id:
                reports_map[str(manager_id)].append(emp['employeeId'])

        actions = []
        for emp in employees:
            employee_id = emp.get("employeeId")
            if not employee_id:
                continue

            # Build the management chain IDs
            management_chain_ids = []
            current_emp_id = employee_id
            # Traverse upwards until no manager is found or a cycle is detected (max 50 levels for safety)
            for _ in range(50):
                if current_emp_id not in employee_by_id:
                    break # Employee not found in our dataset
                
                current_emp_data = employee_by_id[current_emp_id]
                management_chain_ids.append(str(current_emp_id)) # Add current employee to their own chain

                manager_id = current_emp_data.get('managerEmpId')
                if not manager_id or str(manager_id) == 'null' or str(manager_id) == '':
                    break # No manager, reached the top

                # Check for cycles to prevent infinite loops
                if str(manager_id) in management_chain_ids:
                    print(f"Warning: Cycle detected for employee {employee_id} at manager {manager_id}. Breaking chain traversal.")
                    break
                
                current_emp_id = str(manager_id)
            
            # The chain is built from employee up to CEO, so reverse it for CEO to employee order
            management_chain_ids.reverse()

            doc = {
                "_index": self.target_index,
                "_id": employee_id,
                "_source": {
                    **emp,
                    "reports": reports_map.get(employee_id, []),
                    "management_chain_ids": management_chain_ids # New field
                }
            }
            actions.append(doc)

        print(f"Bulk indexing {len(actions)} documents...")
        try:
            helpers.bulk(self.es, actions)
            print("\n✅ Hierarchy node population completed!")
        except Exception as e:
            print(f"Error during bulk indexing: {e}")

def main():
    print("Populating Employee Hierarchy Nodes")
    print("=" * 50)
    populator = HierarchyNodePopulator()
    populator.populate_nodes()

if __name__ == "__main__":
    main()