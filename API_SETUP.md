# Enterprise Search Python API Setup

This Python API layer provides secure endpoints for Elasticsearch and LLM functionality, replacing direct client-side API calls with server-side processing that includes user authentication and authorization.

## Features

- **FastAPI-based REST API** with automatic OpenAPI documentation
- **User Authentication & Authorization** with JWT tokens and role-based access
- **Elasticsearch Service Layer** supporting both direct queries and Search Applications
- **LLM Integration** for summarization and chat functionality
- **User Context Integration** - all API calls include user identity and role-based permissions
- **CORS Support** for React frontend integration
- **Comprehensive Error Handling** with fallback responses

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/markpudd/enterprise-search
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp api/.env.example api/.env
```

Edit `api/.env` with your actual configuration:

```env
# Required: Elasticsearch Configuration
ELASTICSEARCH_URL=https://your-elasticsearch-cluster.com
ELASTICSEARCH_API_KEY=your-elasticsearch-api-key
ELASTICSEARCH_INDEX=your-index-name

# Required: OpenAI Configuration  
OPENAI_API_KEY=your-openai-api-key

# Optional: Advanced Configuration
API_SECRET_KEY=your-jwt-secret-key
ELASTICSEARCH_USE_SEARCH_APPLICATION=true
ELASTICSEARCH_SEARCH_APPLICATION=your-search-app-name
```

### 3. Test Installation (Recommended)

```bash
cd api
python test_imports.py
```

This will verify all imports work and show your current configuration.

### 4. Start the API Server

**Option 1: Using the run script (Recommended)**
```bash
cd api
python run.py
```

**Option 2: Direct uvicorn command**
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Direct Python execution**
```bash
cd api
python main.py
```

The API will be available at:
- **API Endpoints**: http://localhost:8000/api/v1/
- **Interactive Documentation**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with email to get JWT token
- `GET /api/v1/auth/users` - Get available users (dev/demo)
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Search
- `POST /api/v1/search` - Search documents with user context
- `GET /api/v1/search/test-connection` - Test Elasticsearch connection

### LLM Services
- `POST /api/v1/llm/summary` - Generate search result summary
- `POST /api/v1/llm/comprehensive-summary` - Generate detailed document summary
- `POST /api/v1/llm/chat` - Chat with context and conversation history

### Health & Monitoring
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/elasticsearch` - Elasticsearch connection status

## User Authentication Flow

1. **Get Available Users**: `GET /api/v1/auth/users`
2. **Login**: `POST /api/v1/auth/login` with user email
3. **Receive JWT Token**: Use in `Authorization: Bearer <token>` header
4. **Make Authenticated Requests**: All search and LLM endpoints require authentication

### Example Authentication

```bash
# Get available users
curl http://localhost:8000/api/v1/auth/users

# Login as John Smith (CTO)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smith@testbank.com"}'

# Use token in subsequent requests
curl -X POST http://localhost:8000/api/v1/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "risk management", "size": 10}'
```

## User Roles & Permissions

The API includes role-based access control with the following roles:

- **Admin**: System administration access
- **Executive**: Senior leadership access with enhanced search boosting
- **Manager**: Department management access
- **Employee**: Standard user access

User context is automatically included in all search requests for personalized results and role-based boosting.

## Integration with React Frontend

The API is designed to replace the direct Elasticsearch and OpenAI calls in your React application. Key changes needed:

1. **Replace `useElasticsearch` hook** calls with API requests to `/api/v1/search`
2. **Replace `useOpenAI` hook** calls with API requests to `/api/v1/llm/*`
3. **Add authentication flow** using `/api/v1/auth/*` endpoints
4. **Include JWT tokens** in all API requests

## Error Handling & Fallbacks

The API includes comprehensive error handling:

- **Search failures** fall back to demo mode or cached results
- **LLM failures** return informative fallback responses
- **Authentication errors** return clear error messages
- **Connection issues** are logged and return appropriate status codes

## Development vs Production

### Development Features
- Mock user authentication (no passwords required)
- CORS enabled for local React development
- Debug logging enabled
- Auto-reload on code changes

### Production Considerations
- Replace mock authentication with real user database
- Configure proper CORS origins
- Set secure JWT secret keys
- Enable HTTPS/TLS
- Configure logging and monitoring
- Set up proper database for user management

## Monitoring & Logging

The API uses Python's built-in logging with structured log messages. Key events logged:

- Authentication attempts and failures
- Search request details and performance
- LLM API calls and errors
- Elasticsearch connection status
- Error conditions and fallbacks

## Architecture Benefits

1. **Security**: Credentials never exposed to frontend
2. **User Context**: All operations include user identity and permissions
3. **Centralized Logic**: Business logic consolidated in API layer
4. **Scalability**: Can be deployed independently and scaled
5. **Monitoring**: Centralized logging and error tracking
6. **Rate Limiting**: Can implement API rate limiting and quotas
7. **Caching**: Can add response caching for performance

This API layer provides a secure, scalable foundation for your enterprise search application with proper separation of concerns and user-aware functionality.

## Troubleshooting

### Import Errors
If you see `ImportError: attempted relative import with no known parent package`:
- Make sure you're running commands from the `api/` directory
- Use `python test_imports.py` to verify all imports work
- Use `python run.py` instead of direct uvicorn commands

### CORS Configuration Errors  
If you see `error parsing value for field "CORS_ORIGINS"`:
- This has been fixed in the latest version
- Make sure your `.env` file uses comma-separated values: `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- Run `python test_config.py` to verify configuration loading

### API Not Starting
1. Verify dependencies: `pip install -r requirements.txt`
2. Test configuration: `python test_imports.py`
3. Check port availability: `lsof -i :8000`
4. Try alternative startup method: `uvicorn main:app --host 0.0.0.0 --port 8000`