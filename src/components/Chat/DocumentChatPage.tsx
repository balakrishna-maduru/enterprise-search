import React from 'react';
import ChatInterface from './ChatInterface';

interface DocumentChatPageProps {
  isOpen: boolean;
  onClose: () => void;
  document?: any;
}

const DocumentChatPage: React.FC<DocumentChatPageProps> = ({ 
  isOpen, 
  onClose, 
  document 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="h-full">
        <ChatInterface onClose={onClose} initialQuestion={document?.initialQuestion} document={document} />
      </div>
    </div>
  );
};

export default DocumentChatPage;
