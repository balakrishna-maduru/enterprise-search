#!/usr/bin/env python3
"""
Elasticsearch Setup Script for Employee Hierarchy Index
"""

import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class HierarchyIndexSetup:
    def __init__(self):
        """Initialize the Elasticsearch connection using environment variables."""
        self.config = self._load_config()
        self.es = self._create_elasticsearch_client()
        self.index_name = "employee_hierarchy"

    def _load_config(self):
        """Load configuration from environment variables."""
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
            'force_recreate': os.getenv('FORCE_RECREATE', 'false').lower() == 'true',
        }
        return config

    def _create_elasticsearch_client(self):
        """Create Elasticsearch client with configuration from environment variables."""
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

    def test_connection(self):
        """Test the Elasticsearch connection."""
        try:
            if not self.es.ping():
                print("❌ Cannot ping Elasticsearch cluster")
                return False
            
            info = self.es.info()
            print(f"✅ Connected to Elasticsearch {info['version']['number']}")
            print(f"   Cluster: {info['cluster_name']}")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    def get_index_mapping(self):
        """Get the index mapping for the employee hierarchy."""
        return {
            "mappings": {
                "properties": {
                    "employeeId": {"type": "keyword"},
                    "fullName": {"type": "text"},
                    "designations": {"type": "text"},
                    "departments": {"type": "keyword"},
                    "emailAddress": {"type": "keyword"},
                    "managerEmpId": {"type": "keyword"},
                    "reports": {"type": "keyword"}
                }
            }
        }

    def create_index(self):
        """Create the Elasticsearch index for employee hierarchy."""
        mapping = self.get_index_mapping()
        
        if self.es.indices.exists(index=self.index_name):
            if self.config['force_recreate']:
                print(f"🗑️ Force recreate enabled - deleting existing index: {self.index_name}")
                self.es.indices.delete(index=self.index_name)
            else:
                print(f"ℹ️ Index '{self.index_name}' already exists. Use FORCE_RECREATE=true to recreate.")
                return True
        
        try:
            self.es.indices.create(index=self.index_name, body=mapping)
            print(f"✅ Created index: {self.index_name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create index: {e}")
            return False

def main():
    """Main function to set up the hierarchy index."""
    print("Employee Hierarchy Index Setup")
    print("=" * 50)
    
    setup = HierarchyIndexSetup()
    
    if not setup.test_connection():
        print("\n❌ Cannot connect to Elasticsearch. Please check your .env configuration.")
        return
        
    setup.create_index()
    
    print("\n" + "=" * 50)
    print("✅ Hierarchy index setup completed!")

if __name__ == "__main__":
    main()
