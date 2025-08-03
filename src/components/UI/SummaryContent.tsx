// src/components/UI/SummaryContent.tsx
import React from 'react';
import { SummaryResponse } from '../../services/api_client';

interface SummaryContentProps {
  summary: SummaryResponse;
}

const SummaryContent: React.FC<SummaryContentProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      {/* Main Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Summary
        </h3>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </p>
        </div>
      </div>

      {/* Source Distribution */}
      {Object.keys(summary.sourceDistribution).length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Sources</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.sourceDistribution).map(([source, count]) => (
              <span
                key={source}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {source}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {summary.confidenceScore > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Confidence Score</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.confidenceScore * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {(summary.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryContent;
