// src/hooks/useRating.js
import { useState } from 'react';
import { config } from '../config';

export const useRating = () => {
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Submit rating for search results - updates Elasticsearch document
  const submitSearchRating = async (documentId, rating, currentUser, searchQuery) => {
    setIsSubmittingRating(true);
    
    try {
      // Rating values: 1 = thumbs up, 0 = neutral, -1 = thumbs down
      const ratingValue = rating === 'up' ? 1 : rating === 'down' ? -1 : 0;
      
      // Update the document in Elasticsearch with the rating
      const updateBody = {
        script: {
          source: `
            if (ctx._source.ratings == null) {
              ctx._source.ratings = [:]
            }
            if (ctx._source.user_ratings == null) {
              ctx._source.user_ratings = []
            }
            
            // Remove any existing rating from this user
            ctx._source.user_ratings.removeIf(r -> r.user_id == params.user_id);
            
            // Add new rating
            if (params.rating_value != 0) {
              ctx._source.user_ratings.add([
                'user_id': params.user_id,
                'rating': params.rating_value,
                'timestamp': params.timestamp,
                'query': params.query
              ])
            }
            
            // Recalculate overall ratings
            def positive = 0;
            def negative = 0;
            for (rating in ctx._source.user_ratings) {
              if (rating.rating > 0) positive++;
              if (rating.rating < 0) negative++;
            }
            
            ctx._source.ratings.positive_count = positive;
            ctx._source.ratings.negative_count = negative;
            ctx._source.ratings.total_ratings = positive + negative;
            ctx._source.ratings.score = positive + negative > 0 ? 
              (positive - negative) / (positive + negative) : 0;
            ctx._source.ratings.last_updated = params.timestamp;
          `,
          params: {
            user_id: currentUser.id,
            rating_value: ratingValue,
            timestamp: new Date().toISOString(),
            query: searchQuery
          }
        }
      };

      const response = await fetch(
        `${config.elasticsearch.endpoint}/${config.elasticsearch.index}/_update/${documentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
          },
          body: JSON.stringify(updateBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Rating update failed:', response.status, errorText);
        throw new Error(`Failed to update rating: ${response.status}`);
      }

      const result = await response.json();
      console.log('Rating updated successfully:', result);
      
      return { success: true, result };
    } catch (error) {
      console.error('Error submitting search rating:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Submit rating for AI summaries - store locally or send to analytics
  const submitSummaryRating = async (summaryId, rating, currentUser, context) => {
    setIsSubmittingRating(true);
    
    try {
      const ratingData = {
        summary_id: summaryId,
        user_id: currentUser.id,
        user_department: currentUser.department,
        user_position: currentUser.position,
        rating: rating, // 'up', 'down', 'neutral'
        timestamp: new Date().toISOString(),
        context: {
          documents_count: context.documentsCount,
          search_query: context.searchQuery,
          document_sources: context.documentSources
        }
      };

      // Store in localStorage for now (could be sent to analytics service)
      const existingRatings = JSON.parse(localStorage.getItem('summary_ratings') || '[]');
      
      // Remove any existing rating for this summary by this user
      const filteredRatings = existingRatings.filter(
        r => !(r.summary_id === summaryId && r.user_id === currentUser.id)
      );
      
      // Add new rating if not neutral
      if (rating !== 'neutral') {
        filteredRatings.push(ratingData);
      }
      
      localStorage.setItem('summary_ratings', JSON.stringify(filteredRatings));
      
      console.log('Summary rating stored:', ratingData);
      
      // TODO: Send to analytics service
      // await sendToAnalytics('summary_rating', ratingData);
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting summary rating:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Get user's previous rating for a document/summary
  const getUserRating = (itemId, type = 'document') => {
    try {
      if (type === 'summary') {
        const summaryRatings = JSON.parse(localStorage.getItem('summary_ratings') || '[]');
        const userRating = summaryRatings.find(r => r.summary_id === itemId);
        return userRating?.rating || null;
      }
      
      // For document ratings, we'd need to fetch from Elasticsearch or cache
      // For now, return null (could be enhanced to cache user ratings)
      return null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  };

  return {
    submitSearchRating,
    submitSummaryRating,
    getUserRating,
    isSubmittingRating
  };
};