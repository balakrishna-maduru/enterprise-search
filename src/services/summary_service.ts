// src/services/summary_service.ts
import { apiClient, SummaryRequest, SummaryResponse } from './api_client';

export class SummaryService {
  // Summarize a document by index and docId using the new backend endpoint
  async summarizeById(index: string, docId: string): Promise<{ success: boolean; data?: string; error?: string }> {
    // MOCK: Return a fake summary string for now, do not call backend
    return {
      success: true,
      data: `This is a mock summary for document ID ${docId} in index ${index}. (No LLM or backend call made.)`
    };
  }
  
  async generateQuickSummary(
    searchResults: any[], 
    searchQuery: string, 
    initialDocument?: any
  ): Promise<{ success: boolean; data?: SummaryResponse; error?: string }> {
    try {
      const resultsToSummarize = initialDocument ? [initialDocument] : searchResults;
      const requestBody: SummaryRequest = {
        query: searchQuery || (initialDocument ? `Summary of ${initialDocument.title}` : 'Summary'),
        search_results: resultsToSummarize.map(result => ({
          title: result.title || 'Untitled',
          summary: result.summary || result.content?.substring(0, 200) || '',
          source: result.source || 'unknown',
          content: result.content || result.summary || '',
          relevance_score: result.score || result.relevance_score || 0.5
        }))
      };

      const response = await apiClient.generateSummary(requestBody);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to generate summary' };
      }
    } catch (error) {
      console.error('Quick summary generation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate summary' 
      };
    }
  }

  async generateComprehensiveSummary(
    initialDocument: any
  ): Promise<{ success: boolean; data?: SummaryResponse; error?: string }> {
    try {
      const response = await apiClient.generateComprehensiveSummary([initialDocument]);
      
      if (response.success) {
        return {
          success: true,
          data: {
            summary: response.data.summary,
            sourceDistribution: {},
            confidenceScore: 0.8
          }
        };
      } else {
        return { success: false, error: response.error || 'Failed to generate comprehensive summary' };
      }
    } catch (error) {
      console.error('Comprehensive summary generation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate comprehensive summary' 
      };
    }
  }

  createFallbackSummary(
    searchResults: any[], 
    searchQuery: string, 
    initialDocument?: any
  ): SummaryResponse {
    const fallbackContent = initialDocument 
      ? `Document: ${initialDocument.title}\n\n${initialDocument.summary || initialDocument.content?.substring(0, 500) || 'No content available'}`
      : `Found ${searchResults.length} results for "${searchQuery}". ${searchResults.map(r => r.title).slice(0, 3).join(', ')}`;
    
    return {
      summary: fallbackContent,
      sourceDistribution: {},
      confidenceScore: 0.0
    };
  }

  async generateSummary(
    summaryType: 'quick' | 'comprehensive',
    searchResults: any[],
    searchQuery: string,
    initialDocument?: any
  ): Promise<{ success: boolean; data?: SummaryResponse; error?: string }> {
    if (summaryType === 'comprehensive' && initialDocument) {
      return this.generateComprehensiveSummary(initialDocument);
    } else {
      return this.generateQuickSummary(searchResults, searchQuery, initialDocument);
    }
  }
}

// Create singleton instance
export const summaryService = new SummaryService();
