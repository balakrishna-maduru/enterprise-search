import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

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

connection_params = {}
if config['cloud_id']:
    connection_params['cloud_id'] = config['cloud_id']
else:
    connection_params['hosts'] = [
        f"{config['scheme']}://{config['host']}:{config['port']}"
    ]
if config['api_key']:
    connection_params['api_key'] = config['api_key']
elif config['username'] and config['password']:
    connection_params['basic_auth'] = (config['username'], config['password'])
if config['use_ssl']:
    connection_params['use_ssl'] = True
    connection_params['verify_certs'] = config['verify_certs']
    if config['ca_certs']:
        connection_params['ca_certs'] = config['ca_certs']
connection_params['request_timeout'] = 30
es = Elasticsearch(**connection_params)

index_name = "employee_hierarchy"

if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)
    print(f"Index '{index_name}' deleted successfully.")
else:
    print(f"Index '{index_name}' does not exist.")
