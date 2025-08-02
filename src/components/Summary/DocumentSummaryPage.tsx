// src/components/Summary/DocumentSummaryPage.tsx
import React, { useState, useEffect } from 'react';

interface SummaryRequest {
  searchResults: any[];
  query: string;
}

interface SummaryResponse {
  summary: string;
  sourceDistribution: Record<string, number>;
  confidenceScore: number;
}

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
      let endpoint = '/api/v1/llm/summary';
      let requestBody: any;

      if (summaryType === 'comprehensive' && initialDocument) {
        endpoint = '/api/v1/llm/comprehensive-summary';
        requestBody = {
          selected_documents: [initialDocument]
        };
      } else {
        const resultsToSummarize = initialDocument ? [initialDocument] : searchResults;
        requestBody = {
          query: searchQuery || (initialDocument ? `Summary of ${initialDocument.title}` : 'Summary'),
          search_results: resultsToSummarize.map(result => ({
            title: result.title || 'Untitled',
            summary: result.summary || result.content?.substring(0, 200) || '',
            source: result.source || 'unknown',
            content: result.content || result.summary || '',
            relevance_score: result.score || result.relevance_score || 0.5
          }))
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate summary: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (summaryType === 'comprehensive') {
        setSummary({
          summary: data.summary,
          sourceDistribution: {},
          confidenceScore: 0.8
        });
      } else {
        setSummary(data);
      }
    } catch (err) {
      console.error('Summary generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      
      // Fallback summary
      const fallbackContent = initialDocument 
        ? `Document: ${initialDocument.title}\n\n${initialDocument.summary || initialDocument.content?.substring(0, 500) || 'No content available'}`
        : `Found ${searchResults.length} results for "${searchQuery}". ${searchResults.map(r => r.title).slice(0, 3).join(', ')}`;
      
      setSummary({
        summary: fallbackContent,
        sourceDistribution: {},
        confidenceScore: 0.0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📄 AI Summary</h2>
              <p className="text-blue-100 mt-1">
                {initialDocument 
                  ? `Summary of: ${initialDocument.title}`
                  : `Summary of ${searchResults.length} search results`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Summary Type Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSummaryType('quick')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                summaryType === 'quick' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Quick Summary
            </button>
            <button
              onClick={() => setSummaryType('comprehensive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                summaryType === 'comprehensive' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Comprehensive
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Generating {summaryType} summary...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-semibold">Summary Generation Failed</span>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          ) : null}

          {summary && (
            <div className="space-y-6">
              {/* Main Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summary
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              </div>

              {/* Source Distribution */}
              {Object.keys(summary.sourceDistribution).length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.sourceDistribution).map(([source, count]) => (
                      <span
                        key={source}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {source}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {summary.confidenceScore > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Confidence Score</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${summary.confidenceScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {(summary.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <button
              onClick={generateSummary}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate Summary
            </button>
            
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummaryPage;
