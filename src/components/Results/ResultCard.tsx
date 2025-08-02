// src/components/Results/ResultCard.tsx
import React from 'react';
import { SearchResult } from '../../types';
import { Card, Icon, Button } from '../UI';

interface ResultCardProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  isSelected,
  onSelect,
  className = ''
}) => {
  const handleSelect = () => {
    onSelect(result);
  };

  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      confluence: 'bg-blue-100 text-blue-800',
      jira: 'bg-green-100 text-green-800',
      sharepoint: 'bg-purple-100 text-purple-800',
      wiki: 'bg-yellow-100 text-yellow-800',
      email: 'bg-gray-100 text-gray-800'
    };
    return colors[source.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: string): string => {
    const icons: Record<string, string> = {
      confluence: '📄',
      jira: '🎫',
      sharepoint: '📁',
      wiki: '📚',
      email: '📧'
    };
    return icons[source.toLowerCase()] || '📄';
  };

  return (
    <Card 
      variant={isSelected ? 'elevated' : 'bordered'} 
      className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-red-500' : 'hover:shadow-md'} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {result.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {result.summary || result.content}
          </p>
        </div>
        <Button
          variant={isSelected ? 'primary' : 'outline'}
          size="sm"
          onClick={handleSelect}
          className="flex-shrink-0"
        >
          {isSelected ? (
            <Icon name="close" size="sm" />
          ) : (
            <Icon name="document" size="sm" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(result.source)}`}>
          <span className="mr-1">{getSourceIcon(result.source)}</span>
          {result.source}
        </span>
        {result.department && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            🏢 {result.department}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Icon name="user" size="sm" />
          <span>{result.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="document" size="sm" />
          <span>{new Date(result.timestamp).toLocaleDateString()}</span>
        </div>
      </div>

      {result.score && (
        <div className="mt-3 flex items-center">
          <div className="text-xs text-gray-500 mr-2">Relevance:</div>
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(result.score, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 ml-2">{Math.round(result.score)}%</div>
        </div>
      )}
    </Card>
  );
};

export default ResultCard;
