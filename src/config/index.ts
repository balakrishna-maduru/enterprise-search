// Application configuration
export const config = {
  api: {
    baseUrl: 'http://localhost:8000/api/v1',
    useApiLayer: true,
    timeout: 30000,
  },
  search: {
    defaultSize: 20,
    maxSize: 100,
  },
  elasticsearch: {
    index: 'enterprise_search',
    endpoint: 'http://localhost:9200',
    apiKey: undefined,
  },
  ui: {
    theme: 'light',
    enableDebug: process.env.NODE_ENV === 'development',
  },
} as const;

export type Config = typeof config;

// Role boosts for search relevance
export const getRoleBoosts = () => ({
  'CEO': 10,
  'CTO': 8,
  'VP': 6,
  'Director': 4,
  'Manager': 2,
  'Senior': 1.5,
  'default': 1
});

export default config;
