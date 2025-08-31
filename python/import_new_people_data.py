#!/usr/bin/env python3
"""
Script to import the generated people data from new_people_data_generated.json
into a new Elasticsearch index named 'new_people'.
"""

import json
import os
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

# Configuration
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_FILE = os.path.join(PROJECT_ROOT, "new_people_data_generated.json")
ES_HOST = "http://localhost:9200"
INDEX_NAME = "new_people"

# Elasticsearch index mapping
INDEX_MAPPING = {
    "properties": {
        "lastName": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "country": {"type": "keyword"},
        "userImageUrl": {"type": "keyword", "index": False},
        "contactNos": {"type": "keyword"},
        "city": {"type": "keyword"},
        "lanIds": {"type": "keyword"},
        "screenName": {"type": "keyword"},
        "title": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "divisions": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "uid": {"type": "keyword"},
        "emailAddress": {"type": "keyword"},
        "designations": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "modified": {"type": "date", "format": "yyyyMMddHHmmss"},
        "departments": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "landLineNo": {"type": "keyword"},
        "fullName": {
            "type": "text",
            "fields": {
                "keyword": {"type": "keyword"},
                "suggest": {"type": "completion"}
            }
        },
        "employeeId": {"type": "keyword"},
        "firstName": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "companyId": {"type": "keyword"},
        "profileUrl": {"type": "keyword", "index": False},
        "managerEmailId": {"type": "keyword"},
        "managerEmpId": {"type": "keyword"}
    }
}

def create_es_client():
    """Create and return an Elasticsearch client."""
    print(f"Connecting to Elasticsearch at {ES_HOST}...")
    try:
        client = Elasticsearch(hosts=[ES_HOST], request_timeout=30)
        if not client.ping():
            raise ConnectionError("Could not connect to Elasticsearch.")
        print("✅ Successfully connected to Elasticsearch.")
        return client
    except Exception as e:
        print(f"❌ Error connecting to Elasticsearch: {e}")
        exit(1)

def load_data(file_path):
    """Load employee data from the JSON file."""
    print(f"Loading data from {file_path}...")
    if not os.path.exists(file_path):
        print(f"❌ Error: Data file not found at {file_path}")
        print("Please run './manage.sh generate-new-data' first.")
        exit(1)
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_actions(employees, index_name):
    """Yield documents for bulk indexing."""
    for emp in employees:
        yield {
            "_index": index_name,
            "_id": emp["employeeId"],
            "_source": emp
        }

def main():
    """Main function to run the import process."""
    es_client = create_es_client()
    employees = load_data(DATA_FILE)

    print(f"Setting up index '{INDEX_NAME}'...")

    if es_client.indices.exists(index=INDEX_NAME):
        print(f"Index '{INDEX_NAME}' already exists. Deleting it.")
        es_client.indices.delete(index=INDEX_NAME)

    print(f"Creating index '{INDEX_NAME}' with mapping.")
    es_client.indices.create(index=INDEX_NAME, mappings=INDEX_MAPPING)

    print(f"Indexing {len(employees)} documents into '{INDEX_NAME}'...")
    try:
        success, failed = bulk(es_client, generate_actions(employees, INDEX_NAME), raise_on_error=False)
        print(f"✅ Successfully indexed {success} documents.")
        if failed:
            print(f"❌ Failed to index {len(failed)} documents.")
    except Exception as e:
        print(f"❌ An error occurred during bulk indexing: {e}")
        exit(1)

    print(f"\n🎉 All done! Data from '{os.path.basename(DATA_FILE)}' has been imported into the '{INDEX_NAME}' index.")

if __name__ == "__main__":
    main()