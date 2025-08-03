// src/components/Summary/DocumentSummaryPage.tsx
import React, { useState, useEffect } from 'react';
import { SummaryResponse } from '../../services/api_client';
import { summaryService } from '../../services/summary_service';
import { 
  SummaryHeader, 
  LoadingSpinner, 
  ErrorMessage, 
  SummaryContent, 
  SummaryFooter 
} from '../UI';

interface DocumentSummaryPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: any;
  searchResults?: any[];
  searchQuery?: string;
}

const DocumentSummaryPage: React.FC<DocumentSummaryPageProps> = ({ 
  isOpen, 
  onClose, 
  initialDocument,
  searchResults = [],
  searchQuery = ''
}) => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState<'quick' | 'comprehensive'>('quick');

  useEffect(() => {
    if (isOpen && (searchResults.length > 0 || initialDocument)) {
      generateSummary();
    }
  }, [isOpen, searchResults, initialDocument, summaryType]);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await summaryService.generateSummary(
        summaryType,
        searchResults,
        searchQuery || (initialDocument ? `Summary of ${initialDocument.title}` : 'Summary'),
        initialDocument
      );

      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        throw new Error(result.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Summary generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      
      // Fallback summary
      const fallbackSummary = summaryService.createFallbackSummary(
        searchResults,
        searchQuery || (initialDocument ? `Summary of ${initialDocument.title}` : 'Summary'),
        initialDocument
      );
      setSummary(fallbackSummary);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        <SummaryHeader
          initialDocument={initialDocument}
          searchResults={searchResults}
          summaryType={summaryType}
          setSummaryType={setSummaryType}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <LoadingSpinner 
              message={`Generating ${summaryType} summary...`} 
            />
          )}

          {error && (
            <ErrorMessage 
              title="Summary Generation Failed"
              message={error}
            />
          )}

          {summary && (
            <SummaryContent summary={summary} />
          )}
        </div>

        <SummaryFooter
          onRegenerate={generateSummary}
          onClose={onClose}
          isLoading={isLoading}
        />

      </div>
    </div>
  );
};

export default DocumentSummaryPage;
