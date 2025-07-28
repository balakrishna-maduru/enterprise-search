#!/usr/bin/env python3
"""
Elasticsearch Setup Script for Enterprise Search
Creates index mappings and search application configuration
"""

import json
import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ElasticsearchSetup:
    def __init__(self):
        """Initialize the Elasticsearch connection using environment variables."""
        self.config = self._load_config()
        self.es = self._create_elasticsearch_client()
        self.index_name = self.config['index']

    def _load_config(self):
        """Load configuration from environment variables."""
        config = {
            'host': os.getenv('ELASTIC_HOST', 'localhost'),
            'port': int(os.getenv('ELASTIC_PORT', '9200')),
            'scheme': os.getenv('ELASTIC_SCHEME', 'http'),
            'index': os.getenv('ELASTIC_INDEX', 'enterprise_documents'),
            'username': os.getenv('ELASTIC_USERNAME'),
            'password': os.getenv('ELASTIC_PASSWORD'),
            'api_key': os.getenv('ELASTIC_API_KEY'),
            'cloud_id': os.getenv('ELASTIC_CLOUD_ID'),
            'use_ssl': os.getenv('ELASTIC_USE_SSL', 'false').lower() == 'true',
            'verify_certs': os.getenv('ELASTIC_VERIFY_CERTS', 'false').lower() == 'true',
            'ca_certs': os.getenv('ELASTIC_CA_CERTS'),
            'search_app_name': os.getenv('SEARCH_APP_NAME', 'enterprise-search'),
            'debug': os.getenv('DEBUG', 'false').lower() == 'true',
            'force_recreate': os.getenv('FORCE_RECREATE', 'false').lower() == 'true',
            # Semantic search configuration
            'semantic_enabled': os.getenv('SEMANTIC_ENABLED', 'true').lower() == 'true',
            'semantic_model': os.getenv('SEMANTIC_MODEL', '.multilingual-e5-small'),
            'semantic_field_prefix': os.getenv('SEMANTIC_FIELD_PREFIX', 'semantic_'),
            'hybrid_weight': float(os.getenv('HYBRID_WEIGHT', '0.7')),
            'deploy_model': os.getenv('DEPLOY_MODEL', 'true').lower() == 'true'
        }
        
        if config['debug']:
            print("Configuration loaded:")
            for key, value in config.items():
                if 'password' in key.lower() or 'api_key' in key.lower():
                    print(f"  {key}: {'*' * len(str(value)) if value else 'Not set'}")
                else:
                    print(f"  {key}: {value}")
        
        return config

    def _create_elasticsearch_client(self):
        """Create Elasticsearch client with configuration from environment variables."""
        connection_params = {}
        
        # Basic connection
        if self.config['cloud_id']:
            connection_params['cloud_id'] = self.config['cloud_id']
        else:
            connection_params['hosts'] = [
                f"{self.config['scheme']}://{self.config['host']}:{self.config['port']}"
            ]
        
        # Authentication
        if self.config['api_key']:
            connection_params['api_key'] = self.config['api_key']
        elif self.config['username'] and self.config['password']:
            connection_params['basic_auth'] = (self.config['username'], self.config['password'])
        
        # SSL Configuration
        if self.config['use_ssl']:
            connection_params['use_ssl'] = True
            connection_params['verify_certs'] = self.config['verify_certs']
            if self.config['ca_certs']:
                connection_params['ca_certs'] = self.config['ca_certs']
        
        connection_params['request_timeout'] = 30
        
        if self.config['debug']:
            print(f"Connecting to Elasticsearch with params: {connection_params}")
        
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
            print("\nTroubleshooting tips:")
            print("1. Check if Elasticsearch is running")
            print("2. Verify ELASTIC_HOST and ELASTIC_PORT in .env file")
            print("3. Check authentication credentials if using security")
            print("4. Ensure network connectivity")
            return False

    def get_index_mapping(self):
        """Get the complete index mapping for enterprise search."""
        mapping = {
            "mappings": {
                "properties": {
                    "title": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "content": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "summary": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "source": {
                        "type": "keyword"
                    },
                    "author": {
                        "type": "keyword"
                    },
                    "department": {
                        "type": "keyword"
                    },
                    "content_type": {
                        "type": "keyword"
                    },
                    "tags": {
                        "type": "keyword"
                    },
                    "timestamp": {
                        "type": "date"
                    },
                    "url": {
                        "type": "keyword",
                        "index": False
                    },
                    # Ratings functionality
                    "ratings": {
                        "properties": {
                            "positive_count": {
                                "type": "integer"
                            },
                            "negative_count": {
                                "type": "integer"
                            },
                            "total_ratings": {
                                "type": "integer"
                            },
                            "score": {
                                "type": "float"
                            },
                            "last_updated": {
                                "type": "date"
                            }
                        }
                    },
                    "user_ratings": {
                        "type": "nested",
                        "properties": {
                            "user_id": {
                                "type": "keyword"
                            },
                            "rating": {
                                "type": "integer"
                            },
                            "timestamp": {
                                "type": "date"
                            },
                            "query": {
                                "type": "text",
                                "index": False
                            }
                        }
                    },
                    # Additional fields for different content types
                    "priority": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "project": {
                        "type": "keyword"
                    },
                    "space": {
                        "type": "keyword"
                    },
                    "site": {
                        "type": "keyword"
                    }
                }
            },
            "settings": {
                "index": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                },
                "analysis": {
                    "analyzer": {
                        "standard": {
                            "type": "standard",
                            "stopwords": "_english_"
                        }
                    }
                }
            }
        }
        
        # Add semantic_text fields if semantic search is enabled
        if self.config['semantic_enabled']:
            prefix = self.config['semantic_field_prefix']
            model_id = self.config['semantic_model']
            
            semantic_fields = {
                f"{prefix}title": {
                    "type": "semantic_text",
                    "inference_id": model_id
                },
                f"{prefix}content": {
                    "type": "semantic_text",
                    "inference_id": model_id
                },
                f"{prefix}summary": {
                    "type": "semantic_text",
                    "inference_id": model_id
                }
            }
            
            mapping["mappings"]["properties"].update(semantic_fields)
        
        return mapping

    def deploy_semantic_model(self):
        """Deploy the E5 semantic model for semantic_text functionality."""
        if not self.config['semantic_enabled'] or not self.config['deploy_model']:
            return True
        
        model_id = self.config['semantic_model']
        
        try:
            # Check if model already exists
            try:
                model_info = self.es.ml.get_trained_models(model_id=model_id)
                print(f"✅ Model '{model_id}' already exists")
                return True
            except Exception:
                pass
            
            # For built-in models like .multilingual-e5-small, we need to deploy via inference API
            print(f"🤖 Deploying semantic model: {model_id}")
            
            # Deploy the model using inference API
            inference_config = {
                "service": "elasticsearch",
                "service_settings": {
                    "model_id": model_id,
                    "dimensions": 384  # E5 small model dimensions
                }
            }
            
            try:
                response = self.es.inference.put_model(
                    inference_id=model_id,
                    body=inference_config
                )
                print(f"✅ Successfully deployed semantic model: {model_id}")
                return True
            except Exception as e:
                # If inference API fails, try ML API for built-in models
                print(f"⚠️  Inference API failed, trying ML API: {e}")
                
                try:
                    # For built-in models, they might already be available
                    model_info = self.es.ml.get_trained_models(model_id=model_id)
                    print(f"✅ Built-in model '{model_id}' is available")
                    return True
                except Exception as ml_error:
                    print(f"❌ Failed to deploy model via ML API: {ml_error}")
                    print(f"   Note: For built-in models, ensure your cluster has appropriate license")
                    print(f"   Alternative: Use a custom model deployment or disable semantic search")
                    return False
                    
        except Exception as e:
            print(f"❌ Failed to deploy semantic model: {e}")
            print(f"   You can disable semantic search by setting SEMANTIC_ENABLED=false")
            return False

    def create_index(self):
        """Create the Elasticsearch index with complete mappings."""
        mapping = self.get_index_mapping()
        
        # Check if index exists
        if self.es.indices.exists(index=self.index_name):
            if self.config['force_recreate']:
                print(f"🗑️  Force recreate enabled - deleting existing index: {self.index_name}")
                self.es.indices.delete(index=self.index_name)
            else:
                print(f"ℹ️  Index '{self.index_name}' already exists")
                
                # Check if we should update mapping
                try:
                    current_mapping = self.es.indices.get_mapping(index=self.index_name)
                    print(f"✅ Index mapping exists. Use FORCE_RECREATE=true to recreate.")
                    return True
                except Exception as e:
                    print(f"⚠️  Could not retrieve current mapping: {e}")
                    return False
        
        # Create new index
        try:
            self.es.indices.create(index=self.index_name, body=mapping)
            print(f"✅ Created index: {self.index_name} with complete mappings")
            
            # Verify the index was created
            index_info = self.es.indices.get(index=self.index_name)
            field_count = len(index_info[self.index_name]['mappings']['properties'])
            print(f"   Index created with {field_count} mapped fields")
            
            return True
        except Exception as e:
            print(f"❌ Failed to create index: {e}")
            return False

    def get_search_application_config(self):
        """Get the search application configuration."""
        # Build query clauses
        should_clauses = []
        highlight_fields = {
            "title": {},
            "content": {},
            "summary": {}
        }
        
        # Add semantic search clauses if enabled
        if self.config['semantic_enabled']:
            prefix = self.config['semantic_field_prefix']
            semantic_weight = self.config['hybrid_weight']
            
            should_clauses.extend([
                {
                    "semantic": {
                        "field": f"{prefix}title",
                        "query": "{{query_string}}",
                        "boost": semantic_weight * 1.5
                    }
                },
                {
                    "semantic": {
                        "field": f"{prefix}content",
                        "query": "{{query_string}}",
                        "boost": semantic_weight
                    }
                },
                {
                    "semantic": {
                        "field": f"{prefix}summary",
                        "query": "{{query_string}}",
                        "boost": semantic_weight * 1.2
                    }
                }
            ])
            
            # Add semantic fields to highlighting
            highlight_fields.update({
                f"{prefix}title": {},
                f"{prefix}content": {},
                f"{prefix}summary": {}
            })
        
        # Add traditional lexical search
        lexical_weight = 1.0 - (self.config['hybrid_weight'] if self.config['semantic_enabled'] else 0.0)
        should_clauses.append({
            "multi_match": {
                "query": "{{query_string}}",
                "fields": ["title^3", "content^2", "summary^2", "tags^1.5"],
                "type": "best_fields",
                "fuzziness": "AUTO",
                "boost": lexical_weight
            }
        })
        
        config = {
            "indices": [self.index_name],
            "template": {
                "script": {
                    "source": {
                        "query": {
                            "bool": {
                                "should": should_clauses,
                                "minimum_should_match": 1,
                                "filter": [
                                    # Add department boost as filter
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "term": {
                                                        "department": "{{user_department}}"
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        "highlight": {
                            "fields": highlight_fields,
                            "pre_tags": ["<mark>"],
                            "post_tags": ["</mark>"]
                        },
                        "sort": [
                            {
                                "_score": {"order": "desc"}
                            },
                            {
                                "ratings.score": {
                                    "order": "desc",
                                    "missing": "_last"
                                }
                            }
                        ],
                        "size": "{{size}}",
                        "from": "{{from}}"
                    }
                }
            }
        }
        
        return config

    def create_search_application(self):
        """Create an Elasticsearch Search Application for the enterprise search."""
        app_name = self.config['search_app_name']
        search_app_config = self.get_search_application_config()
        
        try:
            # Check if search application already exists
            try:
                existing_app = self.es.search_application.get(name=app_name)
                print(f"🔍 Search Application '{app_name}' already exists")
                
                if self.config['force_recreate']:
                    print(f"🗑️  Force recreate enabled - deleting existing Search Application")
                    self.es.search_application.delete(name=app_name)
                else:
                    print(f"✅ Search Application '{app_name}' is ready to use")
                    return True
            except Exception:
                print(f"🔍 Creating new Search Application '{app_name}'...")
            
            # Create the search application
            response = self.es.search_application.put(name=app_name, body=search_app_config)
            print(f"✅ Search Application '{app_name}' created successfully")
            
            # Test the search application with a simple query
            test_params = {
                "query_string": "test",
                "size": 1,
                "from": 0,
                "user_department": "Digital Banking"
            }
            
            test_response = self.es.search_application.search(
                name=app_name,
                body={"params": test_params}
            )
            
            print(f"✅ Search Application test successful")
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Failed to create Search Application: {error_msg}")
            
            # Provide specific troubleshooting based on error type
            if "search_application" in error_msg.lower():
                print("   Note: Search Applications require Elasticsearch 8.8+ and appropriate license")
            elif "unauthorized" in error_msg.lower() or "forbidden" in error_msg.lower():
                print("   Note: Insufficient permissions to create Search Applications")
            elif "not found" in error_msg.lower():
                print("   Note: Search Applications API endpoint not available")
            else:
                print(f"   Detailed error: {error_msg}")
                
            print("   The application will still work with direct index searches")
            return False

    def export_mapping_to_file(self, filename="elasticsearch_mapping.json"):
        """Export the mapping configuration to a JSON file."""
        mapping = self.get_index_mapping()
        
        try:
            with open(filename, 'w') as f:
                json.dump(mapping, f, indent=2)
            print(f"✅ Mapping exported to {filename}")
        except Exception as e:
            print(f"❌ Failed to export mapping: {e}")

    def export_search_app_to_file(self, filename="search_application.json"):
        """Export the search application configuration to a JSON file."""
        config = self.get_search_application_config()
        
        try:
            with open(filename, 'w') as f:
                json.dump(config, f, indent=2)
            print(f"✅ Search Application config exported to {filename}")
        except Exception as e:
            print(f"❌ Failed to export search application config: {e}")

    def validate_setup(self):
        """Validate that the setup is working correctly."""
        print("\n🔍 Validating Elasticsearch setup...")
        
        validation_results = {
            'index_exists': False,
            'mapping_correct': False,
            'search_app_exists': False,
            'search_app_works': False
        }
        
        # Check index exists
        try:
            if self.es.indices.exists(index=self.index_name):
                validation_results['index_exists'] = True
                print(f"✅ Index '{self.index_name}' exists")
            else:
                print(f"❌ Index '{self.index_name}' does not exist")
        except Exception as e:
            print(f"❌ Could not check index existence: {e}")
        
        # Check mapping
        try:
            mapping = self.es.indices.get_mapping(index=self.index_name)
            properties = mapping[self.index_name]['mappings']['properties']
            
            required_fields = ['title', 'content', 'ratings', 'user_ratings']
            
            # Add semantic fields to validation if enabled
            if self.config['semantic_enabled']:
                prefix = self.config['semantic_field_prefix']
                semantic_required = [f"{prefix}title", f"{prefix}content", f"{prefix}summary"]
                required_fields.extend(semantic_required)
            
            missing_fields = [field for field in required_fields if field not in properties]
            
            if not missing_fields:
                validation_results['mapping_correct'] = True
                print(f"✅ Index mapping contains all required fields")
            else:
                print(f"❌ Missing required fields in mapping: {missing_fields}")
                
        except Exception as e:
            print(f"❌ Could not validate mapping: {e}")
        
        # Check search application
        try:
            app_name = self.config['search_app_name']
            app = self.es.search_application.get(name=app_name)
            validation_results['search_app_exists'] = True
            print(f"✅ Search Application '{app_name}' exists")
            
            # Test search application
            test_response = self.es.search_application.search(
                name=app_name,
                body={
                    "params": {
                        "query_string": "test",
                        "size": 1,
                        "from": 0,
                        "user_department": "Technology"
                    }
                }
            )
            validation_results['search_app_works'] = True
            print(f"✅ Search Application is working correctly")
            
        except Exception as e:
            print(f"⚠️  Search Application validation failed: {e}")
            print(f"   This is optional - direct index search will still work")
        
        # Summary
        total_checks = len(validation_results)
        passed_checks = sum(validation_results.values())
        
        print(f"\n📊 Validation Summary: {passed_checks}/{total_checks} checks passed")
        
        if validation_results['index_exists'] and validation_results['mapping_correct']:
            print("🎉 Essential setup is complete and ready for use!")
        else:
            print("⚠️  Essential setup is incomplete. Please review the errors above.")
        
        return validation_results

def main():
    """Main function to set up Elasticsearch for enterprise search."""
    print("Enterprise Search - Elasticsearch Setup")
    print("=" * 50)
    
    setup = ElasticsearchSetup()
    
    try:
        # Test connection
        if not setup.test_connection():
            print("\n❌ Cannot connect to Elasticsearch")
            print("\nPlease check your .env configuration:")
            print("Required variables:")
            print("ELASTIC_HOST=localhost")
            print("ELASTIC_PORT=9200")
            print("ELASTIC_SCHEME=http")
            print("ELASTIC_INDEX=enterprise_documents")
            print("SEARCH_APP_NAME=enterprise-search")
            print("\nOptional variables:")
            print("ELASTIC_API_KEY=your_api_key_here")
            print("ELASTIC_USERNAME=elastic")
            print("ELASTIC_PASSWORD=your_password_here")
            print("FORCE_RECREATE=true  # to recreate existing resources")
            print("DEBUG=true")
            return False
        
        # Deploy semantic model if enabled
        print("\n🤖 Setting up semantic search model...")
        model_deployed = setup.deploy_semantic_model()
        
        print("\n📄 Setting up index mappings...")
        index_created = setup.create_index()
        
        print("\n🔍 Setting up search application...")
        search_app_created = setup.create_search_application()
        
        print("\n📁 Exporting configurations...")
        setup.export_mapping_to_file()
        setup.export_search_app_to_file()
        
        # Validate setup
        validation_results = setup.validate_setup()
        
        print("\n" + "=" * 50)
        print("✅ Elasticsearch setup completed!")
        
        print("\n🎯 Next Steps:")
        print("1. Run the data generator script to populate with test data")
        print("2. Update your React app's .env file:")
        print(f"   REACT_APP_ELASTIC_ENDPOINT={setup.config['scheme']}://{setup.config['host']}:{setup.config['port']}")
        if setup.config['api_key']:
            print(f"   REACT_APP_ELASTIC_API_KEY={setup.config['api_key']}")
        print(f"   REACT_APP_SEARCH_APPLICATION_NAME={setup.config['search_app_name']}")
        print("   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here")
        
        # Add semantic search configuration
        if setup.config['semantic_enabled']:
            print("\n   # Semantic Search Configuration")
            print(f"   REACT_APP_SEMANTIC_ENABLED={str(setup.config['semantic_enabled']).lower()}")
            print(f"   REACT_APP_SEMANTIC_MODEL={setup.config['semantic_model']}")
            print(f"   REACT_APP_SEMANTIC_FIELD_PREFIX={setup.config['semantic_field_prefix']}")
            print(f"   REACT_APP_HYBRID_WEIGHT={setup.config['hybrid_weight']}")
        
        print("3. Start your React development server")
        
        return True
        
    except KeyboardInterrupt:
        print(f"\n\n⏹️  Setup cancelled by user")
        return False
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        if setup.config['debug']:
            import traceback
            traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)