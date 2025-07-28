#!/usr/bin/env python3
"""
Test Data Generator for Enterprise Search
Generates realistic test data for an existing Elasticsearch index
Requires elasticsearch_setup.py to be run first
"""

import json
import random
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from elasticsearch import Elasticsearch
from faker import Faker
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Faker for generating realistic data
fake = Faker()

class TestDataGenerator:
    def __init__(self):
        """Initialize the test data generator."""
        self.config = self._load_config()
        self.es = self._create_elasticsearch_client()
        self.index_name = self.config['index']
        
        # Enterprise data definitions
        self.departments = [
            'Digital Banking', 'Consumer Banking', 'Institutional Banking',
            'Technology & Operations', 'Risk Management', 'Human Resources',
            'Corporate Banking', 'Investment Banking', 'Compliance',
            'Marketing', 'Finance', 'Legal', 'Audit', 'Information Security',
            'Business Intelligence', 'Operations', 'Engineering'
        ]
        
        self.employees = [
            'Sarah Chen', 'Michael Wong', 'Jennifer Park', 'Alex Kumar',
            'Emma Thompson', 'David Lim', 'Rachel Tan', 'James Liu',
            'Lisa Zhang', 'Robert Singh', 'Maria Garcia', 'Kevin Ng',
            'Priya Sharma', 'Daniel Ho', 'Sophie Lee', 'Ryan Tay',
            'Jennifer Tan', 'David Wong', 'Lisa Kumar', 'Alex Thompson',
            'Mike Rodriguez'
        ]
        
        self.enterprise_topics = [
            'digital transformation', 'customer experience', 'risk assessment',
            'regulatory compliance', 'mobile applications', 'cybersecurity',
            'data analytics', 'artificial intelligence', 'blockchain',
            'payment systems', 'cloud migration', 'API integration',
            'fraud detection', 'customer onboarding', 'process automation',
            'business intelligence', 'data governance', 'system architecture',
            'database migration', 'security incident response', 'marketing analytics',
            'integration platform', 'microservices', 'container orchestration'
        ]

        # User IDs that match the frontend users
        self.user_ids = [
            'sarah_chen', 'mike_rodriguez', 'jennifer_tan', 'david_wong',
            'lisa_kumar', 'alex_thompson'
        ]

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
            'confluence_docs': int(os.getenv('CONFLUENCE_DOCS', '30')),
            'jira_tickets': int(os.getenv('JIRA_TICKETS', '25')),
            'sharepoint_docs': int(os.getenv('SHAREPOINT_DOCS', '20')),
            'create_ratings': os.getenv('CREATE_RATINGS', 'true').lower() == 'true',
            'clear_existing': os.getenv('CLEAR_EXISTING', 'false').lower() == 'true',
            'debug': os.getenv('DEBUG', 'false').lower() == 'true',
            # Semantic search configuration
            'semantic_enabled': os.getenv('SEMANTIC_ENABLED', 'true').lower() == 'true',
            'semantic_field_prefix': os.getenv('SEMANTIC_FIELD_PREFIX', 'semantic_')
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
        """Create Elasticsearch client."""
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

    def add_semantic_fields(self, doc):
        """Add semantic_text fields to a document if semantic search is enabled."""
        if not self.config['semantic_enabled']:
            return doc
            
        prefix = self.config['semantic_field_prefix']
        
        # Add semantic fields that mirror the regular text fields
        semantic_doc = doc.copy()
        semantic_doc.update({
            f"{prefix}title": doc.get('title', ''),
            f"{prefix}content": doc.get('content', ''),
            f"{prefix}summary": doc.get('summary', '')
        })
        
        return semantic_doc

    def validate_prerequisites(self):
        """Validate that Elasticsearch is ready and properly set up."""
        try:
            # Test connection
            if not self.es.ping():
                return False, "Cannot connect to Elasticsearch cluster"
            
            # Check if index exists
            if not self.es.indices.exists(index=self.index_name):
                return False, f"Index '{self.index_name}' does not exist. Run elasticsearch_setup.py first."
            
            # Verify mapping has required fields
            mapping = self.es.indices.get_mapping(index=self.index_name)
            properties = mapping[self.index_name]['mappings']['properties']
            required_fields = ['title', 'content', 'source', 'author', 'department', 'ratings', 'user_ratings']
            
            # Add semantic fields to validation if enabled
            if self.config['semantic_enabled']:
                prefix = self.config['semantic_field_prefix']
                semantic_required = [f"{prefix}title", f"{prefix}content", f"{prefix}summary"]
                required_fields.extend(semantic_required)
            
            missing_fields = [field for field in required_fields if field not in properties]
            
            if missing_fields:
                return False, f"Index mapping is missing required fields: {missing_fields}. Run elasticsearch_setup.py to create proper mappings."
            
            # Get current document count
            doc_count = self.es.count(index=self.index_name)['count']
            
            return True, f"Index is ready with {doc_count} existing documents"
            
        except Exception as e:
            return False, f"Validation error: {e}"

    def generate_ratings_data(self):
        """Generate realistic ratings data for a document."""
        if not self.config['create_ratings'] or random.random() > 0.4:
            return None
        
        user_ratings = []
        num_ratings = random.randint(1, 5)
        
        for _ in range(num_ratings):
            user_id = random.choice(self.user_ids)
            if any(ur['user_id'] == user_id for ur in user_ratings):
                continue
                
            rating_value = random.choices([1, -1, 0], weights=[0.6, 0.2, 0.2])[0]
            user_ratings.append({
                "user_id": user_id,
                "rating": rating_value,
                "timestamp": fake.date_time_between(start_date='-3m', end_date='now').isoformat(),
                "query": random.choice([
                    "payment processing", "API integration", "security issues",
                    "database migration", "customer data", "compliance documents"
                ])
            })
        
        if not user_ratings:
            return None
        
        positive_count = sum(1 for ur in user_ratings if ur['rating'] > 0)
        negative_count = sum(1 for ur in user_ratings if ur['rating'] < 0)
        total_ratings = positive_count + negative_count
        
        score = 0.0
        if total_ratings > 0:
            score = (positive_count - negative_count) / total_ratings
        
        return {
            "ratings": {
                "positive_count": positive_count,
                "negative_count": negative_count,
                "total_ratings": total_ratings,
                "score": round(score, 2),
                "last_updated": max(ur['timestamp'] for ur in user_ratings)
            },
            "user_ratings": user_ratings
        }

    def generate_confluence_document(self):
        """Generate a realistic Confluence document."""
        doc_types = [
            'Requirements Document', 'Technical Specification', 'User Guide',
            'Project Plan', 'Meeting Notes', 'Knowledge Base Article',
            'Process Documentation', 'Architecture Overview', 'FAQ',
            'Design Document', 'Implementation Guide', 'Best Practices'
        ]
        
        spaces = ['TECH', 'PROD', 'HR', 'RISK', 'COMP', 'MKT', 'FIN', 'LEGAL', 'ENG', 'OPS', 'SEC', 'BI']
        
        doc_type = random.choice(doc_types)
        space = random.choice(spaces)
        topic = random.choice(self.enterprise_topics)
        author = random.choice(self.employees)
        department = random.choice(self.departments)
        
        content_templates = [
            f"This document outlines the {topic} implementation for our enterprise platform. "
            f"The solution addresses customer needs for secure and efficient {topic} processing. "
            f"Key components include authentication, validation, and real-time processing capabilities. "
            f"Integration with core systems ensures seamless data flow and operational integrity.",
            
            f"Comprehensive guide to {topic} processes within enterprise operations. "
            f"This documentation covers standard procedures, best practices, and compliance requirements. "
            f"Includes step-by-step instructions and troubleshooting guidelines. "
            f"Regular updates ensure alignment with evolving business needs."
        ]
        
        content = random.choice(content_templates)
        content += f" Last updated by {author} from {department} department. "
        content += f"Document status: {'Final' if random.random() > 0.3 else 'Draft'}. "
        
        tags = [topic.replace(' ', '_'), department.lower().replace(' ', '_')]
        if random.random() > 0.5:
            tags.extend(['enterprise', 'documentation', random.choice(['urgent', 'standard', 'low_priority'])])
        
        doc = {
            'title': f"{doc_type}: {topic.title()} - {fake.catch_phrase()}",
            'content': content + " " + fake.text(max_nb_chars=500),
            'summary': content[:200] + "...",
            'source': 'confluence',
            'content_type': 'document',
            'author': author,
            'department': department,
            'url': f"https://company.atlassian.net/wiki/spaces/{space}/pages/{random.randint(100000, 999999)}",
            'timestamp': fake.date_time_between(start_date='-1y', end_date='now').isoformat(),
            'tags': tags,
            'space': space,
            'project': f"Project {random.choice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Phoenix', 'Odyssey'])}"
        }
        
        ratings_data = self.generate_ratings_data()
        if ratings_data:
            doc.update(ratings_data)
        
        # Add semantic fields if enabled
        doc = self.add_semantic_fields(doc)
        
        return doc

    def generate_jira_ticket(self):
        """Generate a realistic Jira ticket."""
        ticket_types = ['Bug', 'Task', 'Story', 'Epic', 'Improvement', 'Sub-task']
        priorities = ['Critical', 'High', 'Medium', 'Low']
        statuses = ['Open', 'In Progress', 'Code Review', 'Testing', 'Done', 'Closed', 'Blocked']
        
        ticket_type = random.choice(ticket_types)
        priority = random.choice(priorities)
        status = random.choice(statuses)
        topic = random.choice(self.enterprise_topics)
        author = random.choice(self.employees)
        department = random.choice(self.departments)
        
        if ticket_type == 'Bug':
            title_templates = [
                f"Issue with {topic} functionality",
                f"API timeout in {topic} service",
                f"Data inconsistency in {topic} module",
                f"Performance issue in {topic} component"
            ]
        elif ticket_type == 'Epic':
            title_templates = [
                f"Epic: Transform {topic} capabilities",
                f"Epic: Modernize {topic} infrastructure",
                f"Epic: Enhance {topic} user experience"
            ]
        else:
            title_templates = [
                f"Implement {topic} enhancement",
                f"Upgrade {topic} infrastructure",
                f"Design {topic} user interface",
                f"Integrate {topic} with core systems"
            ]
        
        title = random.choice(title_templates)
        
        content = f"Task details for {topic} implementation. "
        content += f"Requirements include security compliance, performance optimization, and user experience. "
        content += f"Assigned to {author} ({department}). Priority: {priority}. Status: {status}. "
        
        tags = [ticket_type.lower(), priority.lower(), topic.replace(' ', '_')]
        if priority in ['Critical', 'High']:
            tags.append('urgent')
        
        doc = {
            'title': title,
            'content': content + " " + fake.text(max_nb_chars=300),
            'summary': content[:150] + "...",
            'source': 'jira',
            'content_type': 'ticket',
            'author': author,
            'department': department,
            'url': f"https://company.atlassian.net/browse/{random.choice(['CORP', 'TECH', 'PROD', 'CORE'])}-{random.randint(1000, 9999)}",
            'timestamp': fake.date_time_between(start_date='-6m', end_date='now').isoformat(),
            'tags': tags,
            'priority': priority,
            'status': status,
            'project': f"Enterprise-{random.choice(['DIGITAL', 'CORE', 'MOBILE', 'API', 'CLOUD', 'SECURITY'])}"
        }
        
        ratings_data = self.generate_ratings_data()
        if ratings_data:
            doc.update(ratings_data)
        
        # Add semantic fields if enabled
        doc = self.add_semantic_fields(doc)
        
        return doc

    def generate_sharepoint_document(self):
        """Generate a realistic SharePoint document."""
        doc_types = [
            'Policy Document', 'Training Material', 'Procedure Manual',
            'Report', 'Presentation', 'Spreadsheet', 'Form Template',
            'Compliance Document', 'Audit Report', 'Guidelines'
        ]
        
        sites = [
            'HR-Portal', 'Risk-Management', 'Compliance', 'IT-Department',
            'Corporate-Development', 'Operations', 'Finance', 'Legal-Documents'
        ]
        
        doc_type = random.choice(doc_types)
        site = random.choice(sites)
        topic = random.choice(self.enterprise_topics)
        author = random.choice(self.employees)
        department = random.choice(self.departments)
        
        content_templates = [
            f"Official company policy regarding {topic} management and implementation. "
            f"This document establishes guidelines, procedures, and compliance requirements. "
            f"All staff must adhere to these policies to ensure regulatory compliance.",
            
            f"Comprehensive {doc_type.lower()} covering {topic} best practices. "
            f"Includes detailed procedures, examples, and reference materials. "
            f"Designed for operational reference and training purposes."
        ]
        
        content = random.choice(content_templates)
        content += f" Document owner: {author} ({department}). "
        content += f"Classification: {'Confidential' if random.random() > 0.7 else 'Internal Use'}. "
        
        extension = random.choice(['.docx', '.xlsx', '.pptx', '.pdf'])
        
        tags = [doc_type.lower().replace(' ', '_'), topic.replace(' ', '_'), 'sharepoint']
        if 'compliance' in doc_type.lower() or 'policy' in doc_type.lower():
            tags.extend(['regulatory', 'mandatory'])
        
        doc = {
            'title': f"{doc_type}: {topic.title()} Guidelines",
            'content': content + " " + fake.text(max_nb_chars=400),
            'summary': content[:180] + "...",
            'source': 'sharepoint',
            'content_type': 'document',
            'author': author,
            'department': department,
            'url': f"https://company.sharepoint.com/sites/{site}/Documents/{topic.replace(' ', '_')}{extension}",
            'timestamp': fake.date_time_between(start_date='-2y', end_date='now').isoformat(),
            'tags': tags,
            'site': site,
            'project': f"Initiative-{random.randint(2023, 2024)}"
        }
        
        ratings_data = self.generate_ratings_data()
        if ratings_data:
            doc.update(ratings_data)
        
        # Add semantic fields if enabled
        doc = self.add_semantic_fields(doc)
        
        return doc

    def clear_existing_data(self):
        """Clear existing test data from the index."""
        try:
            # Delete all documents
            self.es.delete_by_query(
                index=self.index_name,
                body={"query": {"match_all": {}}}
            )
            
            # Refresh index
            self.es.indices.refresh(index=self.index_name)
            
            print("🗑️  Cleared all existing documents from index")
            return True
        except Exception as e:
            print(f"❌ Failed to clear existing data: {e}")
            return False

    def generate_test_data(self):
        """Generate and insert test data into Elasticsearch."""
        confluence_docs = self.config['confluence_docs']
        jira_tickets = self.config['jira_tickets']
        sharepoint_docs = self.config['sharepoint_docs']
        
        documents = []
        
        print(f"📚 Generating {confluence_docs} Confluence documents...")
        for i in range(confluence_docs):
            if i % 10 == 0 and i > 0:
                print(f"   Progress: {i}/{confluence_docs}")
            documents.append(self.generate_confluence_document())
        
        print(f"🎫 Generating {jira_tickets} Jira tickets...")
        for i in range(jira_tickets):
            if i % 10 == 0 and i > 0:
                print(f"   Progress: {i}/{jira_tickets}")
            documents.append(self.generate_jira_ticket())
        
        print(f"📄 Generating {sharepoint_docs} SharePoint documents...")
        for i in range(sharepoint_docs):
            if i % 10 == 0 and i > 0:
                print(f"   Progress: {i}/{sharepoint_docs}")
            documents.append(self.generate_sharepoint_document())
        
        # Shuffle documents
        random.shuffle(documents)
        
        # Bulk insert
        print(f"💾 Inserting {len(documents)} documents into Elasticsearch...")
        
        actions = []
        for doc in documents:
            action = {
                "_index": self.index_name,
                "_id": str(uuid.uuid4()),
                "_source": doc
            }
            actions.append(action)
        
        from elasticsearch.helpers import bulk, BulkIndexError
        
        try:
            success, failed = bulk(self.es, actions, chunk_size=100)
            print(f"✅ Successfully inserted: {success} documents")
            if failed:
                print(f"❌ Failed to insert: {len(failed)} documents")
        except BulkIndexError as e:
            print(f"❌ Bulk indexing failed:")
            print(f"   Error count: {len(e.errors)}")
            if self.config['debug'] and e.errors:
                print("   First few errors:")
                for i, error in enumerate(e.errors[:3]):
                    print(f"     Error {i+1}: {error}")
            raise e
        
        return documents

    def get_data_statistics(self):
        """Get statistics about the generated data."""
        try:
            self.es.indices.refresh(index=self.index_name)
            
            stats = {}
            
            # Total documents
            stats['total_docs'] = self.es.count(index=self.index_name)['count']
            
            # By source
            stats['by_source'] = {}
            for source in ['confluence', 'jira', 'sharepoint']:
                count = self.es.count(
                    index=self.index_name,
                    body={"query": {"term": {"source": source}}}
                )['count']
                stats['by_source'][source] = count
            
            # Documents with ratings
            if self.config['create_ratings']:
                stats['with_ratings'] = self.es.count(
                    index=self.index_name,
                    body={"query": {"exists": {"field": "ratings"}}}
                )['count']
            
            return stats
            
        except Exception as e:
            print(f"Warning: Could not generate statistics: {e}")
            return {}

    def test_search_functionality(self):
        """Test basic search functionality."""
        test_queries = ["payment", "security", "API"]
        
        print("\n🧪 Testing search functionality:")
        for query in test_queries:
            try:
                # Test traditional search
                response = self.es.search(
                    index=self.index_name,
                    body={
                        "query": {
                            "multi_match": {
                                "query": query,
                                "fields": ["title^3", "content^2", "summary^2"]
                            }
                        },
                        "size": 3
                    }
                )
                count = response['hits']['total']['value']
                print(f"   • '{query}' (lexical): {count} results")
                
                if response['hits']['hits']:
                    top_result = response['hits']['hits'][0]['_source']
                    print(f"     Top: {top_result['title']} ({top_result['source']})")
                
                # Test semantic search if enabled
                if self.config['semantic_enabled']:
                    try:
                        prefix = self.config['semantic_field_prefix']
                        semantic_response = self.es.search(
                            index=self.index_name,
                            body={
                                "query": {
                                    "bool": {
                                        "should": [
                                            {
                                                "semantic": {
                                                    "field": f"{prefix}content",
                                                    "query": query
                                                }
                                            },
                                            {
                                                "semantic": {
                                                    "field": f"{prefix}title",
                                                    "query": query
                                                }
                                            }
                                        ]
                                    }
                                },
                                "size": 3
                            }
                        )
                        semantic_count = semantic_response['hits']['total']['value']
                        print(f"   • '{query}' (semantic): {semantic_count} results")
                        
                        if semantic_response['hits']['hits']:
                            top_semantic = semantic_response['hits']['hits'][0]['_source']
                            print(f"     Top: {top_semantic['title']} ({top_semantic['source']})")
                    except Exception as semantic_error:
                        print(f"   • '{query}' (semantic): Failed - {semantic_error}")
                    
            except Exception as e:
                print(f"   • '{query}': Search failed - {e}")

def main():
    """Main function to generate test data."""
    print("Enterprise Search - Test Data Generator")
    print("=" * 45)
    
    generator = TestDataGenerator()
    
    try:
        # Validate prerequisites
        print("🔍 Validating prerequisites...")
        is_ready, message = generator.validate_prerequisites()
        
        if not is_ready:
            print(f"❌ {message}")
            print("\n🛠️  Please run the setup script first:")
            print("   python elasticsearch_setup.py")
            print("\nThe setup script will create the required index and mappings.")
            return
        
        print(f"✅ {message}")
        
        # Clear existing data if requested
        if generator.config['clear_existing']:
            print("\n🗑️  Clearing existing data...")
            generator.clear_existing_data()
        
        # Generate test data
        print("\n🏭 Generating test data...")
        documents = generator.generate_test_data()
        
        # Get statistics
        print("\n📊 Data Statistics:")
        stats = generator.get_data_statistics()
        
        if stats:
            print(f"   Total Documents: {stats.get('total_docs', 0)}")
            if stats.get('by_source'):
                for source, count in stats['by_source'].items():
                    print(f"   {source.title()}: {count}")
            if stats.get('with_ratings'):
                print(f"   Documents with ratings: {stats['with_ratings']}")
        
        # Test search
        generator.test_search_functionality()
        
        print("\n" + "=" * 45)
        print("✅ Test data generation completed!")
        print(f"📄 Generated {len(documents)} documents")
        
        if generator.config['semantic_enabled']:
            print("🧠 Semantic search fields included")
        
        print("\n🚀 Your enterprise search is ready for testing!")
        
        print("\n💡 Try these search queries:")
        print("   • 'payment processing'")
        print("   • 'API integration'")
        print("   • 'security compliance'")
        print("   • 'database migration'")
        
        if generator.config['semantic_enabled']:
            print("\n🔍 Semantic search will find conceptually similar documents")
            print("   • 'transaction issues' (finds payment-related docs)")
            print("   • 'system integration' (finds API-related docs)")
            print("   • 'data protection' (finds security-related docs)")
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Operation cancelled by user")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if generator.config['debug']:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()