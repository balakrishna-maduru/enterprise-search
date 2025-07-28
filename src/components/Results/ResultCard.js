// src/components/Results/ResultCard.js
import React from 'react';
import { CheckSquare, Square, User, Calendar, ExternalLink } from 'lucide-react';
import SourceIcon from '../Common/SourceIcon';
import RatingButtons from '../Common/RatingButtons';

const ResultCard = ({ result, isSelected, onToggleSelection }) => {
  const getSourceColor = (source) => {
    switch (source) {
      case 'jira': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confluence': return 'bg-green-100 text-green-800 border-green-200';
      case 'sharepoint': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRatingSubmitted = (rating, ratingResult) => {
    console.log(`Document ${result.id} rated as: ${rating}`, ratingResult);
    // Could trigger a refresh or update local state
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Selection Checkbox */}
          <button
            onClick={onToggleSelection}
            className="mt-1 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={isSelected ? 'Deselect document' : 'Select document'}
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-2">
              <SourceIcon source={result.source} />
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 cursor-pointer">
                {result.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSourceColor(result.source)}`}>
                {result.source.toUpperCase()}
              </span>
            </div>
            
            {/* Summary */}
            <p className="text-gray-700 mb-3 leading-relaxed">
              {result.summary}
            </p>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{result.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{result.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-red-600 hover:underline"
                >
                  Open document
                </a>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {result.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Rating Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Was this helpful?</span>
                <RatingButtons
                  type="search"
                  itemId={result.id}
                  context={{
                    title: result.title,
                    source: result.source,
                    relevanceScore: result.relevanceScore
                  }}
                  size="sm"
                  onRatingSubmitted={handleRatingSubmitted}
                />
              </div>
              
              {/* Show current ratings if available */}
              {result.ratings && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {result.ratings.positive_count > 0 && (
                    <span className="text-green-600">
                      👍 {result.ratings.positive_count}
                    </span>
                  )}
                  {result.ratings.negative_count > 0 && (
                    <span className="text-red-600">
                      👎 {result.ratings.negative_count}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Relevance Score */}
        <div className="ml-4 text-right">
          <div className="text-lg font-semibold text-green-600">
            {result.relevanceScore}%
          </div>
          <div className="text-xs text-gray-500">relevance</div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;