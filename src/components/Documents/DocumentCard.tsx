// src/components/Documents/DocumentCard.tsx
import React from 'react';
import { SearchResult } from '../../types';
import { Card, Icon, Button } from '../UI';

interface DocumentCardProps {
  document: SearchResult;
  onClick?: (document: SearchResult) => void;
  onSummarize?: (document: SearchResult) => void;
  onChat?: (document: SearchResult) => void;
  className?: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onClick,
  onSummarize,
  onChat,
  className = '' 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(document);
    }
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

  return (
    <Card 
      variant="bordered" 
      hover 
      onClick={handleClick}
      className={`${className}`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {document.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {document.summary || document.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(document.source)}`}>
              <span className="mr-1">{getSourceIcon(document.source)}</span>
              {document.source}
            </span>
            {document.department && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                🏢 {document.department}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Icon name="user" size="sm" />
                <span>{document.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="document" size="sm" />
                <span>{new Date(document.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            {document.score && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Relevance:</div>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(document.score, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">{Math.round(document.score)}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col gap-2 justify-center sm:justify-start shrink-0">
          {onSummarize && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSummarize(document);
              }}
              className="flex items-center gap-1 text-xs"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summarize
            </Button>
          )}
          {onChat && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChat(document);
              }}
              className="flex items-center gap-1 text-xs"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DocumentCard;
