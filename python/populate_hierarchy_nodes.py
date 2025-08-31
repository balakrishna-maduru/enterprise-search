#!/usr/bin/env python3
"""
Script to populate the employee_hierarchy index with individual employee nodes.
This script is designed to handle a large number of employees by processing them
in streams and batches, keeping memory usage low.
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
        connection_params['request_timeout'] = 60
        return Elasticsearch(**connection_params)

    def populate_nodes(self):
        """
        Populates the hierarchy index by streaming employees, building hierarchy maps,
        and then streaming again to generate and index the final documents in batches.
        """
        print("Starting hierarchy population process...")

        # Pass 1: Build hierarchy relationship maps in memory.
        print("Pass 1: Building manager and report relationship maps...")
        reports_map = defaultdict(list)
        employee_to_manager_map = {}
        
        employee_count = 0
        try:
            query = {
                "query": {"match_all": {}},
                "_source": ["employeeId", "managerEmpId"]
            }
            for emp in helpers.scan(self.es, index=self.source_index, query=query):
                employee_count += 1
                emp_source = emp['_source']
                employee_id = emp_source.get('employeeId')
                manager_id = emp_source.get('managerEmpId')

                if not employee_id:
                    continue

                employee_id_str = str(employee_id)
                manager_id_str = str(manager_id) if manager_id and str(manager_id) != 'null' else None

                employee_to_manager_map[employee_id_str] = manager_id_str
                
                if manager_id_str:
                    reports_map[manager_id_str].append(employee_id_str)
                
                if employee_count % 10000 == 0:
                    print(f"  ...processed {employee_count} employees for map building")

            print(f"Pass 1 complete. Processed {employee_count} employees.")
            if employee_count == 0:
                print("No employees found to process.")
                return

        except Exception as e:
            print(f"Error during Pass 1 (building maps): {e}")
            return

        print("\nPass 2: Generating and indexing hierarchy documents...")
        
        def generate_actions():
            processed_count = 0
            for emp in helpers.scan(self.es, index=self.source_index, query={"query": {"match_all": {}}}):
                processed_count += 1
                if processed_count % 10000 == 0:
                    print(f"  ...prepared {processed_count} documents for indexing")

                emp_source = emp['_source']
                employee_id = emp_source.get("employeeId")
                if not employee_id:
                    continue

                management_chain_ids = []
                current_emp_id = str(employee_id)
                for _ in range(50):
                    if current_emp_id and current_emp_id != 'None':
                        if current_emp_id in management_chain_ids:
                            print(f"Warning: Cycle detected for employee {employee_id} at manager {current_emp_id}. Breaking chain.")
                            break
                        
                        management_chain_ids.append(current_emp_id)
                        manager_id = employee_to_manager_map.get(current_emp_id)
                        
                        if not manager_id:
                            break 
                        
                        current_emp_id = manager_id
                    else:
                        break
                
                management_chain_ids.reverse()

                yield {
                    "_index": self.target_index,
                    "_id": employee_id,
                    "_source": {
                        **emp_source,
                        "reports": reports_map.get(str(employee_id), []),
                        "management_chain_ids": management_chain_ids,
                    }
                }
        
        print(f"Starting bulk indexing of {employee_count} documents...")
        try:
            success, errors = helpers.bulk(
                self.es, 
                generate_actions(), 
                chunk_size=500, 
                raise_on_error=False,
                max_retries=3,
                initial_backoff=2,
                max_backoff=60
            )
            
            print(f"\nBulk indexing complete. Success: {success}, Failures: {len(errors)}")

            if errors:
                print("First 5 errors encountered:")
                for i, error in enumerate(errors[:5]):
                    print(f"  {i+1}: {error}")
            
            print("\n✅ Hierarchy node population completed!")

        except Exception as e:
            print(f"An unrecoverable error occurred during bulk indexing: {e}")

def main():
    print("Populating Employee Hierarchy Nodes")
    print("=" * 50)
    populator = HierarchyNodePopulator()
    populator.populate_nodes()

if __name__ == "__main__":
    main()
