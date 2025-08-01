import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  document?: any;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentChatPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: any;
}

const DocumentChatPage: React.FC<DocumentChatPageProps> = ({ 
  isOpen, 
  onClose, 
  initialDocument 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMode, setChatMode] = useState<'company' | 'world'>('company');

  // Get current chat session
  const currentChat = chatSessions.find(chat => chat.id === currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // Load chat sessions from API or localStorage
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Create new chat when document is provided
  useEffect(() => {
    if (initialDocument && isOpen) {
      startNewChat(initialDocument);
    }
  }, [initialDocument, isOpen]);

  const loadChatSessions = async () => {
    try {
      // Try to load from API first
      const response = await fetch('/api/v1/chats');
      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(sessions);
      } else {
        // Fallback to localStorage
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
          setChatSessions(sessions);
        }
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      // Load from localStorage as fallback
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
        setChatSessions(sessions);
      }
    }
  };

  const saveChatSessions = async (sessions: ChatSession[]) => {
    try {
      // Try to save to API first
      await fetch('/api/v1/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessions),
      });
    } catch (error) {
      console.error('Error saving to API:', error);
    }
    
    // Always save to localStorage as backup
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  };

  const startNewChat = (document?: any) => {
    const newChatId = Date.now().toString();
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: document 
        ? `Hello! I'm here to help you with questions about the document "${document.title}". What would you like to know?`
        : "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    };

    const newChat: ChatSession = {
      id: newChatId,
      title: document ? `Chat about: ${document.title}` : 'New Chat',
      document,
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [newChat, ...chatSessions];
    setChatSessions(updatedSessions);
    setCurrentChatId(newChatId);
    saveChatSessions(updatedSessions);
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    const updatedSessions = chatSessions.filter(chat => chat.id !== chatId);
    setChatSessions(updatedSessions);
    saveChatSessions(updatedSessions);
    
    if (currentChatId === chatId) {
      setCurrentChatId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChatId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    // Add user message immediately
    const updatedSessions = chatSessions.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            updatedAt: new Date()
          }
        : chat
    );
    setChatSessions(updatedSessions);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate AI response based on context and mode
      const currentChatSession = updatedSessions.find(chat => chat.id === currentChatId);
      const document = currentChatSession?.document;
      
      let aiResponses: string[] = [];
      
      if (chatMode === 'company') {
        aiResponses = document ? [
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
        ];
      } else {
        // World mode responses
        aiResponses = [
          "That's an interesting question! As your AI assistant, I can help you with general knowledge and information from around the world. Let me provide you with a comprehensive answer.",
          "I'd be happy to help you with that! Drawing from global knowledge and information, here's what I can tell you about this topic.",
          "Great question! Let me think about this from a global perspective and provide you with insights based on worldwide information and best practices.",
          "That's a thoughtful inquiry! I can provide you with information from various sources and perspectives around the world. Let me break this down for you.",
          "I can definitely assist you with that! Using my knowledge of global information and trends, here are some key points to consider.",
          "Thanks for your question! This is an important topic globally, and I'm glad you asked about it. Let me share some worldwide insights.",
          "Excellent question! From a global standpoint, there are several interesting aspects to consider about this topic. Let me elaborate.",
          "I understand what you're asking. Based on worldwide information and research, I can provide some valuable insights on this subject.",
          "That's a fascinating topic! Let me draw from global knowledge and various international perspectives to give you a well-rounded answer.",
          "I'm here to help with any general questions you might have! Using information from around the world, let me provide you with a detailed response."
        ];
      }

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isUser: false,
        timestamp: new Date()
      };

      // Add AI response
      const finalSessions = updatedSessions.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date()
            }
          : chat
      );
      
      setChatSessions(finalSessions);
      saveChatSessions(finalSessions);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      };

      const errorSessions = updatedSessions.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, errorMessage],
              updatedAt: new Date()
            }
          : chat
      );
      
      setChatSessions(errorSessions);
      saveChatSessions(errorSessions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <ChatInterface
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      chatSessions={chatSessions}
      currentChatId={currentChatId}
      startNewChat={startNewChat}
      selectChat={selectChat}
      deleteChat={deleteChat}
      currentChat={currentChat}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      handleSendMessage={handleSendMessage}
      handleKeyPress={handleKeyPress}
      isLoading={isLoading}
      chatMode={chatMode}
      setChatMode={setChatMode}
      onClose={onClose}
      messagesEndRef={messagesEndRef}
    />
  );
};

export default DocumentChatPage;
