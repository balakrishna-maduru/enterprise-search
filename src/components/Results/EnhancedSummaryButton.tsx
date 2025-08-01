// src/components/Summary/EnhancedSummaryButton.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  Clock, 
  FileCheck,
  User,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SearchResult, User as UserType } from '../../types';

interface EnhancedSummaryButtonProps {
  selectedResults: SearchResult[];
  currentUser: UserType;
  onGenerateSummary: (
    results: SearchResult[], 
    user: UserType, 
    options: SummaryOptions
  ) => Promise<string>;
  isLoading?: boolean;
  className?: string;
}

interface SummaryOptions {
  type: 'quick' | 'detailed' | 'executive';
  format: 'text' | 'markdown' | 'pdf';
  includeMetadata: boolean;
  includeSources: boolean;
  maxLength?: number;
}

const EnhancedSummaryButton: React.FC<EnhancedSummaryButtonProps> = ({
  selectedResults,
  currentUser,
  onGenerateSummary,
  isLoading = false,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const [summaryOptions, setSummaryOptions] = useState<SummaryOptions>({
    type: 'detailed',
    format: 'text',
    includeMetadata: true,
    includeSources: true,
    maxLength: 1000
  });

  const summaryTypes = [
    {
      id: 'quick' as const,
      name: 'Quick Summary',
      description: 'Brief overview in 2-3 sentences',
      icon: <Clock className="w-4 h-4" />,
      time: '~10 seconds',
      maxLength: 300
    },
    {
      id: 'detailed' as const,
      name: 'Detailed Analysis',
      description: 'Comprehensive analysis with key insights',
      icon: <FileCheck className="w-4 h-4" />,
      time: '~30 seconds',
      maxLength: 1000
    },
    {
      id: 'executive' as const,
      name: 'Executive Summary',
      description: 'Strategic overview for leadership',
      icon: <User className="w-4 h-4" />,
      time: '~45 seconds',
      maxLength: 1500
    }
  ];

  const formatOptions = [
    { id: 'text' as const, name: 'Plain Text', icon: '📄' },
    { id: 'markdown' as const, name: 'Markdown', icon: '📝' },
    { id: 'pdf' as const, name: 'PDF Export', icon: '📑' }
  ];

  const handleGenerateSummary = async (options: SummaryOptions) => {
    if (selectedResults.length === 0) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setShowOptions(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const summary = await onGenerateSummary(selectedResults, currentUser, options);
      setLastSummary(summary);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Handle export if needed
      if (options.format !== 'text') {
        await handleExport(summary, options);
      }

      setTimeout(() => {
        setGenerationProgress(0);
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Summary generation failed:', error);
      setGenerationProgress(0);
      setIsGenerating(false);
    }
  };

  const handleExport = async (summary: string, options: SummaryOptions) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `summary-${timestamp}`;

    if (options.format === 'markdown') {
      const markdownContent = formatAsMarkdown(summary, options);
      downloadFile(markdownContent, `${filename}.md`, 'text/markdown');
    } else if (options.format === 'pdf') {
      // For PDF export, we would need a PDF library
      // For now, we'll download as text with PDF instructions
      const pdfContent = formatForPDF(summary, options);
      downloadFile(pdfContent, `${filename}.txt`, 'text/plain');
    }
  };

  const formatAsMarkdown = (summary: string, options: SummaryOptions): string => {
    const metadata = options.includeMetadata ? `
# Knowkute Summary Report

**Generated:** ${new Date().toLocaleDateString()}
**User:** ${currentUser.name}
**Documents Analyzed:** ${selectedResults.length}
**Summary Type:** ${summaryTypes.find(t => t.id === options.type)?.name}

---

` : '';

    const sources = options.includeSources ? `

---

## Sources
${selectedResults.map((result, index) => 
  `${index + 1}. **${result.title}** (${result.source})`
).join('\n')}
` : '';

    return `${metadata}## Summary\n\n${summary}${sources}`;
  };

  const formatForPDF = (summary: string, options: SummaryOptions): string => {
    return `ENTERPRISE SEARCH SUMMARY REPORT
Generated: ${new Date().toLocaleDateString()}
User: ${currentUser.name}
Documents: ${selectedResults.length}

SUMMARY:
${summary}

${options.includeSources ? `
SOURCES:
${selectedResults.map((result, index) => 
  `${index + 1}. ${result.title} (${result.source})`
).join('\n')}
` : ''}

Note: This is a text format. For true PDF export, please copy this content to a PDF converter.`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getButtonIcon = () => {
    if (isGenerating) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (generationProgress === 100) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <Sparkles className="w-4 h-4" />;
  };

  const getButtonText = () => {
    if (isGenerating && generationProgress < 100) {
      return `Generating... ${generationProgress}%`;
    }
    if (generationProgress === 100) {
      return 'Summary Complete!';
    }
    return 'Generate Summary';
  };

  const getButtonStyle = () => {
    if (generationProgress === 100) {
      return 'bg-green-600 hover:bg-green-700 text-white';
    }
    if (isGenerating) {
      return 'bg-blue-500 text-white cursor-wait';
    }
    return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleGenerateSummary(summaryOptions)}
          disabled={selectedResults.length === 0 || isGenerating}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyle()}`}
        >
          {getButtonIcon()}
          <span className="ml-2">{getButtonText()}</span>
          {selectedResults.length > 0 && (
            <span className="ml-1 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
              {selectedResults.length}
            </span>
          )}
        </button>

        {/* Options Button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isGenerating}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Progress Bar */}
      {isGenerating && generationProgress > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Options Panel */}
      {showOptions && !isGenerating && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary Options</h3>
          
          {/* Summary Type */}
          <div className="space-y-3 mb-4">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Summary Type
            </label>
            <div className="space-y-2">
              {summaryTypes.map((type) => (
                <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="summaryType"
                    value={type.id}
                    checked={summaryOptions.type === type.id}
                    onChange={(e) => setSummaryOptions(prev => ({ 
                      ...prev, 
                      type: e.target.value as any,
                      maxLength: type.maxLength 
                    }))}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {type.icon}
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                      <span className="text-xs text-gray-500">{type.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format Options */}
          <div className="space-y-3 mb-4">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Export Format
            </label>
            <div className="flex space-x-2">
              {formatOptions.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSummaryOptions(prev => ({ ...prev, format: format.id }))}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    summaryOptions.format === format.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{format.icon}</span>
                  <span>{format.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3 mb-4">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Include
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={summaryOptions.includeMetadata}
                  onChange={(e) => setSummaryOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Document metadata</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={summaryOptions.includeSources}
                  onChange={(e) => setSummaryOptions(prev => ({ ...prev, includeSources: e.target.checked }))}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Source references</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowOptions(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleGenerateSummary(summaryOptions)}
              disabled={selectedResults.length === 0}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Last Summary Preview */}
      {lastSummary && !isGenerating && !showOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-sm shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-green-500 rounded-full">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-green-800 font-semibold flex items-center space-x-2">
                <span>Summary generated successfully!</span>
                <Sparkles className="w-4 h-4 text-green-600" />
              </p>
              <p className="text-green-700 text-xs mt-1">
                {summaryOptions.format !== 'text' 
                  ? 'File downloaded to your device. Check your downloads folder.' 
                  : 'Summary is now displayed above the search results with enhanced formatting and actions.'}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-green-600">
                <span className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{summaryOptions.type} summary</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{selectedResults.length} documents</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSummaryButton;
