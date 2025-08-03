import React from 'react';
import FileUploadButton from '../Search/FileUploadButton';
import { UploadedFile } from '../../types';

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

interface ChatInterfaceProps {
  // Sidebar props
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatSessions: ChatSession[];
  currentChatId: string | null;
  
  // Chat management
  startNewChat: (document?: any) => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  
  // Current chat
  currentChat: ChatSession | undefined;
  
  // Message handling
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  
  // Chat mode
  chatMode: 'company' | 'world';
  setChatMode: (mode: 'company' | 'world') => void;
  
  // File upload
  uploadedFiles: UploadedFile[];
  onFileUpload: (file: UploadedFile) => void;
  onFileRemove: (fileId: string) => void;
  
  // Layout
  onClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sidebarOpen,
  setSidebarOpen,
  chatSessions,
  currentChatId,
  startNewChat,
  selectChat,
  deleteChat,
  currentChat,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyPress,
  isLoading,
  chatMode,
  setChatMode,
  uploadedFiles,
  onFileUpload,
  onFileRemove,
  onClose,
  messagesEndRef
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            onClick={() => startNewChat()}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {chatSessions.map((chat) => (
            <div
              key={chat.id}
              className={`mx-3 my-2 p-4 cursor-pointer rounded-xl transition-all duration-200 border-l-4 ${
                currentChatId === chat.id 
                  ? 'bg-red-50 border-red-500 shadow-md hover:shadow-lg' 
                  : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:shadow-sm'
              }`}
              onClick={() => selectChat(chat.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${
                    currentChatId === chat.id ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    {chat.title}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    currentChatId === chat.id ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {chat.messages.length} messages
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white/50 transition-colors"
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
        <div className="bg-white border-b border-gray-200 shadow-sm p-4">
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
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-red-900 mb-1">
                  {currentChat.document.title}
                </h3>
                <p className="text-sm text-red-700 mb-2 line-clamp-2">
                  {currentChat.document.summary || currentChat.document.content}
                </p>
                <div className="flex items-center space-x-4 text-xs text-red-600">
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
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-[1.02]"
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
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto">
              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Uploaded Files ({uploadedFiles.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700 mr-2 truncate max-w-32">{file.name}</span>
                        <button
                          onClick={() => onFileRemove(file.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Mode Toggle - Positioned above the input area */}
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600 font-medium">
                  Chat Mode: <span className="text-red-600">{chatMode === 'company' ? 'Company Knowledge' : 'World Knowledge'}</span>
                </div>
                <button
                  onClick={() => setChatMode(chatMode === 'company' ? 'world' : 'company')}
                  className="relative inline-flex items-center bg-gray-200 rounded-full p-0.5 text-xs font-medium transition-all duration-200 hover:bg-gray-300 shadow-sm"
                  style={{ width: '100px', height: '28px' }}
                  title={`Switch to ${chatMode === 'company' ? 'World' : 'Company'} Knowledge`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-12 h-6 bg-red-600 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
                      chatMode === 'world' ? 'translate-x-11' : 'translate-x-0'
                    }`}
                  />
                  <span className={`relative z-10 w-12 text-center transition-colors duration-200 text-xs font-semibold ${
                    chatMode === 'company' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Company
                  </span>
                  <span className={`relative z-10 w-12 text-center transition-colors duration-200 text-xs font-semibold ${
                    chatMode === 'world' ? 'text-white' : 'text-gray-600'
                  }`}>
                    World
                  </span>
                </button>
              </div>

              {/* Input area with buttons */}
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none shadow-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                
                {/* Action buttons row */}
                <div className="flex items-center gap-4">
                  <FileUploadButton
                    onFileUpload={onFileUpload}
                    onFileRemove={onFileRemove}
                    uploadedFiles={uploadedFiles}
                    maxFileSize={10}
                    acceptedTypes={['.txt', '.pdf', '.doc', '.docx', '.md']}
                    disabled={isLoading}
                    className="flex-shrink-0"
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 flex-shrink-0 min-w-[100px]"
                    title="Send message"
                  >
                    {isLoading ? (
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
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
