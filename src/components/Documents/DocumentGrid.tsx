// src/components/Documents/DocumentGrid.tsx
import React from 'react';
import { SearchResult } from '../../types';
import DocumentCard from './DocumentCard';

interface DocumentGridProps {
  documents: SearchResult[];
  onDocumentClick?: (document: SearchResult) => void;
  onSummarizeDocument?: (document: SearchResult) => void;
  onChatWithDocument?: (document: SearchResult) => void;
  isLoading?: boolean;
  className?: string;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  onDocumentClick,
  onSummarizeDocument,
  onChatWithDocument,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32 w-full" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-500">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {documents.slice(0, 10).map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onClick={onDocumentClick}
          onSummarize={onSummarizeDocument}
          onChat={onChatWithDocument}
          className="w-full"
        />
      ))}
    </div>
  );
};

export default DocumentGrid;
