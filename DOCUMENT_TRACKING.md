# Document View Tracking Implementation

## Overview
The document tracking system automatically captures user interactions with documents and stores them in Elasticsearch without displaying any UI counters or view statistics.

## Features
- ✅ **Invisible Tracking**: No UI elements showing view counts
- ✅ **Document ID-based**: Uses predictable document IDs for easy querying
- ✅ **Multiple Actions**: Tracks `view`, `summarize`, and `chat` interactions
- ✅ **User Context**: Captures user details and session information
- ✅ **Auto-initialization**: Creates index and mapping automatically
- ✅ **Error Handling**: Fallback storage for failed events

## Implementation Details

### Document ID Format
Each tracking event uses this ID format:
```
{documentId}_{timestamp}
```

**Example**: `doc_456_1728191487001`

This ensures:
- Easy identification of document-related events
- Unique IDs for each interaction
- Chronological ordering capability

### Data Structure
Each view event contains:
```json
{
  "documentId": "doc_123",
  "documentTitle": "Sample Document Title", 
  "userId": "user_123",
  "userName": "John Smith",
  "userEmail": "john.smith@company.com",
  "viewTime": "2025-08-06T04:30:00.000Z",
  "action": "view",
  "sessionId": "session_user_123_1728191487000",
  "timestamp": 1728191487000
}
```

### Tracked Actions
- **`view`**: When user clicks on a document
- **`summarize`**: When user generates document summaries
- **`chat`**: When user starts chat about a document

## Integration Points

### 1. DocumentCard Component
```typescript
const handleClick = async () => {
  // Track document view
  try {
    await documentTracker.trackDocumentView(document.id, document.title, 'view');
  } catch (error) {
    console.error('Failed to track document view:', error);
  }
  
  if (onClick) {
    onClick(document);
  }
};
```

### 2. Chat Component
```typescript
const startNewChat = async (document?: any) => {
  if (document && document.id && document.title) {
    try {
      await documentTracker.trackDocumentView(document.id, document.title, 'chat');
    } catch (error) {
      console.error('Failed to track chat interaction:', error);
    }
  }
  // ... rest of chat logic
};
```

### 3. Summary Component
```typescript
await Promise.all(selectedResults.map(async document => {
  try {
    await documentTracker.trackDocumentView(document.id, document.title, 'summarize');
  } catch (error) {
    console.error('Failed to track summarize action:', error);
  }
}));
```

## Elasticsearch Index

### Index: `document_views`

**Mapping**:
```json
{
  "mappings": {
    "properties": {
      "documentId": {"type": "keyword"},
      "documentTitle": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
      "userId": {"type": "keyword"}, 
      "userName": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
      "userEmail": {"type": "keyword"},
      "viewTime": {"type": "date"},
      "action": {"type": "keyword"},
      "sessionId": {"type": "keyword"},
      "timestamp": {"type": "long"}
    }
  }
}
```

## Analytics Queries

### Get All Views for a Document
```bash
curl "http://localhost:9200/document_views/_search" -H "Content-Type: application/json" -d '{
  "query": {"term": {"documentId": "doc_123"}},
  "sort": [{"timestamp": {"order": "desc"}}]
}'
```

### Get User Activity
```bash
curl "http://localhost:9200/document_views/_search" -H "Content-Type: application/json" -d '{
  "query": {"term": {"userId": "user_123"}},
  "sort": [{"timestamp": {"order": "desc"}}]
}'
```

### Get Action-specific Views
```bash
curl "http://localhost:9200/document_views/_search" -H "Content-Type: application/json" -d '{
  "query": {
    "bool": {
      "must": [
        {"term": {"documentId": "doc_123"}},
        {"term": {"action": "summarize"}}
      ]
    }
  }
}'
```

### Count Views by Document
```bash
curl "http://localhost:9200/document_views/_search" -H "Content-Type: application/json" -d '{
  "size": 0,
  "aggs": {
    "documents": {
      "terms": {"field": "documentId"},
      "aggs": {
        "actions": {"terms": {"field": "action"}}
      }
    }
  }
}'
```

## Error Handling

### Fallback Storage
If Elasticsearch is unavailable, events are stored in localStorage under `failed_view_events` for later retry.

### Retry Mechanism
```typescript
await documentTracker.retryFailedEvents();
```

## Testing

### Manual Test
```bash
# Create a test view event
curl -X PUT "http://localhost:9200/document_views/_doc/doc_test_$(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc_test",
    "documentTitle": "Test Document",
    "userId": "test_user",
    "userName": "Test User",
    "userEmail": "test@company.com",
    "viewTime": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "action": "view",
    "sessionId": "session_test_'$(date +%s)'",
    "timestamp": '$(date +%s)'000'
  }'
```

### Verify Data
```bash
curl "http://localhost:9200/document_views/_count"
curl "http://localhost:9200/document_views/_search?size=5&sort=timestamp:desc"
```

## Performance Considerations

- **Async Operations**: All tracking is non-blocking
- **Error Tolerance**: Failed tracking doesn't impact user experience  
- **Batch Retry**: Failed events can be retried in batches
- **Index Optimization**: Proper field types for efficient querying

## Privacy & Compliance

- **User Identification**: Only authenticated user data is tracked
- **Data Retention**: No automatic cleanup implemented (add if needed)
- **Consent**: Consider adding user consent mechanisms if required

The system provides comprehensive document interaction analytics while maintaining a clean user interface without visible tracking elements.
