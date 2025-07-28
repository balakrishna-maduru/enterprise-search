# Enterprise Search - Demo Applicatio

This application is intended for demo purposes only!

A modern, AI-powered enterprise search application built with React, Elasticsearch Search Applications, and OpenAI integration.

## 🚀 Features

- **Multi-User Support**: Switch between different user profiles with role-based content boosting
- **Elasticsearch Search Applications**: Modern search API with built-in analytics
- **OpenAI Integration**: AI-powered summaries and conversational chat
- **Multi-Document Summarization**: Select and summarize multiple documents
- **Real-time Chat**: Context-aware AI assistant for search results
- **Professional Export**: Download summaries as Markdown reports
- **Responsive Design**: Works across desktop and tablet devices

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.js
│   │   ├── Header.js
│   │   └── ConnectionStatus.js
│   ├── User/
│   │   └── UserSelector.js
│   ├── Search/
│   │   ├── SearchSection.js
│   │   ├── SearchBar.js
│   │   ├── SearchFilters.js
│   │   └── SearchIndicators.js
│   ├── Results/
│   │   ├── ResultsSection.js
│   │   ├── ResultCard.js
│   │   └── ResultsControls.js
│   ├── Chat/
│   │   ├── ChatSidebar.js
│   │   ├── ChatMessage.js
│   │   └── ChatInput.js
│   └── Summary/
│       ├── SummaryModal.js
│       └── SummaryContent.js
├── contexts/
│   ├── UserContext.js
│   └── SearchContext.js
├── hooks/
│   ├── useElasticsearch.js
│   ├── useOpenAI.js
│   └── useChat.js
├── data/
│   ├── users.js
│   └── mockData.js
├── config/
│   └── index.js
├── utils/
│   ├── export.js
│   └── helpers.js
├── styles/
│   └── globals.css
├── App.js
└── index.js
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd enterprise-search
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   REACT_APP_ELASTIC_ENDPOINT=http://localhost:9200
   REACT_APP_ELASTIC_API_KEY=your_elasticsearch_api_key
   REACT_APP_SEARCH_APPLICATION_NAME=enterprise-search
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Elasticsearch Setup

1. **Search Applications**: Create a search application in Elasticsearch:
   ```bash
   PUT /_application/search_application/enterprise-search
   {
     "indices": ["enterprise_documents"],
     "template": {
       "script": {
         "source": {
           "query": {
             "bool": {
               "must": [
                 {
                   "multi_match": {
                     "query": "{{query_string}}",
                     "fields": ["title^3", "content^2", "summary^2"]
                   }
                 }
               ]
             }
           }
         }
       }
     }
   }
   ```

2. **Index Setup**: Ensure your index has the required fields:
   ```json
   {
     "title": "string",
     "content": "text",
     "summary": "text",
     "source": "keyword",
     "author": "keyword",
     "department": "keyword",
     "content_type": "keyword",
     "tags": "keyword",
     "timestamp": "date",
     "url": "keyword"
   }
   ```

### OpenAI Setup

1. **API Key**: Get your API key from OpenAI Dashboard
2. **Model**: Currently configured for `gpt-3.5-turbo`
3. **Rate Limits**: Consider implementing rate limiting for production

## 🎯 Usage

### Basic Search
1. Enter your search query in the search bar
2. Use natural language queries like "What bugs are affecting payments?"
3. Apply filters by source, date range, or content type

### Multi-Document Summarization
1. Select documents using checkboxes
2. Click "Summarize Selected" button
3. Review AI-generated comprehensive summary
4. Export summary as Markdown report

### AI Chat Assistant
1. Click "OpenAI Chat" to open sidebar
2. Ask questions about search results
3. Get context-aware responses based on your role

### User Switching
1. Click user profile in header
2. Select different user from dropdown
3. Experience role-based search boosting

## 🔧 Development

### Adding New Components
```bash
# Create component directory
mkdir src/components/NewFeature

# Create component files
touch src/components/NewFeature/NewFeature.js
touch src/components/NewFeature/index.js
```

### Environment Variables
- `REACT_APP_ELASTIC_ENDPOINT`: Elasticsearch cluster URL
- `REACT_APP_ELASTIC_API_KEY`: Elasticsearch API key
- `REACT_APP_SEARCH_APPLICATION_NAME`: Search application name
- `REACT_APP_OPENAI_API_KEY`: OpenAI API key

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling

## 📦 Building for Production

```bash
# Build optimized bundle
npm run build

# Serve build locally
npx serve -s build
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Ensure Elasticsearch cluster is accessible
- Configure proper CORS settings
- Set up OpenAI API key securely
- Configure reverse proxy if needed

## 🔒 Security Considerations

- API keys should be stored securely
- Implement rate limiting for OpenAI calls
- Use HTTPS in production
- Validate user inputs
- Implement proper authentication
- Secure Elasticsearch cluster access

## 📈 Performance Optimization

- Implement search query debouncing
- Use React.memo for expensive components
- Implement virtual scrolling for large result sets
- Cache search results appropriately
- Optimize bundle size with code splitting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


## 🔄 Changelog

### v1.0.0
- Initial release with full feature set
- Elasticsearch Search Applications integration
- OpenAI-powered summarization
- Multi-user support with role-based boosting
- Comprehensive chat assistant
