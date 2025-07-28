// src/components/Summary/SummaryModal.js
import React, { useState, useEffect } from 'react';
import { X, Download, Sparkles, FileText } from 'lucide-react';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useSearch } from '../../contexts/SearchContext';
import { useBranding } from '../../contexts/BrandingContext';
import { generateDocumentSummaryPDF } from '../../utils/pdfGenerator';
import { formatMarkdown } from '../../utils/markdownFormatter';
import SourceIcon from '../Common/SourceIcon';
import RatingButtons from '../Common/RatingButtons';

const SummaryModal = ({ onClose }) => {
  const { currentUser } = useUnifiedUser();
  const { searchResults, selectedResults, searchQuery, generateComprehensiveSummary } = useSearch();
  const { getCompanyName, getColor } = useBranding();
  
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [summaryId, setSummaryId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Generate summary when modal opens
  useEffect(() => {
    if (selectedResults.length > 0) {
      handleGenerateSummary();
    }
  }, [selectedResults]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    
    // Generate unique ID for this summary
    const newSummaryId = `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSummaryId(newSummaryId);
    
    try {
      const selectedDocuments = searchResults.filter(result => 
        selectedResults.includes(result.id)
      );
      
      const summary = await generateComprehensiveSummary(selectedDocuments, currentUser);
      setGeneratedSummary(summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!generatedSummary) return;
    
    setIsExporting(true);
    try {
      const selectedDocuments = searchResults.filter(result => 
        selectedResults.includes(result.id)
      );
      
      // Prepare data for PDF generation
      const pdfData = {
        searchQuery,
        generatedSummary,
        selectedDocuments,
        currentUser,
        companyName: getCompanyName()
      };

      // Generate PDF
      const pdf = generateDocumentSummaryPDF(pdfData);
      
      // Create filename
      const filename = `summary-report-${searchQuery.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download PDF
      pdf.download(filename);
      
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedDocuments = searchResults.filter(result => 
    selectedResults.includes(result.id)
  );

  const getSourceColor = (source) => {
    switch (source) {
      case 'jira': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confluence': return 'bg-green-100 text-green-800 border-green-200';
      case 'sharepoint': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSummaryRating = (rating, ratingResult) => {
    console.log(`Summary ${summaryId} rated as: ${rating}`, ratingResult);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6" style={{ color: getColor('primary') }} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Generated Summary</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive analysis of {selectedResults.length} selected documents for {currentUser.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                disabled={!generatedSummary || isGenerating || isExporting}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: getColor('primary') }}
                title="Export summary as PDF"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: getColor('primary') }}></div>
              <span className="ml-3 text-gray-600">Generating comprehensive summary...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-red-800">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
              <button
                onClick={handleGenerateSummary}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Generated Summary with Markdown Formatting */}
          {generatedSummary && !isGenerating && (
            <div className="mb-8">
              <div className="prose prose-gray max-w-none">
                {formatMarkdown(generatedSummary)}
              </div>
              
              {/* Summary Rating */}
              {summaryId && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">How helpful was this summary?</span>
                      <RatingButtons
                        type="summary"
                        itemId={summaryId}
                        context={{
                          documentsCount: selectedResults.length,
                          searchQuery: searchQuery,
                          documentSources: [...new Set(selectedDocuments.map(d => d.source))],
                          userDepartment: currentUser.department,
                          userPosition: currentUser.position
                        }}
                        size="md"
                        onRatingSubmitted={handleSummaryRating}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Your feedback helps improve AI summaries
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Source Documents */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Source Documents ({selectedResults.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDocuments.map((result) => (
                <SummaryDocumentCard key={result.id} result={result} getSourceColor={getSourceColor} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryDocumentCard = ({ result, getSourceColor }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start space-x-3">
        <SourceIcon source={result.source} />
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-gray-900 truncate">{result.title}</h5>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {result.summary.substring(0, 100)}...
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
            <span>{result.author}</span>
            <span>•</span>
            <span>{result.date}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full ${getSourceColor(result.source)}`}>
              {result.source}
            </span>
            <span>•</span>
            <span className="text-green-600 font-medium">{result.relevanceScore}%</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {result.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
            {result.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{result.tags.length - 3} more</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;