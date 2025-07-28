# Enterprise Search Python Scripts

This directory contains Python scripts for setting up and populating your Elasticsearch cluster with semantic search capabilities.

## Prerequisites

- Python 3.7+
- Elasticsearch 8.15+ (for semantic_text support)
- Required Python packages (install with: `pip install -r requirements.txt`)

## Installation

1. **Install dependencies:**
   ```bash
   pip install elasticsearch python-dotenv faker
   ```

2. **Create environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your Elasticsearch configuration
   ```

## Scripts Overview

### 1. setup_elastic.py
Sets up Elasticsearch index with semantic_text support and deploys the E5 model.

**Features:**
- Creates index with semantic_text mappings
- Deploys E5 multilingual model for semantic search
- Configures Search Application with hybrid queries
- Validates setup completeness

**Usage:**
```bash
python setup_elastic.py
```

### 2. gen_test_data.py
Generates realistic test data with semantic_text fields.

**Features:**
- Creates enterprise documents (Confluence, Jira, SharePoint)
- Includes semantic_text fields automatically
- Generates user ratings and feedback
- Tests both lexical and semantic search

**Usage:**
```bash
python gen_test_data.py
```

## Configuration

### Environment Variables

#### Elasticsearch Connection
```env
ELASTIC_HOST=localhost
ELASTIC_PORT=9200
ELASTIC_SCHEME=http
ELASTIC_INDEX=enterprise_documents
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=changeme
ELASTIC_API_KEY=your_api_key_here
```

#### Semantic Search
```env
SEMANTIC_ENABLED=true
SEMANTIC_MODEL=.multilingual-e5-small
SEMANTIC_FIELD_PREFIX=semantic_
HYBRID_WEIGHT=0.7
DEPLOY_MODEL=true
```

#### Data Generation
```env
CONFLUENCE_DOCS=30
JIRA_TICKETS=25
SHAREPOINT_DOCS=20
CREATE_RATINGS=true
CLEAR_EXISTING=false
```

### Semantic Search Configuration

The scripts support multiple E5 model variants:

- `.multilingual-e5-small` (384 dimensions) - Fast, good quality
- `.multilingual-e5-large` (1024 dimensions) - Slower, better quality

**Hybrid Search Weight:**
- `0.7` = 70% semantic, 30% lexical (default)
- `0.5` = 50% semantic, 50% lexical (balanced)
- `0.3` = 30% semantic, 70% lexical (more keyword-focused)

## Setup Process

### 1. Run Setup Script
```bash
python setup_elastic.py
```

This will:
- ✅ Test Elasticsearch connection
- 🤖 Deploy E5 semantic model
- 📄 Create index with semantic_text mappings
- 🔍 Configure Search Application
- 📁 Export configuration files
- ✅ Validate setup

### 2. Generate Test Data
```bash
python gen_test_data.py
```

This will:
- ✅ Validate prerequisites
- 📚 Generate realistic documents
- 🧠 Include semantic_text fields
- 📊 Show data statistics
- 🧪 Test search functionality

## Document Structure

Generated documents include both traditional and semantic fields:

```json
{
  "title": "API Integration Guide",
  "content": "Comprehensive guide to API integration...",
  "summary": "This document covers API integration best practices...",
  "semantic_title": "API Integration Guide",
  "semantic_content": "Comprehensive guide to API integration...",
  "semantic_summary": "This document covers API integration best practices...",
  "source": "confluence",
  "author": "Sarah Chen",
  "department": "Engineering",
  "tags": ["api", "integration", "documentation"],
  "ratings": {
    "positive_count": 8,
    "negative_count": 1,
    "total_ratings": 9,
    "score": 0.78
  }
}
```

## Search Queries

The setup creates a Search Application with hybrid queries:

### Semantic Search
Finds conceptually similar documents:
- "payment issues" → finds "transaction problems", "billing errors"
- "system integration" → finds "API connectivity", "service orchestration"
- "data protection" → finds "security compliance", "privacy measures"

### Lexical Search
Traditional keyword matching:
- "API integration" → finds exact keyword matches
- "payment processing" → finds documents with these terms

### Hybrid Search
Combines both approaches for optimal results.

## Troubleshooting

### Common Issues

1. **Model Deployment Failed**
   ```
   ❌ Failed to deploy semantic model
   ```
   - Ensure Elasticsearch 8.15+ with appropriate license
   - Check cluster resources and permissions
   - Set `DEPLOY_MODEL=false` to skip model deployment

2. **semantic_text Not Supported**
   ```
   ❌ semantic_text field type not supported
   ```
   - Upgrade to Elasticsearch 8.15+
   - Ensure proper license for semantic features
   - Set `SEMANTIC_ENABLED=false` to disable

3. **Connection Failed**
   ```
   ❌ Cannot connect to Elasticsearch cluster
   ```
   - Check `ELASTIC_HOST` and `ELASTIC_PORT`
   - Verify authentication credentials
   - Ensure Elasticsearch is running

### Debug Mode

Enable detailed logging:
```env
DEBUG=true
```

### Validation

Both scripts include comprehensive validation:
- Connection testing
- Index mapping verification
- Model deployment status
- Search functionality testing

## Integration with React App

After running the scripts, update your React app's `.env`:

```env
REACT_APP_ELASTIC_ENDPOINT=http://localhost:9200
REACT_APP_ELASTIC_API_KEY=your_api_key_here
REACT_APP_SEARCH_APPLICATION_NAME=enterprise-search
REACT_APP_SEMANTIC_ENABLED=true
REACT_APP_SEMANTIC_MODEL=.multilingual-e5-small
REACT_APP_SEMANTIC_FIELD_PREFIX=semantic_
REACT_APP_HYBRID_WEIGHT=0.7
```

## Performance Considerations

### Model Selection
- **Small Model**: Faster inference, lower resource usage
- **Large Model**: Better accuracy, higher resource usage

### Indexing Performance
- Semantic fields increase indexing time
- Consider batch sizes for large datasets
- Monitor cluster resources during indexing

### Search Performance
- Hybrid queries may be slower than pure lexical
- Adjust `HYBRID_WEIGHT` based on use case
- Consider caching for frequently accessed queries

## Advanced Configuration

### Custom Model
To use a custom trained model:
```env
SEMANTIC_MODEL=my-custom-model
DEPLOY_MODEL=false  # Deploy manually
```

### Field Customization
To use different field names:
```env
SEMANTIC_FIELD_PREFIX=vector_
```

### Search Application Customization
The scripts generate `search_application.json` which can be customized and redeployed.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Enable debug mode for detailed logs
3. Verify Elasticsearch version and license
4. Ensure all prerequisites are met

## License

This project is part of the Enterprise Search application. See the main project LICENSE file for details.