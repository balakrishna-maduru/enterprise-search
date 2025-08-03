// src/services/chat_service.ts
import { apiClient, ChatSession, ChatMessage } from './api_client';

export class ChatService {
  
  async loadChatSessions(): Promise<{ success: boolean; data?: ChatSession[]; error?: string }> {
    try {
      const response = await apiClient.getChatSessions();
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        // Try to load from localStorage as fallback
        const savedSessions = localStorage.getItem('chatSessions');
        if (savedSessions) {
          const sessions = JSON.parse(savedSessions).map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          return { success: true, data: sessions };
        }
        
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      
      // Load from localStorage as fallback
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        try {
          const sessions = JSON.parse(savedSessions).map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          return { success: true, data: sessions };
        } catch (parseError) {
          console.error('Error parsing localStorage sessions:', parseError);
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load chat sessions',
        data: []
      };
    }
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.saveChatSessions(sessions);
      
      if (!response.success) {
        console.error('Error saving to API:', response.error);
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving chat sessions:', error);
      
      // Still try to save to localStorage
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save chat sessions'
      };
    }
  }

  createNewChatSession(document?: any): ChatSession {
    const newChatId = Date.now().toString();
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: document 
        ? `Hello! I'm here to help you with questions about the document "${document.title}". What would you like to know?`
        : "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    };

    return {
      id: newChatId,
      title: document ? `Chat about: ${document.title}` : 'New Chat',
      document,
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  generateAIResponse(
    userMessage: string, 
    chatMode: 'company' | 'world', 
    document?: any
  ): string {
    const aiResponses: Record<string, string[]> = {
      company: document ? [
        `Based on the company document "${document.title}", I can help you understand that this content relates to ${document.department || 'your organization'}. What specific aspect would you like to explore?`,
        `This internal document from ${document.author || 'the author'} contains important company information. Could you be more specific about what you'd like to know?`,
        `I can see this is a ${document.content_type || 'document'} from our company dated ${new Date(document.timestamp).getFullYear() || 'recently'}. What particular section or topic interests you?`,
        `That's a great question about our company's ${document.source || 'documentation'}. Let me help you understand the key points mentioned in the content.`,
        `According to our company's documentation, this information is quite relevant to our operations. Would you like me to elaborate on any specific section?`,
        `Our company document mentions several key points. Based on your question, I think you might be interested in the section about ${document.department || 'this topic'}.`,
        `This is an excellent question about our company policies! The document provides detailed information about this topic. Let me break it down for you.`
      ] : [
        "I'm here to help you with company-related questions. What would you like to know about our organization, policies, or procedures?",
        "As your company AI assistant, I can provide insights about our internal processes, documentation, and organizational information. How can I help?",
        "I'm focused on company-specific information. Please feel free to ask about our departments, policies, procedures, or any internal documentation.",
        "That's an interesting company-related question! Let me help you with information specific to our organization.",
        "I'm here to assist with company matters. Could you provide more details about what specifically you'd like to know about our organization?",
        "As your internal AI assistant, I can help you navigate our company's information and resources. What would you like to explore?",
        "Great question about our company! Let me provide you with relevant organizational information."
      ],
      world: [
        "That's an interesting question! As your AI assistant, I can help you with general knowledge and information from around the world. Let me provide you with a comprehensive answer.",
        "Great question! I have access to a wide range of information and can help you understand this topic better. What specific aspect would you like me to focus on?",
        "I'd be happy to help you with that! Based on my knowledge of various topics, I can provide you with detailed information about this subject.",
        "That's a fascinating topic! Let me share some insights and information that might be helpful to you.",
        "Excellent question! I can draw from a broad knowledge base to give you a thorough explanation of this topic.",
        "I'm glad you asked about that! This is an area where I can provide you with comprehensive information and different perspectives.",
        "That's a thought-provoking question! Let me help you explore this topic with some detailed information and context."
      ]
    };

    const responses = aiResponses[chatMode];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  addMessageToSession(
    sessions: ChatSession[], 
    chatId: string, 
    message: ChatMessage
  ): ChatSession[] {
    return sessions.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, message],
            updatedAt: new Date()
          }
        : chat
    );
  }

  deleteSession(sessions: ChatSession[], chatId: string): ChatSession[] {
    return sessions.filter(chat => chat.id !== chatId);
  }
}

// Create singleton instance
export const chatService = new ChatService();
