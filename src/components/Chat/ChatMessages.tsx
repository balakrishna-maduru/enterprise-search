import React from 'react';

interface Citation {
  title: string;
  url?: string;
  content?: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  citations: Citation[];
  role?: string;
}

interface ChatMessagesProps {
  currentChat?: {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
  };
  isLoading: boolean;
  preserveScrollPosition: boolean;
  isUserAtBottom: boolean;
  setIsUserAtBottom: (v: boolean) => void;
  setPreserveScrollPosition: (v: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleNewChat: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  currentChat,
  isLoading,
  preserveScrollPosition,
  isUserAtBottom,
  setIsUserAtBottom,
  setPreserveScrollPosition,
  messagesEndRef,
  handleNewChat,
}) => {
  return (
    <>
      {currentChat ? (
        <div className="max-w-4xl mx-auto space-y-4 relative">
          {/* Scroll indicators */}
          {preserveScrollPosition && (
            <div className="sticky top-0 bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 text-center text-sm text-red-700 z-10">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                </svg>
                <span>Viewing older messages - scroll down for latest</span>
              </div>
            </div>
          )}

          {currentChat.messages.map((msg: Message, idx: number) => {
            const message = {
              ...msg,
              role: msg.role || (msg.isUser ? 'user' : 'assistant'),
              citations: msg.citations || [],
            };
            const isUser = (msg.isUser !== undefined) ? msg.isUser : message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg ${
                    isUser
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {/* Only show the main output, not citation content above */}
                    {message.content}
                  </p>
                  {/* Citations for assistant messages */}
                  {(message.citations?.length ?? 0) > 0 && (
                    <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-2 rounded text-xs">
                      {(message.citations ?? []).map((cite, cidx) => {
                        // Color palette for markers and links
                        const colorStyles = [
                          { color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }, // blue
                          { color: '#dc2626', fontWeight: 600 }, // red
                          { color: '#16a34a', fontWeight: 600 }, // green
                          { color: '#ea580c', fontWeight: 600 }, // orange
                          { color: '#7c3aed', fontWeight: 600 }, // purple
                          { color: '#db2777', fontWeight: 600 }, // pink
                          { color: '#ca8a04', fontWeight: 600 }, // yellow
                          { color: '#0891b2', fontWeight: 600 }, // cyan
                        ];
                        const color = colorStyles[cidx % colorStyles.length];
                        // Ensure unique key: use url, title, content, or fallback to index
                        const keyParts = [String(cidx)];
                        if (cite.url) keyParts.push(cite.url);
                        else if (cite.title) keyParts.push(cite.title);
                        else if (cite.content) keyParts.push(cite.content.slice(0, 16));
                        else keyParts.push('no-id');
                        const uniqueKey = keyParts.join('-');
                        return (
                          <div key={uniqueKey} className="mb-2">
                            <span style={color}>[{cidx + 1}]</span>{' '}
                            {cite.url ? (
                              <a
                                href={cite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={color}
                              >
                                {cite.title}
                              </a>
                            ) : (
                              <span style={color}>
                                {cite.title}
                              </span>
                            )}
                            {/* Do NOT show cite.content here, only above the message */}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    isUser ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}

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

          {/* Scroll to bottom button */}
          {!isUserAtBottom && (
            <button
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setIsUserAtBottom(true);
                setPreserveScrollPosition(false); // Reset preserve position when user manually scrolls to bottom
              }}
              className="absolute bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all duration-200 z-10"
              title="Scroll to bottom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
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
              onClick={() => handleNewChat()}
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
    </>
  );
};

export default ChatMessages;
