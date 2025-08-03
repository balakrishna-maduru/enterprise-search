// src/components/UI/SummaryFooter.tsx
import React from 'react';

interface SummaryFooterProps {
  onRegenerate: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({ 
  onRegenerate, 
  onClose, 
  isLoading 
}) => {
  return (
    <div className="bg-gray-50 px-6 py-4 border-t">
      <div className="flex justify-between items-center">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate Summary
        </button>
        
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SummaryFooter;
