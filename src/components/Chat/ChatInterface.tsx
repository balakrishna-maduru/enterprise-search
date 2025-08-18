import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatApi } from '../../hooks/useChatApi';
import FileUpload from './FileUpload';
import ChatMessages from './ChatMessages';

interface ChatInterfaceProps {
  className?: string;
  onClose?: () => void;
  initialQuestion?: string;
  document?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '', onClose, initialQuestion, document }) => {
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    isUploadingDocument,
    sendMessage,
    createNewSession,
    selectSession,
    uploadDocument,
  } = useChatApi();

  const [inputMessage, setInputMessage] = useState(initialQuestion || '');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [knowledgeScope, setKnowledgeScope] = useState<'world' | 'company'>('world');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [preserveScrollPosition, setPreserveScrollPosition] = useState(false);

  // Check if user is scrolled to bottom
  const checkIfUserAtBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsUserAtBottom(isAtBottom);
      
      // If user manually scrolls up, preserve their position
      if (!isAtBottom && scrollTop > 0) {
        setPreserveScrollPosition(true);
      } else if (isAtBottom) {
        setPreserveScrollPosition(false);
      }
    }
  }, []);

  // Scroll to bottom when new messages arrive (only if user was already at bottom and not preserving position)
  useEffect(() => {
    if (messagesEndRef.current && currentSession?.messages && currentSession.messages.length > 0) {
      // For fresh session loads (after refresh), always scroll to bottom
      if (!preserveScrollPosition || isUserAtBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [currentSession, currentSession?.messages?.length, isUserAtBottom, preserveScrollPosition]);

  // When session changes, scroll to bottom to show latest messages
  useEffect(() => {
    if (messagesEndRef.current && currentSession) {
      // When switching sessions or loading a session, scroll to bottom to show latest messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsUserAtBottom(true);
        setPreserveScrollPosition(false);
      }, 200);
    }
  }, [currentSession, currentSession?.id]);

  // Handle sending a message
  const handleSendMessage = async () => {
    const hasMessage = inputMessage.trim();
    const hasFile = selectedFile;
    
    // Must have either message or file
    if (!hasMessage && !hasFile) return;

    // Create a new session if none exists
    if (!currentSession) {
      createNewSession();
    }

    try {
      // Handle file upload first if file is selected
      if (hasFile) {
        console.log('Uploading file:', selectedFile.name);
        const result = await uploadDocument(selectedFile);
        if (result) {
          console.log('Document uploaded successfully:', result.data);
          setSelectedFile(null); // Clear file after successful upload
        } else {
          // If file upload fails, don't proceed with message
          return;
        }
      }

      // Handle text message if present
      if (hasMessage) {
        const messageContent = inputMessage.trim();
        setInputMessage('');

        if (!currentSession) {
          // Create new session if none exists (shouldn't happen as we created above)
          const newSessionId = createNewSession();
          await sendMessage(messageContent, newSessionId, { knowledge_scope: knowledgeScope });
        } else {
          await sendMessage(messageContent, currentSession.id, { knowledge_scope: knowledgeScope });
        }
      }
    } catch (err) {
      console.error('Send operation failed:', err);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle file selection (don't upload immediately)
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Don't upload immediately - wait for send button click
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
  };

  // Handle creating a new chat
  const handleNewChat = () => {
    // If document context is provided as prop, use it
    createNewSession(document);
    setInputMessage(initialQuestion || '');
  };

  // Handle session selection
  const handleSessionSelect = async (sessionId: string) => {
    await selectSession(sessionId);
  };

  // Handle session deletion
  const handleDeleteSession = async (sessionId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete session:', sessionId);
  };

  // Format date for session list
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Convert API session to display format
  // Normalize all messages to always have citations array
  function normalizeCitations(msg: any) {
    if (Array.isArray(msg.citations)) return msg.citations;
    if (Array.isArray(msg.citation)) return msg.citation;
    // If citation is a single object, wrap in array
    if (msg.citation && typeof msg.citation === 'object') return [msg.citation];
    if (msg.citations && typeof msg.citations === 'object') return [msg.citations];
    return [];
  }

  
  const chatSessions = sessions.map(session => ({
    id: session.id,
    title: session.firstMessage || 'New Chat',
    messages: session.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.role === 'user',
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp?.toString?.() ?? '',
      citations: normalizeCitations(msg),
    })),
    createdAt: typeof session.createdAt === 'string' ? session.createdAt : session.createdAt?.toString?.() ?? '',
    updatedAt: typeof session.createdAt === 'string' ? session.createdAt : session.createdAt?.toString?.() ?? '',
  }));

  //
  const currentChat = currentSession ? {
    id: currentSession.id,
    title: currentSession.firstMessage || 'New Chat',
    messages: currentSession.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.role === 'user',
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp?.toString?.() ?? '',
      citations: normalizeCitations(msg),
    })),
    createdAt: typeof currentSession.createdAt === 'string' ? currentSession.createdAt : currentSession.createdAt?.toString?.() ?? '',
    updatedAt: typeof currentSession.createdAt === 'string' ? currentSession.createdAt : currentSession.createdAt?.toString?.() ?? '',
  } : undefined;

  return (
    <div className={`h-screen bg-gray-50 flex ${className}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 shadow-lg flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">DBS Chat History</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-white/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 bg-gray-50">
          <button
            onClick={() => handleNewChat()}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-3 mb-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading && sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No chat sessions yet.</p>
              <p className="text-xs mt-1">Start a new chat to begin!</p>
            </div>
          ) : (
            chatSessions.map((chat) => (
              <div
                key={chat.id}
                className={`mx-3 my-2 p-4 cursor-pointer rounded-xl transition-all duration-200 border-l-4 ${
                  currentSession?.id === chat.id 
                    ? 'bg-red-50 border-red-500 shadow-md hover:shadow-lg' 
                    : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:shadow-sm'
                }`}
                onClick={() => handleSessionSelect(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      currentSession?.id === chat.id ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      {chat.title}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      currentSession?.id === chat.id ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {chat.messages.length} messages
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(new Date(chat.createdAt))}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(chat.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm p-4 flex-shrink-0">
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
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h1 className="text-xl font-semibold text-gray-900">
                  DBS AI Assistant
                </h1>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 min-h-0 relative"
          onScroll={checkIfUserAtBottom}
          style={{ 
            minHeight: '400px', 
            maxHeight: 'calc(100vh - 300px)',
            scrollBehavior: 'smooth'
          }}
        >
          <ChatMessages
            currentChat={currentChat}
            isLoading={isLoading}
            preserveScrollPosition={preserveScrollPosition}
            isUserAtBottom={isUserAtBottom}
            setIsUserAtBottom={setIsUserAtBottom}
            setPreserveScrollPosition={setPreserveScrollPosition}
            messagesEndRef={messagesEndRef}
            handleNewChat={handleNewChat}
          />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Upload Status Notification */}
            {isUploadingDocument && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Processing document...</span>
                </div>
              </div>
            )}
            
            {/* Error notification */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {/* Input area with buttons - always visible */}
            <div className="bg-gray-50 p-3 rounded-lg">
              {/* File Selected Label */}
              {selectedFile && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-blue-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={handleClearFile}
                      className="text-blue-500 hover:text-red-700 p-1"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Knowledge Scope Buttons */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Knowledge Scope:</span>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setKnowledgeScope('world')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      knowledgeScope === 'world'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🌍 World
                  </button>
                  <button
                    onClick={() => setKnowledgeScope('company')}
                    className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
                      knowledgeScope === 'company'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🏢 Company
                  </button>
                </div>
              </div>

              {/* Input and Action buttons */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={currentChat ? "Type your message here..." : "Start a new conversation..."}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none shadow-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                
                {/* Vertical Action buttons */}
                <div className="flex flex-col gap-2">
                  {/* File Upload Button */}
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isUploading={isUploadingDocument}
                    disabled={isLoading}
                  />
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 flex-shrink-0"
                    title="Send"
                  >
                    {isLoading ? (
                      <span className="text-sm font-medium">API thinking...</span>
                    ) : isUploadingDocument ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="text-sm font-medium">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
