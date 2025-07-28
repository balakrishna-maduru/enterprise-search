// src/components/Common/RatingButtons.js
import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from 'lucide-react';
import { useRating } from '../../hooks/useRating';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useSearch } from '../../contexts/SearchContext';

const RatingButtons = ({ 
  type, // 'search' or 'summary'
  itemId, 
  context = {}, // Additional context for ratings
  size = 'sm',
  onRatingSubmitted
}) => {
  const { currentUser } = useUnifiedUser();
  const { searchQuery } = useSearch();
  const { submitSearchRating, submitSummaryRating, getUserRating, isSubmittingRating } = useRating();
  
  const [currentRating, setCurrentRating] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Load existing rating on component mount
  useEffect(() => {
    const existingRating = getUserRating(itemId, type);
    setCurrentRating(existingRating);
  }, [itemId, type]);

  const handleRating = async (rating) => {
    if (isSubmittingRating) return;
    
    // Toggle rating if same button clicked
    const newRating = currentRating === rating ? 'neutral' : rating;
    setCurrentRating(newRating);
    
    try {
      let result;
      
      if (type === 'search') {
        result = await submitSearchRating(itemId, newRating, currentUser, searchQuery);
      } else if (type === 'summary') {
        result = await submitSummaryRating(itemId, newRating, currentUser, context);
      }
      
      if (result.success) {
        setFeedbackMessage(
          newRating === 'up' ? 'Thanks for the positive feedback!' :
          newRating === 'down' ? 'Thanks for the feedback. We\'ll work to improve this.' :
          'Rating removed'
        );
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
        
        if (onRatingSubmitted) {
          onRatingSubmitted(newRating, result);
        }
      } else {
        throw new Error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setCurrentRating(currentRating); // Revert on error
      setFeedbackMessage('Failed to submit rating. Please try again.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

  const getButtonClasses = (rating) => {
    const isActive = currentRating === rating;
    const baseClasses = size === 'sm' 
      ? 'p-1 rounded hover:bg-gray-100 transition-colors'
      : 'p-2 rounded-lg hover:bg-gray-100 transition-colors';
    
    if (isActive) {
      return `${baseClasses} ${
        rating === 'up' ? 'bg-green-100 text-green-600' :
        rating === 'down' ? 'bg-red-100 text-red-600' :
        'bg-gray-200 text-gray-600'
      }`;
    }
    
    return `${baseClasses} text-gray-400 hover:text-gray-600`;
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        {/* Thumbs Up */}
        <button
          onClick={() => handleRating('up')}
          disabled={isSubmittingRating}
          className={getButtonClasses('up')}
          title="Helpful"
          aria-label="Rate as helpful"
        >
          {isSubmittingRating && currentRating === 'up' ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <ThumbsUp className={iconSize} />
          )}
        </button>

        {/* Neutral */}
        <button
          onClick={() => handleRating('neutral')}
          disabled={isSubmittingRating}
          className={getButtonClasses('neutral')}
          title="Neutral"
          aria-label="Rate as neutral"
        >
          {isSubmittingRating && currentRating === 'neutral' ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <Minus className={iconSize} />
          )}
        </button>

        {/* Thumbs Down */}
        <button
          onClick={() => handleRating('down')}
          disabled={isSubmittingRating}
          className={getButtonClasses('down')}
          title="Not helpful"
          aria-label="Rate as not helpful"
        >
          {isSubmittingRating && currentRating === 'down' ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <ThumbsDown className={iconSize} />
          )}
        </button>
      </div>

      {/* Feedback Message */}
      {showFeedback && (
        <div className="absolute top-full left-0 mt-1 z-10">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {feedbackMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingButtons;