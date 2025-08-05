// src/services/document_tracking_service.ts
import { UserService } from './user_service';

export interface DocumentViewEvent {
  documentId: string;
  documentTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  viewTime: string;
  action: 'view' | 'summarize' | 'chat';
  sessionId?: string;
  timestamp: number;
}

export interface DocumentViewStats {
  documentId: string;
  documentTitle: string;
  totalViews: number;
  lastViewed: string;
  viewHistory: DocumentViewEvent[];
}

export interface UserViewStats {
  userId: string;
  lastViewedDocumentId: string | null;
  lastViewedDocumentTitle: string | null;
  lastViewTime: string | null;
  totalDocumentsViewed: number;
  totalViews: number;
}

class DocumentTrackingService {
  private static instance: DocumentTrackingService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_ELASTICSEARCH_URL || 'http://localhost:9200';
  }

  static getInstance(): DocumentTrackingService {
    if (!DocumentTrackingService.instance) {
      DocumentTrackingService.instance = new DocumentTrackingService();
    }
    return DocumentTrackingService.instance;
  }

  /**
   * Track a document view/interaction by sending to Elasticsearch
   */
  async trackDocumentView(
    documentId: string, 
    documentTitle: string, 
    action: 'view' | 'summarize' | 'chat' = 'view'
  ): Promise<void> {
    try {
      const currentUser = UserService.getCurrentUser();
      if (!currentUser) {
        console.warn('No current user found for document tracking');
        return;
      }

      const viewEvent: DocumentViewEvent = {
        documentId,
        documentTitle,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        viewTime: new Date().toISOString(),
        action,
        sessionId: this.getSessionId(),
        timestamp: Date.now()
      };

      // Send to Elasticsearch asynchronously
      await this.sendToElasticsearch(viewEvent);

      console.log(`📊 Document tracking: ${action} event recorded for document "${documentTitle}" by user ${currentUser.name}`);
    } catch (error) {
      console.error('Error tracking document view:', error);
    }
  }

  /**
   * Send view event to Elasticsearch document_views index
   */
  private async sendToElasticsearch(viewEvent: DocumentViewEvent): Promise<void> {
    try {
      const indexName = 'document_views';
      // Use document ID with timestamp to create unique ID for each view event
      const viewEventId = `${viewEvent.documentId}_${viewEvent.timestamp}`;
      const url = `${this.baseUrl}/${indexName}/_doc/${viewEventId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viewEvent)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ View event sent to Elasticsearch with ID: ${viewEventId}`);
      
    } catch (error) {
      console.error('Failed to send view event to Elasticsearch:', error);
      // Fallback: store in localStorage for retry later
      this.storeFailedEvent(viewEvent);
    }
  }

  /**
   * Store failed events in localStorage for potential retry
   */
  private storeFailedEvent(viewEvent: DocumentViewEvent): void {
    try {
      const failedEvents = JSON.parse(localStorage.getItem('failed_view_events') || '[]');
      failedEvents.push(viewEvent);
      
      // Keep only last 50 failed events to prevent storage bloat
      const limitedEvents = failedEvents.slice(-50);
      localStorage.setItem('failed_view_events', JSON.stringify(limitedEvents));
      
      console.log('� Stored failed view event for later retry');
    } catch (error) {
      console.error('Failed to store event in localStorage:', error);
    }
  }

  /**
   * Retry failed events (can be called periodically)
   */
  async retryFailedEvents(): Promise<void> {
    try {
      const failedEvents = JSON.parse(localStorage.getItem('failed_view_events') || '[]');
      
      if (failedEvents.length === 0) {
        return;
      }

      console.log(`🔄 Retrying ${failedEvents.length} failed view events`);
      
      const successfulRetries: number[] = [];
      
      for (let i = 0; i < failedEvents.length; i++) {
        try {
          await this.sendToElasticsearch(failedEvents[i]);
          successfulRetries.push(i);
        } catch (error) {
          console.error(`Failed to retry event ${i}:`, error);
        }
      }

      // Remove successfully retried events
      if (successfulRetries.length > 0) {
        const remainingEvents = failedEvents.filter((_: any, index: number) => !successfulRetries.includes(index));
        localStorage.setItem('failed_view_events', JSON.stringify(remainingEvents));
        console.log(`✅ Successfully retried ${successfulRetries.length} events`);
      }
      
    } catch (error) {
      console.error('Error during retry process:', error);
    }
  }

  /**
   * Get recent document views from Elasticsearch (for analytics if needed)
   */
  async getRecentDocumentViews(limit: number = 10): Promise<DocumentViewEvent[]> {
    try {
      const currentUser = UserService.getCurrentUser();
      if (!currentUser) return [];

      const indexName = 'document_views';
      const url = `${this.baseUrl}/${indexName}/_search`;

      const searchBody = {
        query: {
          term: { userId: currentUser.id }
        },
        sort: [
          { timestamp: { order: 'desc' } }
        ],
        size: limit
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.hits.hits.map((hit: any) => hit._source);
      
    } catch (error) {
      console.error('Error fetching recent document views:', error);
      return [];
    }
  }

  /**
   * Get the last viewed document for current user from Elasticsearch
   */
  async getLastViewedDocument(): Promise<{ id: string; title: string; viewTime: string } | null> {
    try {
      const recentViews = await this.getRecentDocumentViews(1);
      if (recentViews.length === 0) return null;

      const lastView = recentViews[0];
      return {
        id: lastView.documentId,
        title: lastView.documentTitle,
        viewTime: lastView.viewTime
      };
      
    } catch (error) {
      console.error('Error getting last viewed document:', error);
      return null;
    }
  }

  /**
   * Initialize document views index mapping in Elasticsearch
   */
  async initializeIndex(): Promise<void> {
    try {
      const indexName = 'document_views';
      const url = `${this.baseUrl}/${indexName}`;

      // Check if index exists
      const checkResponse = await fetch(url, { method: 'HEAD' });
      
      if (checkResponse.status === 200) {
        console.log('📊 Document views index already exists');
        return;
      }

      // Create index with mapping
      const mapping = {
        mappings: {
          properties: {
            documentId: { type: 'keyword' },
            documentTitle: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            userId: { type: 'keyword' },
            userName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            userEmail: { type: 'keyword' },
            viewTime: { type: 'date' },
            action: { type: 'keyword' },
            sessionId: { type: 'keyword' },
            timestamp: { type: 'long' }
          }
        }
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapping)
      });

      if (response.ok) {
        console.log('✅ Document views index created successfully');
      } else {
        console.error('❌ Failed to create document views index:', await response.text());
      }
      
    } catch (error) {
      console.error('Error initializing document views index:', error);
    }
  }

  /**
   * Clear tracking data (for admin/testing purposes)
   */
  async clearTrackingData(): Promise<void> {
    try {
      const indexName = 'document_views';
      const url = `${this.baseUrl}/${indexName}/_delete_by_query`;
      
      const deleteBody = {
        query: { match_all: {} }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteBody)
      });

      if (response.ok) {
        console.log('📊 Document tracking data cleared from Elasticsearch');
      } else {
        console.error('Failed to clear tracking data:', await response.text());
      }
      
    } catch (error) {
      console.error('Error clearing tracking data:', error);
    }
  }

  private getSessionId(): string {
    // Create a simple session ID based on current time and user
    const currentUser = UserService.getCurrentUser();
    const sessionKey = `session_${currentUser?.id || 'anonymous'}_${Date.now()}`;
    return sessionKey;
  }
}

// Export singleton instance
export const documentTracker = DocumentTrackingService.getInstance();
