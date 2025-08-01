#!/usr/bin/env python3
"""
Focused Test Document Generator for Enterprise Search
Creates specific test documents for summarization and search testing
"""

import json
import os
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FocusedTestDataGenerator:
    def __init__(self):
        """Initialize the focused test data generator."""
        self.config = self._load_config()
        self.es = self._create_elasticsearch_client()
        self.index_name = self.config.get('index', 'enterprise_documents')

    def _load_config(self):
        """Load configuration from environment variables."""
        return {
            'host': os.getenv('ELASTIC_HOST', 'localhost'),
            'port': int(os.getenv('ELASTIC_PORT', '9200')),
            'scheme': os.getenv('ELASTIC_SCHEME', 'http'),
            'index': os.getenv('ELASTIC_INDEX', 'enterprise_documents'),
            'debug': os.getenv('DEBUG', 'false').lower() == 'true'
        }

    def _create_elasticsearch_client(self):
        """Create Elasticsearch client."""
        return Elasticsearch([{
            'host': self.config['host'],
            'port': self.config['port'],
            'scheme': self.config['scheme']
        }])

    def create_api_related_documents(self):
        """Create API-related documents for testing."""
        documents = [
            {
                "id": "api-gateway-architecture",
                "title": "API Gateway Architecture Design",
                "content": """This document outlines the comprehensive API Gateway architecture for our enterprise systems. The API Gateway serves as the central entry point for all client requests, providing essential services including authentication, rate limiting, request/response transformation, and monitoring.

Key Components:
1. Load Balancer: Distributes incoming requests across multiple gateway instances
2. Authentication Layer: Validates JWT tokens and API keys
3. Rate Limiting: Prevents abuse by limiting requests per client
4. Circuit Breaker: Provides fault tolerance for downstream services
5. Logging & Monitoring: Tracks all API usage and performance metrics

Security Considerations:
- All API endpoints require authentication via JWT tokens
- Rate limiting prevents DDoS attacks
- HTTPS encryption for all communications
- Input validation to prevent injection attacks

Performance Optimization:
- Caching layer for frequently accessed data
- Connection pooling for database connections
- Asynchronous processing for non-critical operations
- Response compression to reduce bandwidth

Implementation Guidelines:
- Use standardized error codes and messages
- Implement proper versioning strategy
- Document all endpoints with OpenAPI specifications
- Monitor API performance and usage patterns""",
                "content_type": "confluence",
                "department": "Technology & Operations",
                "author": "Sarah Chen",
                "created_at": datetime.now() - timedelta(days=10),
                "tags": ["api", "architecture", "gateway", "security", "performance"],
                "priority": "high",
                "status": "published"
            },
            {
                "id": "payment-api-integration",
                "title": "Payment API Integration Guide",
                "content": """This guide covers the integration process for our new Payment API, which handles all financial transactions across our platform. The Payment API provides secure, reliable, and scalable payment processing capabilities.

API Endpoints:
1. POST /api/payments/process - Process a payment transaction
2. GET /api/payments/{id} - Retrieve payment details
3. POST /api/payments/refund - Process payment refunds
4. GET /api/payments/history - Get payment history

Authentication:
- API requires Bearer token authentication
- Tokens expire after 24 hours
- Refresh tokens available for long-term access

Request Format:
{
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "credit_card",
  "customer_id": "cust_12345",
  "metadata": {
    "order_id": "order_67890"
  }
}

Error Handling:
- 400: Bad Request - Invalid parameters
- 401: Unauthorized - Invalid or expired token
- 402: Payment Required - Insufficient funds
- 500: Internal Server Error - System error

Testing:
- Use sandbox environment for development
- Test card numbers available in documentation
- Webhook endpoints for real-time notifications

Compliance:
- PCI DSS compliant processing
- Data encryption at rest and in transit
- Audit logging for all transactions""",
                "content_type": "confluence",
                "department": "Technology & Operations",
                "author": "Mike Rodriguez",
                "created_at": datetime.now() - timedelta(days=5),
                "tags": ["api", "payment", "integration", "security", "finance"],
                "priority": "critical",
                "status": "published"
            },
            {
                "id": "api-bug-payment-timeout",
                "title": "API Integration Bug - Payment Gateway Timeout",
                "content": """Critical bug report for payment gateway API integration causing transaction timeouts during high traffic periods.

Issue Description:
Payment API calls are timing out after 30 seconds during peak hours (9 AM - 5 PM weekdays), resulting in failed transactions and poor customer experience.

Impact:
- ~15% of payment transactions failing during peak hours
- Customer complaints about failed payments
- Revenue loss estimated at $50,000/day
- Decreased customer satisfaction scores

Technical Details:
- Error occurs in payment gateway connection
- Timeout happens at API gateway level
- Database connection pool exhaustion suspected
- Memory usage spikes during peak times

Root Cause Analysis:
1. Database connection pool size insufficient (current: 20, needed: 50)
2. API gateway timeout set too low (30s, should be 60s)
3. Inefficient query causing slow response times
4. Missing connection pool monitoring

Proposed Solutions:
1. Increase database connection pool size to 50
2. Optimize payment processing queries
3. Implement connection pool monitoring
4. Add circuit breaker pattern for fault tolerance
5. Increase API gateway timeout to 60 seconds

Priority: Critical
Assigned to: Engineering Team
Due Date: Within 48 hours

Test Plan:
1. Load testing with simulated peak traffic
2. Monitor connection pool usage
3. Verify timeout improvements
4. Validate error rates drop below 1%""",
                "content_type": "jira",
                "department": "Engineering",
                "author": "Alex Kumar",
                "created_at": datetime.now() - timedelta(days=2),
                "tags": ["bug", "api", "payment", "timeout", "critical"],
                "priority": "critical",
                "status": "in_progress"
            },
            {
                "id": "api-security-standards",
                "title": "API Security Standards and Best Practices",
                "content": """This document establishes the security standards and best practices for all API development and integration within our organization.

Authentication & Authorization:
1. OAuth 2.0 for third-party integrations
2. JWT tokens for internal service communication
3. API keys for public API access
4. Multi-factor authentication for admin endpoints

Data Protection:
- TLS 1.3 encryption for all API communications
- Field-level encryption for sensitive data
- Data masking in logs and error messages
- Regular security audits and penetration testing

Rate Limiting & Abuse Prevention:
- Implement rate limiting per API key/user
- Use sliding window algorithm for rate limiting
- Block suspicious IP addresses automatically
- Monitor for unusual traffic patterns

Input Validation:
- Validate all input parameters
- Use whitelist approach for allowed values
- Sanitize all user inputs
- Implement proper error handling

API Documentation Security:
- Never expose sensitive endpoints in public docs
- Use example data instead of real data
- Document security requirements clearly
- Regular review of documentation for security issues

Monitoring & Logging:
- Log all API access attempts
- Monitor for failed authentication attempts
- Alert on suspicious activity patterns
- Regular security audit reviews

Compliance Requirements:
- GDPR compliance for data handling
- PCI DSS for payment-related APIs
- SOX compliance for financial data
- Regular compliance audits""",
                "content_type": "sharepoint",
                "department": "Information Security",
                "author": "Jennifer Park",
                "created_at": datetime.now() - timedelta(days=15),
                "tags": ["api", "security", "standards", "compliance", "authentication"],
                "priority": "high",
                "status": "published"
            },
            {
                "id": "api-performance-optimization",
                "title": "API Performance Optimization Report",
                "content": """Performance analysis and optimization recommendations for our enterprise API infrastructure based on 6 months of production data.

Current Performance Metrics:
- Average response time: 245ms
- 95th percentile: 890ms
- 99th percentile: 2.1s
- Uptime: 99.7%
- Throughput: 10,000 requests/minute

Identified Bottlenecks:
1. Database query optimization needed (40% of slow responses)
2. Inefficient serialization of large objects
3. Missing caching layer for frequently accessed data
4. Network latency to external services

Optimization Strategies:
1. Database Optimization:
   - Add indexes for frequently queried fields
   - Implement query result caching
   - Use read replicas for read-heavy operations
   - Optimize complex JOIN operations

2. Caching Implementation:
   - Redis cache for session data
   - CDN for static content
   - Application-level caching for computed results
   - Cache invalidation strategy

3. API Design Improvements:
   - Implement pagination for large datasets
   - Add field selection for partial responses
   - Use compression for large payloads
   - Implement efficient data serialization

4. Infrastructure Scaling:
   - Horizontal scaling of API gateway
   - Load balancing optimization
   - Auto-scaling based on traffic patterns
   - CDN implementation for global access

Expected Improvements:
- 40% reduction in average response time
- 60% reduction in 95th percentile latency
- 30% increase in throughput capacity
- 99.9% uptime target

Implementation Timeline:
- Phase 1: Database optimization (2 weeks)
- Phase 2: Caching implementation (3 weeks)
- Phase 3: API design improvements (4 weeks)
- Phase 4: Infrastructure scaling (2 weeks)""",
                "content_type": "confluence",
                "department": "Engineering",
                "author": "Emma Thompson",
                "created_at": datetime.now() - timedelta(days=7),
                "tags": ["api", "performance", "optimization", "metrics", "scaling"],
                "priority": "high",
                "status": "published"
            }
        ]
        
        return documents

    def create_user_profile_documents(self):
        """Create user profile documents for testing."""
        documents = [
            {
                "id": "sarah-johnson-profile",
                "title": "Sarah Johnson - Chief Technology Officer",
                "content": """Sarah Johnson serves as the Chief Technology Officer (CTO) at our organization, leading the technology strategy and digital transformation initiatives.

Professional Background:
- 15+ years in technology leadership roles
- Former VP of Engineering at Fortune 500 company
- MS Computer Science from Stanford University
- Certified in cloud architecture and cybersecurity

Key Responsibilities:
- Technology strategy and roadmap planning
- Digital transformation leadership
- Engineering team management (120+ engineers)
- Technology vendor relationships
- Innovation and emerging technology evaluation

Current Initiatives:
1. Cloud migration of legacy systems
2. API-first architecture implementation
3. DevOps and CI/CD pipeline optimization
4. Cybersecurity framework enhancement
5. Data analytics platform development

Technical Expertise:
- Cloud platforms (AWS, Azure, GCP)
- Microservices architecture
- API design and management
- Cybersecurity and compliance
- Data engineering and analytics

Leadership Philosophy:
Believes in empowering teams through technology, fostering innovation, and maintaining high engineering standards while delivering business value.

Contact Information:
- Email: sarah.johnson@company.com
- Phone: +1-555-0102
- Location: San Francisco, CA
- Reports to: CEO
- Direct Reports: 8 senior leaders

Recent Achievements:
- Led successful cloud migration reducing costs by 30%
- Implemented API gateway improving system reliability
- Established cybersecurity framework achieving SOC 2 compliance
- Built high-performing engineering teams with 95% retention rate""",
                "content_type": "employee",
                "department": "Technology",
                "author": "HR System",
                "created_at": datetime.now() - timedelta(days=30),
                "tags": ["employee", "executive", "technology", "leadership"],
                "priority": "medium",
                "status": "active",
                "employee_level": "L1",
                "location": "San Francisco, CA",
                "email": "sarah.johnson@company.com",
                "phone": "+1-555-0102"
            }
        ]
        
        return documents

    def insert_documents(self, documents):
        """Insert documents into Elasticsearch."""
        print(f"🔍 Inserting {len(documents)} focused test documents...")
        
        success_count = 0
        for doc in documents:
            try:
                # Add timestamp fields
                doc["created_at"] = doc.get("created_at", datetime.now()).isoformat()
                doc["updated_at"] = datetime.now().isoformat()
                
                # Insert document
                result = self.es.index(
                    index=self.index_name,
                    id=doc["id"],
                    body=doc
                )
                
                if result.get("result") in ["created", "updated"]:
                    success_count += 1
                    print(f"   ✅ {doc['title']}")
                else:
                    print(f"   ❌ Failed to insert: {doc['title']}")
                    
            except Exception as e:
                print(f"   ❌ Error inserting {doc['title']}: {str(e)}")
        
        print(f"✅ Successfully inserted {success_count}/{len(documents)} documents")
        return success_count

    def run(self):
        """Run the focused test data generation."""
        print("Enterprise Search - Focused Test Data Generator")
        print("=" * 50)
        
        try:
            # Check if index exists
            if not self.es.indices.exists(index=self.index_name):
                print(f"❌ Index '{self.index_name}' does not exist!")
                print("   Run setup_elastic.py first to create the index.")
                return False
            
            # Get current document count
            count_result = self.es.count(index=self.index_name)
            current_count = count_result["count"]
            print(f"📊 Current documents in index: {current_count}")
            
            # Generate and insert documents
            all_documents = []
            all_documents.extend(self.create_api_related_documents())
            all_documents.extend(self.create_user_profile_documents())
            
            inserted_count = self.insert_documents(all_documents)
            
            # Get final count
            final_count_result = self.es.count(index=self.index_name)
            final_count = final_count_result["count"]
            
            print("\n📈 Summary:")
            print(f"   Documents before: {current_count}")
            print(f"   Documents inserted: {inserted_count}")
            print(f"   Documents after: {final_count}")
            
            # Test search with the new documents
            print("\n🧪 Testing search with new documents:")
            
            test_queries = ["api", "payment", "sarah johnson"]
            for query in test_queries:
                try:
                    search_result = self.es.search(
                        index=self.index_name,
                        body={
                            "query": {
                                "multi_match": {
                                    "query": query,
                                    "fields": ["title^2", "content", "author"]
                                }
                            },
                            "size": 3
                        }
                    )
                    
                    hits = search_result["hits"]["hits"]
                    print(f"   • '{query}': {search_result['hits']['total']['value']} results")
                    if hits:
                        print(f"     Top result: {hits[0]['_source']['title']}")
                        
                except Exception as e:
                    print(f"   ❌ Search test failed for '{query}': {str(e)}")
            
            print("\n" + "=" * 50)
            print("✅ Focused test data generation completed!")
            print(f"📄 Added {inserted_count} specialized documents")
            print("🚀 Enhanced search testing capabilities!")
            
            print("\n💡 Try these test scenarios:")
            print("   • Search for 'api' to find API-related documents")
            print("   • Search for 'payment' to find payment integration docs")
            print("   • Search for 'sarah johnson' to find employee profile")
            print("   • Generate summaries with multiple API documents selected")
            
            return True
            
        except Exception as e:
            print(f"❌ Error during setup: {str(e)}")
            return False

if __name__ == "__main__":
    generator = FocusedTestDataGenerator()
    generator.run()
