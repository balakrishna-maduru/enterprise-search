// src/config/index.js
export const config = {
  // API Configuration - New Python API layer
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
    useApiLayer: process.env.REACT_APP_USE_API_LAYER !== 'false' // defaults to true
  },
  // Legacy direct configurations (kept for fallback)
  elasticsearch: {
    endpoint: process.env.REACT_APP_ELASTIC_ENDPOINT || 'http://localhost:9200',
    searchApplicationName: process.env.REACT_APP_SEARCH_APPLICATION_NAME || 'enterprise-search',
    index: process.env.REACT_APP_ELASTIC_INDEX || 'enterprise_documents',
    apiKey: process.env.REACT_APP_ELASTIC_API_KEY || '',
    useSearchApplication: process.env.REACT_APP_USE_SEARCH_APPLICATION !== 'false', // defaults to true
    // Semantic search configuration
    semanticEnabled: process.env.REACT_APP_SEMANTIC_ENABLED === 'true', // defaults to false
    semanticModel: process.env.REACT_APP_SEMANTIC_MODEL || '.multilingual-e5-small', // e5 model
    semanticFieldPrefix: process.env.REACT_APP_SEMANTIC_FIELD_PREFIX || 'semantic_',
    hybridSearchWeight: parseFloat(process.env.REACT_APP_HYBRID_WEIGHT || '0.7') // 0.7 semantic, 0.3 lexical
  },
  openai: {
    endpoint: process.env.REACT_APP_OPENAI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-3.5-turbo'
  },
  app: {
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    debug: process.env.REACT_APP_DEBUG === 'true'
  }
};

export const getRoleBoosts = (user) => {
  const boostConfig = {
    department_boost: 1.5,
    content_type_boosts: {},
    source_boosts: {}
  };

  switch (user.department) {
    case 'Engineering':
      boostConfig.content_type_boosts = {
        'ticket': 2.0,
        'task': 1.8,
        'document': 1.2
      };
      boostConfig.source_boosts = {
        'jira': 2.0,
        'confluence': 1.5,
        'sharepoint': 1.0
      };
      break;
    case 'Digital Banking':
      boostConfig.content_type_boosts = {
        'document': 2.0,
        'ticket': 1.5,
        'task': 1.3
      };
      boostConfig.source_boosts = {
        'confluence': 2.0,
        'sharepoint': 1.8,
        'jira': 1.2
      };
      break;
    case 'Marketing':
      boostConfig.content_type_boosts = {
        'document': 2.0,
        'analytics': 1.8,
        'campaign': 1.9
      };
      boostConfig.source_boosts = {
        'sharepoint': 2.0,
        'confluence': 1.5,
        'jira': 1.0
      };
      break;
    case 'Information Security':
      boostConfig.content_type_boosts = {
        'policy': 2.0,
        'incident': 1.9,
        'audit': 1.8
      };
      boostConfig.source_boosts = {
        'confluence': 1.8,
        'jira': 1.7,
        'sharepoint': 1.5
      };
      break;
    default:
      boostConfig.content_type_boosts = {
        'document': 1.5,
        'ticket': 1.3,
        'task': 1.2
      };
      boostConfig.source_boosts = {
        'confluence': 1.5,
        'jira': 1.3,
        'sharepoint': 1.4
      };
  }

  return boostConfig;
};