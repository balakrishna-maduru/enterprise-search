import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { ChatSession, ChatMessage } from '../../services/api_client';
import { chatService } from '../../services/chat_service';

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
      const result = await chatService.loadChatSessions();
      if (result.success && result.data) {
        setChatSessions(result.data);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const saveChatSessions = async (sessions: ChatSession[]) => {
    await chatService.saveChatSessions(sessions);
  };

  const startNewChat = (document?: any) => {
    const newChat = chatService.createNewChatSession(document);
    const updatedSessions = [newChat, ...chatSessions];
    setChatSessions(updatedSessions);
    setCurrentChatId(newChat.id);
    saveChatSessions(updatedSessions);
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    const updatedSessions = chatService.deleteSession(chatSessions, chatId);
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
    const updatedSessions = chatService.addMessageToSession(chatSessions, currentChatId, userMessage);
    setChatSessions(updatedSessions);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate AI response based on context and mode
      const currentChatSession = updatedSessions.find(chat => chat.id === currentChatId);
      const document = currentChatSession?.document;
      
      const aiResponseContent = chatService.generateAIResponse(inputMessage, chatMode, document);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        isUser: false,
        timestamp: new Date()
      };

      // Add AI response
      const finalSessions = chatService.addMessageToSession(updatedSessions, currentChatId, aiMessage);
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

      const errorSessions = chatService.addMessageToSession(updatedSessions, currentChatId, errorMessage);
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
