// src/components/Search/QuickSearchSuggestions.js
import React from 'react';
import { Clock, TrendingUp, Star } from 'lucide-react';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useSearch } from '../../contexts/SearchContext';

const QuickSearchSuggestions = () => {
  const { executeSearch } = useSearch();
  const { getRecentSearches, getPopularSearches } = useSavedSearches();

  const recentSearches = getRecentSearches(3);
  const popularSearches = getPopularSearches(3);

  // Predefined quick searches for common banking queries
  const quickSearches = [
    {
      id: 'payment-issues',
      name: 'Payment Issues',
      query: 'payment processing bug error failure',
      icon: '💳',
      description: 'Find payment system issues and bugs'
    },
    {
      id: 'api-documentation',
      name: 'API Documentation',
      query: 'API integration documentation endpoint',
      icon: '🔧',
      description: 'API guides and integration docs'
    },
    {
      id: 'security-compliance',
      name: 'Security & Compliance',
      query: 'security compliance audit policy',
      icon: '🔒',
      description: 'Security policies and compliance docs'
    },
    {
      id: 'customer-issues',
      name: 'Customer Issues',
      query: 'customer support issue complaint',
      icon: '👥',
      description: 'Customer-related tickets and issues'
    },
    {
      id: 'database-migration',
      name: 'Database Migration',
      query: 'database migration task upgrade',
      icon: '🗄️',
      description: 'Database migration and upgrade tasks'
    },
    {
      id: 'mobile-banking',
      name: 'Mobile Banking',
      query: 'mobile app banking feature',
      icon: '📱',
      description: 'Mobile banking app features and issues'
    }
  ];

  const handleQuickSearch = (query) => {
    executeSearch(query);
  };

  const handleSavedSearch = (savedSearch) => {
    executeSearch(savedSearch.query, savedSearch.filters);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Searches */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Quick Searches</h3>
          </div>
          <div className="space-y-2">
            {quickSearches.slice(0, 4).map((search) => (
              <button
                key={search.id}
                onClick={() => handleQuickSearch(search.query)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{search.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-red-700">
                      {search.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {search.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Recent Searches</h3>
          </div>
          <div className="space-y-2">
            {recentSearches.length > 0 ? (
              recentSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleSavedSearch(search)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                    {search.name}
                  </div>
                  <div className="text-sm text-blue-600 font-mono truncate mt-1">
                    "{search.query}"
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Used {search.useCount} times
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No recent searches yet
              </div>
            )}
          </div>
        </div>

        {/* Popular Searches */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Popular Searches</h3>
          </div>
          <div className="space-y-2">
            {popularSearches.length > 0 ? (
              popularSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleSavedSearch(search)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-green-700 truncate">
                    {search.name}
                  </div>
                  <div className="text-sm text-green-600 font-mono truncate mt-1">
                    "{search.query}"
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Used {search.useCount} times
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No popular searches yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Quick Searches */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">More Quick Searches</h4>
        <div className="flex flex-wrap gap-2">
          {quickSearches.slice(4).map((search) => (
            <button
              key={search.id}
              onClick={() => handleQuickSearch(search.query)}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
            >
              <span>{search.icon}</span>
              <span>{search.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickSearchSuggestions;