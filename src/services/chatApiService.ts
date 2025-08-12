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

  // Upload and process a document (mocked for now)
  async uploadDocument(file: File): Promise<DocumentUploadApiResponse> {
    // Mock implementation - simulate file processing
    console.log(`Starting upload for file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time
    console.log('File uploaded, processing...');
    
    // Simulate processing time based on file size
    const processingTime = Math.min(3000, Math.max(1000, file.size / 1000)); // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate potential file types and extract mock data
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const estimatedPages = Math.floor(Math.random() * 50) + 1;
    
    const mockResponse: DocumentUploadResponse = {
      document_id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      size: file.size,
      status: 'completed',
      pages: estimatedPages,
      processed_at: new Date().toISOString(),
    };

    console.log('Document processing completed:', mockResponse);

    return {
      code: 0,
      msg: `Document processed successfully. Extracted ${estimatedPages} pages from ${fileExtension.toUpperCase()} file.`,
      trace_id: `trace_${Date.now()}`,
      data: mockResponse
    };
  }
}

export const chatApiService = new ChatApiService();
