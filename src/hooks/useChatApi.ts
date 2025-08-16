import { useState, useEffect, useCallback } from 'react';
import { chatApiService, MessageResponse, SessionInfo, ChatRequest, ChatResponse, DocumentUploadApiResponse } from '../services/chatApiService';

export interface Citation {
  title: string;
  url?: string;
  text_used?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  citations?: Citation[];
}

export interface ChatSession {
  id: string;
  firstMessage: string;
  createdAt: Date;
  messages: ChatMessage[];
  document?: any; // Add document context
}

export const useChatApi = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Convert API message to local message format
  const convertApiMessage = (apiMessage: MessageResponse): ChatMessage => ({
    id: apiMessage.msg_id,
    content: apiMessage.content,
    role: apiMessage.role as 'user' | 'assistant',
    timestamp: new Date(apiMessage.created_at),
  });

  // Convert API session to local session format
  const convertApiSession = (apiSession: SessionInfo): ChatSession => ({
    id: apiSession.session_id,
    firstMessage: apiSession.first_message,
    createdAt: new Date(apiSession.created_at),
    messages: [],
  });

  // Load messages for a specific session
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatApiService.getMessages(sessionId);
      
      if (response.code === 0 && Array.isArray(response.data)) {
        const messages = (response.data as MessageResponse[]).map(convertApiMessage);
        
        // Update the session with messages
        setSessions(prevSessions => {
          const updatedSessions = prevSessions.map(session => 
            session.id === sessionId 
              ? { ...session, messages }
              : session
          );
          return updatedSessions;
        });

        // Update current session if it matches
        setCurrentSession(prevSession => {
          if (prevSession && prevSession.id === sessionId) {
            const updatedSession = { ...prevSession, messages };
            return updatedSession;
          }
          return prevSession;
        });
      } else {
        setError(`Failed to load messages: ${response.msg || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatApiService.getSessions();
      if (response.code === 0 && Array.isArray(response.data)) {
        const convertedSessions = (response.data as SessionInfo[]).map(convertApiSession);
        setSessions(convertedSessions);
        
        // Don't auto-select sessions here - let the calling code handle it
        return convertedSessions;
      } else {
        console.log('Sessions API response not successful:', response);
        setError(`Failed to load sessions: ${response.msg || 'Unknown error'}`);
        return [];
      }
    } catch (err) {
      console.error('Sessions API error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove dependencies to avoid stale closure issues

  // Send a message
  const sendMessage = useCallback(async (
    content: string, 
    sessionId?: string,
    chatConfig?: Partial<ChatRequest>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const actualSessionId = sessionId || chatApiService.generateSessionId();
      
      const messageData: ChatRequest = {
        session_id: actualSessionId,
        input: content,
        provider: 'GCP_CLAUDE',
        provider_id: 'claude-3-5-sonnet@20240620',
        knnField: 'embeddings',
        rankWindowSize: 50,
        rankConstant: 20,
        k: 5,
        indexName: 'datasets-datanaut.ekb.qodo.data-ada.sg.uat',
        embeddingModelType: 'DBS_QUDO_EMBEDDING_MODEL',
        numberOfCandidates: 10,
        temperature: 0.01,
        embeddingModelHostType: 'DBS_HOST_EMBEDDING_MODEL',
        size: 20,
        radius: 1,
        collapseField: 'docId',
        rerank_topk: 5,
        // Apply any overrides from chatConfig (including knowledge_scope)
        ...chatConfig,
        // Ensure knowledge_scope is set, defaulting to 'world' if not provided
        knowledge_scope: chatConfig?.knowledge_scope || 'world',
      };

      const response = await chatApiService.sendMessage(messageData);
      
      if (response.code === 0 && response.data) {
        // The POST /chat endpoint returns a ChatResponse object in data field (matching Postman collection)
        const chatResponse = response.data as ChatResponse;
        
        // Use the session_id from the response
        const responseSessionId = chatResponse.session_id;
        
        // Create user message locally
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          content: content,
          role: 'user',
          timestamp: new Date(),
        };
        
        // Create assistant message from response, including citations if present
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: chatResponse.output,
          role: 'assistant',
          timestamp: new Date(),
          citations: Array.isArray(chatResponse.citation) ? chatResponse.citation.map((c: any) => ({
            title: c.title,
            url: c.url,
            text_used: c.text_used
          })) : undefined,
        };
        
        // Update sessions list with new message count
        setSessions(prevSessions => {
          const sessionExists = prevSessions.some(s => s.id === responseSessionId);
          
          if (sessionExists) {
            // Update existing session
            return prevSessions.map(session => {
              if (session.id === responseSessionId) {
                // Ensure we have the current messages (might be empty if not loaded)
                const currentMessages = session.messages || [];
                const updatedMessages = [...currentMessages, userMessage, assistantMessage];
                return {
                  ...session,
                  messages: updatedMessages,
                  firstMessage: session.firstMessage || content // Set first message if empty
                };
              }
              return session;
            });
          } else {
            // Add new session
            const newSession: ChatSession = {
              id: responseSessionId,
              firstMessage: content,
              createdAt: new Date(),
              messages: [userMessage, assistantMessage]
            };
            return [...prevSessions, newSession];
          }
        });
        
        // Update current session with new messages
        setCurrentSession(prevSession => {
          if (prevSession && prevSession.id === responseSessionId) {
            // Update existing current session
            const currentMessages = prevSession.messages || [];
            return {
              ...prevSession,
              messages: [...currentMessages, userMessage, assistantMessage],
              firstMessage: prevSession.firstMessage || content
            };
          } else if (!prevSession || prevSession.id !== responseSessionId) {
            // Set new current session (for new sessions or different session)
            return {
              id: responseSessionId,
              firstMessage: content,
              createdAt: new Date(),
              messages: [userMessage, assistantMessage]
            };
          }
          return prevSession; // Fallback
        });
      } else {
        setError(`Failed to send message: ${response.msg || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, sessions]);

  // Create a new chat session
  const createNewSession = useCallback((document?: any) => {
    const newSession: ChatSession = {
      id: chatApiService.generateSessionId(),
      firstMessage: '',
      createdAt: new Date(),
      messages: [],
      document: document || undefined,
    };
    setCurrentSession(newSession);
    return newSession.id;
  }, []);

  // Select an existing session
  const selectSession = useCallback(async (sessionId: string) => {
    setError(null);
    
    try {
      // Find the session first
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        setError('Session not found');
        return;
      }

      // Set current session immediately
      setCurrentSession(session);
      
      // Always load messages to ensure we have the latest data
      await loadSessionMessages(sessionId);
      
    } catch (err) {
      console.error('Error selecting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to select session');
    }
  }, [sessions, loadSessionMessages]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Upload and process a document
  const uploadDocument = useCallback(async (file: File): Promise<DocumentUploadApiResponse | null> => {
    setIsUploadingDocument(true);
    setError(null);
    
    try {
      const response = await chatApiService.uploadDocument(file);
      
      if (response.code === 0) {
        // Create a system message about the uploaded document
        const documentMessage = `📄 Document "${response.data.filename}" has been uploaded and processed successfully. It contains ${response.data.pages} pages and is ready for questions.`;
        
        // If there's a current session, add the document info as a system message
        if (currentSession) {
          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            content: documentMessage,
            role: 'assistant',
            timestamp: new Date(),
          };
          
          // Update current session with document info
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, systemMessage]
          } : null);
          
          // Update sessions list
          setSessions(prevSessions => 
            prevSessions.map(session => 
              session.id === currentSession.id
                ? { ...session, messages: [...session.messages, systemMessage] }
                : session
            )
          );
        }
        
        return response;
      } else {
        setError(`Failed to upload document: ${response.msg || 'Unknown error'}`);
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      return null;
    } finally {
      setIsUploadingDocument(false);
    }
  }, [currentSession]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    isUploadingDocument,
    sendMessage,
    createNewSession,
    selectSession,
    loadSessions,
    loadSessionMessages,
    uploadDocument,
  };
};
