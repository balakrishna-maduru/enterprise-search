// src/components/Analytics/DocumentViewTracker.tsx
import React, { useState, useEffect } from 'react';
import { documentTracker, DocumentViewStats, UserViewStats } from '../../services/document_tracking_service';
import { Eye, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface DocumentViewTrackerProps {
  className?: string;
  showUserStats?: boolean;
  showPopularDocs?: boolean;
  compact?: boolean;
}

export const DocumentViewTracker: React.FC<DocumentViewTrackerProps> = ({
  className = '',
  showUserStats = true,
  showPopularDocs = false,
  compact = false
}) => {
  const [userStats, setUserStats] = useState<UserViewStats | null>(null);
  const [popularDocs, setPopularDocs] = useState<DocumentViewStats[]>([]);
  const [lastViewed, setLastViewed] = useState<{ id: string; title: string; viewTime: string } | null>(null);

  useEffect(() => {
    // Only get last viewed document (async)
    if (showUserStats) {
      (async () => {
        const lastDoc = await documentTracker.getLastViewedDocument();
        setLastViewed(lastDoc);
      })();
    }
    // Optionally: clear userStats and popularDocs since those methods do not exist
    setUserStats(null);
    setPopularDocs([]);
  }, [showUserStats, showPopularDocs]);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!showUserStats && !showPopularDocs) return null;

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
        {lastViewed && (
          <div className="flex items-center text-sm text-gray-600">
            <Eye className="w-4 h-4 mr-2 text-blue-500" />
            <span className="truncate">
              Last viewed: <span className="font-medium">{lastViewed.title}</span>
            </span>
            <span className="ml-2 text-xs text-gray-400">
              {formatRelativeTime(lastViewed.viewTime)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* User Stats */}
      {showUserStats && userStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
              Your Activity
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalViews}</div>
              <div className="text-xs text-blue-700">Total Views</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats.totalDocumentsViewed}</div>
              <div className="text-xs text-green-700">Documents</div>
            </div>
          </div>

          {lastViewed && (
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lastViewed.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last viewed {formatRelativeTime(lastViewed.viewTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Popular Documents */}
      {showPopularDocs && popularDocs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
              Most Viewed
            </h3>
          </div>
          
          <div className="space-y-2">
            {popularDocs.map((doc, index) => (
              <div key={doc.documentId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.documentTitle}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-3 h-3 mr-1" />
                    {doc.totalViews} views
                    <span className="mx-1">•</span>
                    {formatRelativeTime(doc.lastViewed)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewTracker;
