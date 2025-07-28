// src/components/SavedSearches/SavedSearchesModal.js
import React, { useState, useEffect } from 'react';
import { X, Search, Bookmark, Users, Lock, Trash2, Share2, Play, Clock, TrendingUp, Tag, Edit2 } from 'lucide-react';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useSearch } from '../../contexts/SearchContext';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import LoadingSpinner from '../Common/LoadingSpinner';

const SavedSearchesModal = ({ onClose, onSearchSelected }) => {
  const { currentUser, availableUsers } = useUnifiedUser();
  const { setSearchQuery, setSelectedFilters } = useSearch();
  const { 
    savedSearches, 
    isLoading, 
    deleteSearch, 
    shareSearch, 
    unshareSearch, 
    useSearch: recordSearchUsage,
    getSearchesByCategory 
  } = useSavedSearches();

  const [activeTab, setActiveTab] = useState('mySearches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const categorizedSearches = getSearchesByCategory(currentUser);

  // Filter searches based on search term
  const filterSearches = (searches) => {
    if (!searchTerm) return searches;
    const term = searchTerm.toLowerCase();
    return searches.filter(search => 
      search.title.toLowerCase().includes(term) ||
      search.query.toLowerCase().includes(term) ||
      search.tags.some(tag => tag.toLowerCase().includes(term)) ||
      search.description?.toLowerCase().includes(term)
    );
  };

  const handleUseSearch = async (search) => {
    try {
      // Record usage
      await recordSearchUsage(search.id);
      
      // Apply the search
      setSearchQuery(search.query);
      setSelectedFilters(search.filters || {});
      
      // Notify parent and close
      onSearchSelected?.(search);
      onClose();
    } catch (error) {
      console.error('Error using search:', error);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    try {
      const result = await deleteSearch(searchId, currentUser);
      if (result.success) {
        setShowDeleteConfirm(null);
      } else {
        console.error('Failed to delete search:', result.error);
      }
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleShareSearch = async (searchId, userIds) => {
    try {
      const result = await shareSearch(searchId, userIds, currentUser);
      if (result.success) {
        setShowShareModal(false);
        setSelectedSearch(null);
      } else {
        console.error('Failed to share search:', result.error);
      }
    } catch (error) {
      console.error('Error sharing search:', error);
    }
  };

  const tabs = [
    { id: 'mySearches', label: 'My Searches', icon: Bookmark, count: categorizedSearches.mySearches.length },
    { id: 'sharedWithMe', label: 'Shared with Me', icon: Share2, count: categorizedSearches.sharedWithMe.length },
    { id: 'departmentSearches', label: 'Department', icon: Users, count: categorizedSearches.departmentSearches.length },
    { id: 'recentlyUsed', label: 'Recent', icon: Clock, count: categorizedSearches.recentlyUsed.length },
    { id: 'popular', label: 'Popular', icon: TrendingUp, count: categorizedSearches.popular.length }
  ];

  const getCurrentSearches = () => {
    const searches = categorizedSearches[activeTab] || [];
    return filterSearches(searches);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bookmark className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Saved Searches</h3>
                <p className="text-sm text-gray-600">
                  Manage your saved searches and discover searches shared by colleagues
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved searches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Loading saved searches...</span>
            </div>
          ) : (
            <SearchesList 
              searches={getCurrentSearches()}
              currentUser={currentUser}
              onUseSearch={handleUseSearch}
              onDeleteSearch={(searchId) => setShowDeleteConfirm(searchId)}
              onShareSearch={(search) => {
                setSelectedSearch(search);
                setShowShareModal(true);
              }}
              activeTab={activeTab}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && selectedSearch && (
        <ShareSearchModal
          search={selectedSearch}
          availableUsers={availableUsers.filter(u => u.id !== currentUser.id)}
          onShare={handleShareSearch}
          onClose={() => {
            setShowShareModal(false);
            setSelectedSearch(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          searchTitle={savedSearches.find(s => s.id === showDeleteConfirm)?.title}
          onConfirm={() => handleDeleteSearch(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

const SearchesList = ({ searches, currentUser, onUseSearch, onDeleteSearch, onShareSearch, activeTab }) => {
  if (searches.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {activeTab === 'mySearches' ? 'No saved searches yet' : 'No searches found'}
        </h3>
        <p className="text-gray-600">
          {activeTab === 'mySearches' 
            ? 'Save your frequently used searches for quick access later'
            : 'Try adjusting your search filters or check other tabs'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searches.map((search) => (
        <SearchCard
          key={search.id}
          search={search}
          currentUser={currentUser}
          onUse={() => onUseSearch(search)}
          onDelete={() => onDeleteSearch(search.id)}
          onShare={() => onShareSearch(search)}
          isOwner={search.userId === currentUser.id}
        />
      ))}
    </div>
  );
};

const SearchCard = ({ search, currentUser, onUse, onDelete, onShare, isOwner }) => {
  const getSourceColor = (source) => {
    switch (source) {
      case 'jira': return 'bg-blue-100 text-blue-800';
      case 'confluence': return 'bg-green-100 text-green-800';
      case 'sharepoint': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-medium text-gray-900">{search.title}</h4>
            {search.isPrivate && <Lock className="w-4 h-4 text-gray-500" />}
            {search.sharedWith.length > 0 && <Share2 className="w-4 h-4 text-blue-500" />}
          </div>
          
          <p className="text-gray-700 mb-2 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
            "{search.query}"
          </p>
          
          {search.description && (
            <p className="text-gray-600 text-sm mb-3">{search.description}</p>
          )}
          
          {/* Filters */}
          {Object.keys(search.filters || {}).some(key => 
            Array.isArray(search.filters[key]) ? search.filters[key].length > 0 : search.filters[key] !== 'all'
          ) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {search.filters.source?.map(source => (
                <span key={source} className={`px-2 py-1 text-xs rounded-full ${getSourceColor(source)}`}>
                  {source}
                </span>
              ))}
              {search.filters.contentType?.map(type => (
                <span key={type} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {type}
                </span>
              ))}
              {search.filters.dateRange && search.filters.dateRange !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {search.filters.dateRange}
                </span>
              )}
            </div>
          )}
          
          {/* Tags */}
          {search.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {search.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>By {search.userName}</span>
            <span>•</span>
            <span>{search.userDepartment}</span>
            <span>•</span>
            <span>Used {search.useCount} times</span>
            <span>•</span>
            <span>Created {new Date(search.createdAt).toLocaleDateString()}</span>
            {search.lastUsed && (
              <>
                <span>•</span>
                <span>Last used {new Date(search.lastUsed).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onUse}
            className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="Use this search"
          >
            <Play className="w-4 h-4" />
            <span>Use</span>
          </button>
          
          {isOwner && (
            <>
              <button
                onClick={onShare}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share with colleagues"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete search"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ShareSearchModal = ({ search, availableUsers, onShare, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = () => {
    onShare(search.id, selectedUsers);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Share Search</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Share "{search.title}" with colleagues</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableUsers.map(user => (
              <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                  {user.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.position} • {user.department}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={selectedUsers.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Share with {selectedUsers.length} colleague{selectedUsers.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ searchTitle, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Saved Search</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{searchTitle}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearchesModal;