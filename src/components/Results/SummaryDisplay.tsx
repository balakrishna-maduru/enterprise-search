// src/components/Summary/SummaryDisplay.tsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Share, 
  X, 
  CheckCircle,
  Clock,
  User,
  TrendingUp,
  BarChart3,
  Sparkles,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface SummaryDisplayProps {
  summary: string;
  metadata?: {
    type: 'quick' | 'detailed' | 'executive';
    documentsCount: number;
    generatedAt: Date;
    userLn?: string;
    sources?: string[];
  };
  onClose?: () => void;
  className?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  metadata,
  onClose,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getSummaryIcon = () => {
    if (!metadata) return <Sparkles className="w-6 h-6 text-blue-600" />;
    
    switch (metadata.type) {
      case 'quick':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'detailed':
        return <BarChart3 className="w-6 h-6 text-green-600" />;
      case 'executive':
        return <TrendingUp className="w-6 h-6 text-purple-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  const getSummaryConfig = () => {
    if (!metadata) return {
      label: 'AI Summary',
      color: 'blue',
      bgGradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    };
    
    switch (metadata.type) {
      case 'quick':
        return {
          label: 'Quick Summary',
          color: 'blue',
          bgGradient: 'from-blue-500 to-cyan-600',
          bgLight: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'detailed':
        return {
          label: 'Detailed Analysis',
          color: 'green',
          bgGradient: 'from-green-500 to-emerald-600',
          bgLight: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'executive':
        return {
          label: 'Executive Summary',
          color: 'purple',
          bgGradient: 'from-purple-500 to-violet-600',
          bgLight: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          label: 'AI Summary',
          color: 'blue',
          bgGradient: 'from-blue-500 to-indigo-600',
          bgLight: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
    }
  };

  const getSummaryTypeLabel = () => {
    return getSummaryConfig().label;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `summary-${timestamp}.txt`;
    
    const content = metadata ? `
${getSummaryTypeLabel()}
Generated: ${metadata.generatedAt.toLocaleDateString()}
Documents: ${metadata.documentsCount}
${metadata.userLn ? `User: ${metadata.userLn}` : ''}

${summary}

${metadata.sources ? `
Sources:
${metadata.sources.map((source, index) => `${index + 1}. ${source}`).join('\n')}
` : ''}
`.trim() : summary;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getSummaryTypeLabel(),
          text: summary,
        });
      } catch (error) {
        console.error('Share failed:', error);
        handleCopy(); // Fallback to copy
      }
    } else {
      handleCopy(); // Fallback for browsers without Web Share API
    }
  };

  return (
    <div className={`
      relative
      transform transition-all duration-500 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      bg-white 
      border-2 ${getSummaryConfig().borderColor}
      rounded-xl 
      shadow-xl 
      hover:shadow-2xl 
      transition-shadow
      ${className}
    `}>
      {/* Decorative gradient top border */}
      <div className={`h-1 bg-gradient-to-r ${getSummaryConfig().bgGradient} rounded-t-xl`} />
      
      {/* Header with enhanced styling */}
      <div className={`${getSummaryConfig().bgLight} px-6 py-4 border-b ${getSummaryConfig().borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Enhanced icon with background */}
            <div className={`
              p-3 rounded-xl bg-gradient-to-r ${getSummaryConfig().bgGradient} 
              shadow-lg transform hover:scale-105 transition-transform
            `}>
              <div className="text-white">
                {getSummaryIcon()}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-xl font-bold ${getSummaryConfig().textColor}`}>
                  {getSummaryTypeLabel()}
                </h3>
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getSummaryConfig().bgLight} ${getSummaryConfig().textColor}
                  border ${getSummaryConfig().borderColor}
                `}>
                  AI Generated
                </div>
              </div>
              {metadata && (
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Generated {metadata.generatedAt.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {metadata.documentsCount} document{metadata.documentsCount !== 1 ? 's' : ''}
                  </p>
                  {metadata.userLn && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {metadata.userLn}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced action buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleCopy}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${copied 
                  ? 'bg-green-100 text-green-600 border border-green-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Download as file"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Share summary"
            >
              <Share className="w-5 h-5" />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Close summary"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="p-6">
        {/* Summary content with better typography */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-line font-medium">
            {summary}
          </div>
        </div>
        
        {/* Key highlights section if it's a detailed summary */}
        {metadata?.type === 'detailed' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-700">Key Insights</h4>
            </div>
            <p className="text-sm text-gray-600">
              This analysis covers {metadata.documentsCount} documents with comprehensive insights and recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Footer with metadata */}
      {metadata?.sources && metadata.sources.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-700">Sources Referenced</h4>
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${getSummaryConfig().bgLight} ${getSummaryConfig().textColor}
              border ${getSummaryConfig().borderColor}
            `}>
              {metadata.sources.length} source{metadata.sources.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {metadata.sources.slice(0, 6).map((source, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs text-gray-600 bg-white p-2 rounded border">
                <span className={`
                  flex-shrink-0 w-5 h-5 rounded-full 
                  ${getSummaryConfig().bgLight} ${getSummaryConfig().textColor}
                  flex items-center justify-center text-xs font-bold
                `}>
                  {index + 1}
                </span>
                <span className="truncate">{source}</span>
              </div>
            ))}
          </div>
          {metadata.sources.length > 6 && (
            <div className="text-xs text-gray-500 italic mt-2 text-center">
              And {metadata.sources.length - 6} more source{metadata.sources.length - 6 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Enhanced copy feedback with better positioning */}
      {copied && (
        <div className="absolute top-4 right-20 z-10">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transform animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryDisplay;
