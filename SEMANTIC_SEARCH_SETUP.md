# Semantic Search Setup with E5 Model

This document explains how to set up semantic search using Elasticsearch's `semantic_text` feature with the E5 model.

## Prerequisites

- Elasticsearch 8.15+ with `semantic_text` support
- E5 model deployed in Elasticsearch
- Appropriate license for semantic search features

## Configuration

### 1. Environment Variables

Add these environment variables to your `.env` file:

```env
# Semantic Search Configuration
REACT_APP_SEMANTIC_ENABLED=true
REACT_APP_SEMANTIC_MODEL=.multilingual-e5-small
REACT_APP_SEMANTIC_FIELD_PREFIX=semantic_
REACT_APP_HYBRID_WEIGHT=0.7
```

### 2. Elasticsearch Index Mapping

Create your index with semantic_text fields:

```json
{
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
      "semantic_title": {
        "type": "semantic_text",
        "inference_id": ".multilingual-e5-small"
      },
      "semantic_content": {
        "type": "semantic_text",
        "inference_id": ".multilingual-e5-small"
      },
      "semantic_summary": {
        "type": "semantic_text",
        "inference_id": ".multilingual-e5-small"
      },
      "author": {
        "type": "keyword"
      },
      "source": {
        "type": "keyword"
      },
      "tags": {
        "type": "keyword"
      },
      "content_type": {
        "type": "keyword"
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}
```

### 3. Model Deployment

Deploy the E5 model in Elasticsearch:

```bash
# Deploy the multilingual E5 small model
POST _inference/text_embedding/.multilingual-e5-small
{
  "service": "elasticsearch",
  "service_settings": {
    "model_id": ".multilingual-e5-small",
    "dimensions": 384
  }
}
```

## How It Works

### Hybrid Search Strategy

The application uses a hybrid approach combining:

1. **Semantic Search (70% weight)**: Uses `semantic_text` fields with E5 embeddings
2. **Lexical Search (30% weight)**: Traditional keyword matching

### Query Structure

For semantic-enabled searches, the application generates queries like:

```json
{
  "query": {
    "bool": {
      "should": [
        {
          "semantic": {
            "field": "semantic_content",
            "query": "user search query",
            "boost": 0.7
          }
        },
        {
          "semantic": {
            "field": "semantic_title",
            "query": "user search query",
            "boost": 1.05
          }
        },
        {
          "semantic": {
            "field": "semantic_summary",
            "query": "user search query",
            "boost": 0.84
          }
        },
        {
          "multi_match": {
            "query": "user search query",
            "fields": [
              "title^3",
              "content^2",
              "summary^2",
              "tags^1.5"
            ],
            "type": "best_fields",
            "fuzziness": "AUTO",
            "boost": 0.3
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}
```

## Data Indexing

### Document Structure

When indexing documents, include both regular and semantic fields:

```json
{
  "title": "Q3 Product Roadmap Planning",
  "content": "Detailed content about roadmap planning...",
  "summary": "Comprehensive roadmap planning document...",
  "semantic_title": "Q3 Product Roadmap Planning",
  "semantic_content": "Detailed content about roadmap planning...",
  "semantic_summary": "Comprehensive roadmap planning document...",
  "author": "Sarah Chen",
  "source": "confluence",
  "tags": ["roadmap", "planning", "Q3"],
  "content_type": "document",
  "timestamp": "2024-06-15T00:00:00Z"
}
```

### Bulk Indexing Script

```bash
# Example bulk indexing with semantic fields
POST enterprise_documents/_bulk
{"index": {"_id": "1"}}
{"title": "Document Title", "content": "Document content...", "semantic_title": "Document Title", "semantic_content": "Document content..."}
```

## Benefits

### Semantic Understanding

- **Context Awareness**: Understands meaning, not just keywords
- **Multilingual Support**: E5 model supports multiple languages
- **Synonym Recognition**: Finds related concepts automatically
- **Intent Understanding**: Better handles conversational queries

### Examples

Traditional search for "payment issues" might miss:
- "transaction problems"
- "billing errors" 
- "checkout failures"

Semantic search finds all semantically related documents.

## Configuration Options

### Hybrid Weight Tuning

Adjust the balance between semantic and lexical search:

```env
# More semantic (better for conceptual queries)
REACT_APP_HYBRID_WEIGHT=0.8

# More lexical (better for exact keyword matching)
REACT_APP_HYBRID_WEIGHT=0.5
```

### Model Selection

Choose different E5 model variants:

```env
# Small model (faster, less accurate)
REACT_APP_SEMANTIC_MODEL=.multilingual-e5-small

# Large model (slower, more accurate)
REACT_APP_SEMANTIC_MODEL=.multilingual-e5-large
```

## Monitoring

### UI Indicators

- **Semantic Badge**: Shows when semantic search is active
- **Query Logs**: Console logs indicate search type
- **Performance Metrics**: Track response times

### Search Quality

Monitor search effectiveness:
- Click-through rates
- User satisfaction scores
- Query success rates

## Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure E5 model is deployed
2. **Mapping Errors**: Verify semantic_text fields in mapping
3. **Performance Issues**: Consider model size and cluster resources
4. **Fallback Behavior**: App falls back to lexical search if semantic fails

### Debug Mode

Enable debug logging:

```env
REACT_APP_DEBUG=true
```

## Performance Considerations

### Model Size vs Speed

- **Small Model**: 384 dimensions, faster inference
- **Large Model**: 1024 dimensions, better accuracy

### Indexing Performance

- Semantic fields increase indexing time
- Consider batch processing for large datasets
- Monitor cluster resource usage

## Search Application Integration

The configuration also works with Elasticsearch Search Applications. The semantic parameters are passed through to the search application template.

## Next Steps

1. Deploy E5 model in your Elasticsearch cluster
2. Update index mapping with semantic_text fields
3. Re-index existing documents with semantic fields
4. Configure environment variables
5. Test semantic search functionality

For more information, see the [Elasticsearch semantic_text documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/semantic-text.html).