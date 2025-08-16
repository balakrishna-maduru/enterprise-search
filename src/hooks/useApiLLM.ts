// src/hooks/useApiLLM.ts
import { UseLLMReturn, SearchResult, User } from '../types';
import { apiClient } from '../services/api_client';

export const useApiLLM = (): UseLLMReturn => {
  const generateSummary = async (
    query: string, 
    results: SearchResult[], 
    _user: User
  ): Promise<string> => {
    console.log('Generating summary via backend for query:', query, 'results:', results.length);
    const requestBody = {
      query,
      search_results: results.map(r => ({
        title: r.title,
        summary: r.summary || r.content?.slice(0, 200) || '',
        source: r.source || 'unknown',
        content: r.content || '',
        relevance_score: r.score || 0
      }))
    };
    const resp = await apiClient.generateSummary(requestBody);
    if (!resp.success) throw new Error(resp.error || 'Summary API error');
    return resp.data.summary;
  };

  const generateComprehensiveSummary = async (
    results: SearchResult[], 
    _user: User
  ): Promise<string> => {
    console.log('Generating comprehensive summary via backend for', results.length, 'results');
    const resp = await apiClient.generateComprehensiveSummary(results);
    if (!resp.success) throw new Error(resp.error || 'Comprehensive summary API error');
    return resp.data.summary;
  };

  const generateChatResponse = async (
    message: string, 
    context: SearchResult[], 
    _user: User
  ): Promise<string> => {
    console.log('Generating chat response via backend:', message, 'context:', context.length);
    // Delegate to chatApiService if implemented; for now return minimal text
    try {
      const resp = await apiClient.generateSummary({
        query: message,
        search_results: context.map(r => ({
          title: r.title,
          summary: r.summary || '',
          source: r.source || 'unknown',
          content: r.content || '',
          relevance_score: r.score || 0
        }))
      });
      if (resp.success) return resp.data.summary;
      throw new Error(resp.error || 'Chat API error');
    } catch (e) {
      throw e instanceof Error ? e : new Error('Chat API error');
    }
  };

  return {
    generateSummary,
    generateComprehensiveSummary,
    generateChatResponse
  };
};
