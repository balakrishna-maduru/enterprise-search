// src/components/Results/ResultsSection.js
import React from 'react';
import { Search, Bot, CheckSquare, Square, Sparkles, Download, FileText } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useBranding } from '../../contexts/BrandingContext';
import { generateAISummaryPDF } from '../../utils/pdfGenerator';
import EnhancedResultCard from './EnhancedResultCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import QuickSearchSuggestions from '../Search/QuickSearchSuggestions';

const ResultsSection = ({ showSummaryModal, setShowSummaryModal }) => {
  const {
    searchQuery,
    searchResults,
    selectedResults,
    isLoading,
    isConversationalMode,
    conversationalSummary,
    connectionStatus,
    searchMode,
    toggleResultSelection,
    selectAllResults,
    generateComprehensiveSummary
  } = useSearch();

  const { currentUser } = useUnifiedUser();
  const { getColor, getCompanyName } = useBranding();
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [generatedSummary, setGeneratedSummary] = React.useState('');
  const [isExportingPDF, setIsExportingPDF] = React.useState(false);

  const handleGenerateSummary = async () => {
    if (selectedResults.length === 0) return;

    setIsGeneratingSummary(true);
    try {
      const selectedDocuments = searchResults.filter(result => 
        selectedResults.includes(result.id)
      );
      
      const summary = await generateComprehensiveSummary(selectedDocuments, currentUser);
      setGeneratedSummary(summary);
      setShowSummaryModal(true);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExportPDF = async () => {
    if (!conversationalSummary) return;

    setIsExportingPDF(true);
    try {
      // Prepare data for PDF generation
      const pdfData = {
        searchQuery,
        conversationalSummary,
        searchResults,
        currentUser,
        searchMode,
        connectionStatus,
        companyName: getCompanyName()
      };

      // Generate PDF
      const pdf = generateAISummaryPDF(pdfData);
      
      // Create filename
      const filename = `ai-summary-${searchQuery.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download PDF
      pdf.download(filename);
      
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">
          {isConversationalMode ? 'Analyzing with AI...' : 'Searching Elastic cluster...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show Quick Search Suggestions when no search query */}
      {!searchQuery && (
        <QuickSearchSuggestions />
      )}

      {/* AI-Powered Summary */}
      {conversationalSummary && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Bot className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Summary</h3>
                <p className="text-gray-700 leading-relaxed">{conversationalSummary}</p>
                <div className="mt-3 text-sm text-primary-600">
                  🤖 Generated using AI • Context: {currentUser.name} ({currentUser.position})
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                style={{ backgroundColor: getColor('primary') }}
                title="Export summary as PDF"
              >
                {isExportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Exporting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header with Controls */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              {isConversationalMode ? 
                `Found ${searchResults.length} relevant documents for your question` :
                `Found ${searchResults.length} results from ${searchMode === 'demo' ? 'demo data' : 'Elasticsearch'}`
              }
            </p>
            
            {/* Selection Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={selectAllResults}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {selectedResults.length === searchResults.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {selectedResults.length === searchResults.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              
              {selectedResults.length > 0 && (
                <span className="text-sm text-gray-500">
                  {selectedResults.length} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Summarize Button */}
            {selectedResults.length > 0 && (
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isGeneratingSummary ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summarize Selected ({selectedResults.length})</span>
                  </>
                )}
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              {isConversationalMode ? 'Ranked by AI relevance' : 
               searchMode === 'demo' ? 'Demo data sorted by relevance' : 'Sorted by Elastic score'}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.map((result) => (
        <EnhancedResultCard
          key={result.id}
          result={result}
          isSelected={selectedResults.some(r => r.id === result.id)}
          onSelect={(result) => toggleResultSelection(result)}
        />
      ))}

      {/* No Results State */}
      {searchQuery && searchResults.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Empty State - only show if no search query and no quick suggestions */}
      {!searchQuery && (
        <EmptyState currentUser={currentUser} connectionStatus={connectionStatus} />
      )}

      {/* Pass summary data to modal */}
      {React.cloneElement(
        React.createElement(() => null), 
        { generatedSummary, selectedResults, searchResults }
      )}
    </div>
  );
};

const EmptyState = ({ currentUser, connectionStatus }) => {
  return (
    <div className="text-center py-12">
      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">AI-Powered Enterprise Search</h3>
      <p className="text-gray-500 mb-4">Connect to your Elastic cluster for AI-powered insights</p>
      
      {/* Current User Context */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 max-w-4xl mx-auto mb-6">
        <h4 className="font-medium text-blue-900 mb-3">👤 Current User Context</h4>
        <div className="flex items-center justify-center space-x-4 text-sm text-blue-800">
          <div className={`w-12 h-12 ${currentUser.color} rounded-full flex items-center justify-center text-white text-lg font-semibold`}>
            {currentUser.avatar}
          </div>
          <div className="text-left">
            <div className="font-semibold">{currentUser.name}</div>
            <div>{currentUser.position}</div>
            <div className="text-blue-600">{currentUser.department}</div>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          AI responses are tailored to your role. Click your profile to switch users for testing different perspectives.
        </p>
      </div>
      
      {/* Sample Queries */}
      <div className="bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto">
        <h4 className="font-medium text-gray-900 mb-2">Try AI-powered queries:</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span>🔍</span>
            <span>"What are the critical issues in our payment system?"</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📋</span>
            <span>"Summarize our Q3 roadmap initiatives"</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔧</span>
            <span>"Show me recent database migration tasks"</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>"Analyze our marketing performance data"</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;