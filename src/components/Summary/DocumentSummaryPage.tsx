// src/components/Summary/DocumentSummaryPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { chatApiService } from '../../services/chatApiService';

interface DocumentSummaryPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: any;
  searchResults?: any[];
  searchQuery?: string;
  onAskQuestion?: (question: string, document: any) => void;
}

interface DocumentSummaryPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: any;
  searchResults?: any[];
  searchQuery?: string;
}


const DocumentSummaryPage: React.FC<DocumentSummaryPageProps> = ({
  isOpen,
  onClose,
  initialDocument,
  onAskQuestion
}) => {
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  type Citation = {
    title: string;
    url?: string;
    text_used?: string;
  };
  type ChatFeedItem = {
    q: string;
    a: string;
    citations?: Citation[];
  };
  const [chatFeed, setChatFeed] = useState<ChatFeedItem[]>([]);
  // Generate a new session id every time the wizard is opened
  const [sessionId, setSessionId] = useState(() => `doc-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`);
  useEffect(() => {
    if (isOpen) {
      setSessionId(`doc-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialDocument?.id, initialDocument?.docId, initialDocument?._id]);
  
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  const feedEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatFeed, chatLoading]);

  if (!isOpen || !initialDocument) return null;

  const handleAsk = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    setChatError(null);
    try {
      const messageData = {
        session_id: sessionId,
        input: question,
      };
      const response = await chatApiService.sendMessage(messageData);
      if (response.code === 0 && response.data && typeof response.data === 'object' && 'output' in response.data) {
        const chatResp = response.data as any;
        setChatFeed(prev => [
          ...prev,
          {
            q: question,
            a: chatResp.output,
            citations: Array.isArray(chatResp.citation) ? chatResp.citation.map((c: any) => ({
              title: c.title,
              url: c.url,
              text_used: c.text_used
            })) : undefined
          }
        ]);
        setQuestion('');
        inputRef.current?.focus();
      } else {
        setChatError(response.msg || 'Unknown error');
      }
    } catch (err: any) {
      setChatError(err?.message || 'Failed to get chat response');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-red-600">
        <div className="flex items-center justify-between px-8 py-5 border-b-2 border-red-600 bg-red-600">
          <div className="flex items-center gap-3 text-xl font-extrabold text-white tracking-tight">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
            <span>Document Details</span>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:text-red-600 rounded-full p-1.5 text-2xl transition-colors" title="Close">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto p-6">
          <div className="mb-6 p-5 rounded-2xl bg-white border border-red-200 shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 text-base font-bold text-red-600">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
              Title
            </div>
            <div className="text-gray-900 mb-1 text-lg font-extrabold">{initialDocument.title || 'Untitled'}</div>
            <div className="flex items-center gap-2 text-base font-bold text-red-600 mt-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16M4 12h16M4 7h16" /></svg>
              Summary
            </div>
            <div className="text-gray-900 whitespace-pre-line text-base font-medium">{initialDocument.summary || initialDocument.content || 'No summary available.'}</div>
          </div>
          {/* Chat feed */}
          <div className="flex-1 overflow-y-auto mb-4" style={{ minHeight: 120, maxHeight: 300 }}>
            {chatFeed.length === 0 && (
              <div className="text-red-200 text-center py-8 flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-red-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                No questions asked yet. Start the conversation below.
              </div>
            )}
            {chatFeed.map((item, idx) => (
              <div key={idx} className="mb-2 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 font-semibold text-red-600 text-sm">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8a4 4 0 1 1 0 8" /><circle cx="12" cy="15.5" r="1" fill="currentColor" /></svg>
                  <span className="text-gray-900 font-medium">{item.q}</span>
                </div>
                <div className="bg-white border border-red-200 rounded-lg text-gray-900 whitespace-pre-line p-3 mt-0.5 shadow-sm text-sm">
                  {item.a}
                  {item.citations && item.citations.length > 0 && (
                    <span className="ml-2 text-red-700 font-semibold">
                      {(item.citations ?? []).map((_, cidx) => `[${cidx + 1}]`).join(' ')}
                    </span>
                  )}
                  {/* Citations summary below */}
                  {item.citations && item.citations.length > 0 && (
                    <div className="mt-1 text-xs text-gray-700">
                      {(item.citations ?? []).map((cite, cidx) =>
                        cite.url ? (
                          <div key={cidx}>
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-red-900 text-red-700 font-semibold"
                            >
                              [{cidx + 1}] {cite.title}
                            </a>
                          </div>
                        ) : (
                          <div key={cidx} className="font-semibold text-red-700">[{cidx + 1}] {cite.title}</div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={feedEndRef} />
          </div>
          {/* Error */}
          {chatError && <div className="mb-2 text-red-600 text-sm">{chatError}</div>}
          {/* Fixed input at bottom */}
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-3 pb-3 z-10 flex gap-3 border-t border-red-800">
            <input
              id="chat-question"
              ref={inputRef}
              type="text"
              className="flex-1 border border-red-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-800 bg-white text-red-900 placeholder-red-400 font-semibold shadow-sm text-base"
              placeholder="Type your question about this document..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
              disabled={chatLoading}
              autoFocus
            />
            <button
              className="px-6 py-3 bg-red-800 text-white rounded-full hover:bg-white hover:text-red-800 border border-red-800 focus:ring-2 focus:ring-red-800 focus:ring-offset-2 font-extrabold shadow-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 text-base"
              onClick={handleAsk}
              disabled={chatLoading || !question.trim()}
            >
              {chatLoading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</span>
              ) : (
                <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg><span>Chat</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummaryPage;
