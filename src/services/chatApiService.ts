// Chat API service for interacting with the backend chat endpoints

export interface ChatApiResponse {
  code: number;
  msg: string;
  trace_id?: string;
  data: MessageResponse[] | SessionInfo[] | ChatResponse;
}

export interface ChatRequest {
  session_id: string; // Required based on API testing
  input: string;
  provider?: string;
  provider_id?: string;
  knnField?: string;
  rankWindowSize?: number;
  rankConstant?: number;
  k?: number;
  indexName?: string;
  embeddingModelType?: string;
  numberOfCandidates?: number;
  temperature?: number;
  embeddingModelHostType?: string;
  size?: number;
  knowledge_scope?: string;
  radius?: number;
  collapseField?: string;
  rerank_topk?: number;
}

export interface MessageResponse {
  idx: number;
  msg_id: string;
  content: string;
  role: string;
  created_at: string;
}

export interface ChatResponse {
  output: string;
  session_id: string;
  citation: any;
  evaluation: {
    HALLUCINATION: string;
    RELEVANCY: string;
    ACCURACY: string;
  };
}

export interface SessionInfo {
  session_id: string;
  first_message: string;
  created_at: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  size: number;
  status: 'processing' | 'completed' | 'failed';
  pages?: number;
  processed_at?: string;
}

export interface DocumentUploadApiResponse {
  code: number;
  msg: string;
  trace_id?: string;
  data: DocumentUploadResponse;
}

const API_BASE_URL = process.env.REACT_APP_CHAT_BRIDGE_URL || 'http://localhost:8000/api/v1';

class ChatApiService {
  // Send a chat message
  async sendMessage(messageData: ChatRequest): Promise<ChatApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Get messages for a specific session
  async getMessages(sessionId: string): Promise<ChatApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  // Get all chat sessions
  async getSessions(): Promise<ChatApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }

  // Generate a new session ID
  generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Upload and process a document (must be implemented in backend before use)
  async uploadDocument(_file: File): Promise<DocumentUploadApiResponse> {
    throw new Error('Document upload is not implemented on the backend API. Please add an endpoint and update chatApiService.uploadDocument to call it.');
  }
}

export const chatApiService = new ChatApiService();
