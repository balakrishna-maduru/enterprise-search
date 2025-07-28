import { config } from '../config';
import { useAuth } from './useAuth';

export const useApiLLM = () => {
  const { getAuthHeaders, isAuthenticated, user } = useAuth();

  const generateSummary = async (query, searchResults) => {
    if (!isAuthenticated) {
      return generateFallbackSummary(query, searchResults);
    }

    try {
      const response = await fetch(`${config.api.baseUrl}/llm/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          query,
          search_results: searchResults
        })
      });

      if (!response.ok) {
        throw new Error(`Summary API failed: ${response.status}`);
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('API summary error:', error);
      return generateFallbackSummary(query, searchResults);
    }
  };

  const generateComprehensiveSummary = async (selectedDocuments) => {
    if (!isAuthenticated) {
      return generateFallbackComprehensiveSummary(selectedDocuments);
    }

    try {
      const response = await fetch(`${config.api.baseUrl}/llm/comprehensive-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          selected_documents: selectedDocuments
        })
      });

      if (!response.ok) {
        throw new Error(`Comprehensive summary API failed: ${response.status}`);
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('API comprehensive summary error:', error);
      return generateFallbackComprehensiveSummary(selectedDocuments);
    }
  };

  const generateChatResponse = async (userMessage, searchContext = [], currentUser = null, conversationHistory = []) => {
    // Note: currentUser parameter is ignored in API mode since user context comes from JWT token
    if (!isAuthenticated) {
      return generateFallbackChatResponse(userMessage, searchContext, currentUser);
    }

    try {
      const response = await fetch(`${config.api.baseUrl}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          message: userMessage,
          search_context: searchContext,
          conversation_history: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('API chat error:', error);
      return generateFallbackChatResponse(userMessage, searchContext, currentUser);
    }
  };

  // Fallback functions when API is unavailable or user not authenticated
  const generateFallbackSummary = (query, searchResults) => {
    const sources = [...new Set(searchResults.map(r => r.source))];
    return `Found ${searchResults.length} relevant documents across ${sources.join(', ')}. The results include ${searchResults.slice(0, 3).map(r => r.title).join(', ')}. Unable to generate AI summary - please check API connection and authentication.`;
  };

  const generateFallbackComprehensiveSummary = (selectedDocuments) => {
    const sources = [...new Set(selectedDocuments.map(r => r.source))];
    const authors = [...new Set(selectedDocuments.map(r => r.author))];
    
    return `## Summary of ${selectedDocuments.length} Selected Documents

**Sources:** ${sources.join(', ')}
**Authors:** ${authors.join(', ')}
**Date Range:** ${selectedDocuments[0]?.date} - ${selectedDocuments[selectedDocuments.length - 1]?.date}

**Key Documents:**
${selectedDocuments.map((doc, index) => `${index + 1}. **${doc.title}** (${doc.source}) - ${doc.summary.substring(0, 100)}...`).join('\n')}

**Note:** Unable to generate AI-powered summary. Please check API connection and authentication. You can review the individual documents above for detailed information.

**Recommendation:** Review each document individually for complete context and insights relevant to your role${user ? ` as ${user.position}` : ''}.`;
  };

  const generateFallbackChatResponse = (userMessage, searchContext, currentUser = null) => {
    const contextCount = searchContext.length;
    const sources = [...new Set(searchContext.map(r => r.source))];
    
    return `I'm having trouble accessing the AI system right now. Based on the ${contextCount} search results currently displayed, I can see content from ${sources.join(', ')}. Please check your authentication and API connection, or try rephrasing your question.`;
  };

  return {
    generateSummary,
    generateComprehensiveSummary,
    generateChatResponse
  };
};