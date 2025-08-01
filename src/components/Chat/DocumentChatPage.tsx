import React, { useState, useRef, useEffect } from 'react';

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

      // Generate AI response based on context
      const currentChatSession = updatedSessions.find(chat => chat.id === currentChatId);
      const document = currentChatSession?.document;
      
      const aiResponses = document ? [
        `Based on the document "${document.title}", I can help you understand that this content relates to ${document.department || 'your organization'}. What specific aspect would you like to explore?`,
        `This document from ${document.author || 'the author'} contains important information. Could you be more specific about what you'd like to know?`,
        `I can see this is a ${document.content_type || 'document'} from ${new Date(document.timestamp).getFullYear() || 'recently'}. What particular section or topic interests you?`,
        `That's a great question about this ${document.source || 'document'}. Let me help you understand the key points mentioned in the content.`,
        `According to the document content, this information is quite relevant. Would you like me to elaborate on any specific section?`,
        `The document mentions several key points. Based on your question, I think you might be interested in the section about ${document.department || 'this topic'}.`,
        `This is an excellent question! The document provides detailed information about this topic. Let me break it down for you.`
      ] : [
        "That's an interesting question! Let me help you with that. Could you provide more details about what specifically you'd like to know?",
        "I understand what you're asking. Based on the information available, I can provide some insights on this topic.",
        "Great question! Let me think about this and provide you with a comprehensive answer.",
        "I'd be happy to help you with that. Here's what I can tell you about this topic.",
        "That's a thoughtful inquiry. Let me break this down for you in a way that's easy to understand.",
        "I can definitely assist you with that. Here are some key points to consider.",
        "Thanks for your question! This is an important topic, and I'm glad you asked about it."
      ];

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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-900 text-white flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => startNewChat()}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatSessions.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 cursor-pointer hover:bg-gray-800 border-l-4 ${
                currentChatId === chat.id ? 'bg-gray-800 border-blue-500' : 'border-transparent'
              }`}
              onClick={() => selectChat(chat.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {chat.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {chat.messages.length} messages
                  </p>
                  <p className="text-xs text-gray-500">
                    {chat.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentChat?.title || 'Document Chat'}
                </h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Context Panel - only show if current chat has a document */}
        {currentChat?.document && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  {currentChat.document.title}
                </h3>
                <p className="text-sm text-blue-700 mb-2 line-clamp-2">
                  {currentChat.document.summary || currentChat.document.content}
                </p>
                <div className="flex items-center space-x-4 text-xs text-blue-600">
                  <span>By {currentChat.document.author}</span>
                  <span>•</span>
                  <span>{currentChat.document.department}</span>
                  <span>•</span>
                  <span>{new Date(currentChat.document.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentChat ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
                <p className="text-gray-500 mb-4">Start a new conversation or select an existing chat from the sidebar.</p>
                <button
                  onClick={() => startNewChat()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        {currentChat && (
          <div className="p-4 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentChatPage;
