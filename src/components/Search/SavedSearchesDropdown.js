// src/components/Search/SavedSearchesDropdown.js
import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  BookmarkPlus, 
  Search, 
  Clock, 
  TrendingUp, 
  Trash2, 
  Edit3,
  ChevronDown,
  X,
  Lock,
  Users,
  Globe,
  Building2
} from 'lucide-react';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useSearch } from '../../contexts/SearchContext';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";

const SavedSearchesDropdown = () => {
  const { currentUser } = useUnifiedUser();
  const { searchQuery, selectedFilters, setSearchQuery, setSelectedFilters } = useSearch();
  const {
    savedSearches,
    isSaving,
    saveSearch,
    deleteSearch,
    executeSearch,
    getRecentSearches,
    getPopularSearches,
    searchSavedSearches,
    getMySearches,
    getSharedWithMe,
    getDepartmentSearches
  } = useSavedSearches();

  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'shared', 'department', 'recent', 'popular'
  const [dropdownPosition, setDropdownPosition] = useState('left');

  // Close dropdown when clicking outside and handle positioning
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.saved-searches-container')) {
        setIsOpen(false);
      }
    };

    const updateDropdownPosition = () => {
      if (isOpen) {
        const container = document.querySelector('.saved-searches-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const dropdownWidth = 384; // w-96 = 384px
          
          // Check if dropdown would go off the right edge
          if (rect.left + dropdownWidth > viewportWidth - 20) {
            setDropdownPosition('right');
          } else {
            setDropdownPosition('left');
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateDropdownPosition);
    updateDropdownPosition();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  const handleExecuteSearch = async (savedSearch) => {
    const result = await executeSearch(savedSearch.id);
    if (result.success) {
      setSearchQuery(result.searchData.query);
      setSelectedFilters(result.searchData.filters);
      setIsOpen(false);
    }
  };

  const handleDeleteSearch = async (searchId, event) => {
    event.stopPropagation();
    
    const search = savedSearches.find(s => s.id === searchId);
    if (!search) return;
    
    if (search.userId !== currentUser.id) {
      alert('You can only delete your own searches');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      await deleteSearch(searchId);
    }
  };

  const getFilteredSearches = () => {
    let searches = [];
    
    switch (activeTab) {
      case 'my':
        searches = getMySearches();
        break;
      case 'shared':
        searches = getSharedWithMe();
        break;
      case 'department':
        searches = getDepartmentSearches();
        break;
      case 'recent':
        return getRecentSearches(10);
      case 'popular':
        return getPopularSearches(10);
      default:
        searches = savedSearches;
    }
    
    return searchSavedSearches(searchTerm).filter(search => 
      searches.some(s => s.id === search.id)
    );
  };

  const getFilterSummary = (filters) => {
    const parts = [];
    if (filters.source && filters.source.length > 0) {
      parts.push(`Sources: ${filters.source.join(', ')}`);
    }
    if (filters.contentType && filters.contentType.length > 0) {
      parts.push(`Types: ${filters.contentType.join(', ')}`);
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      parts.push(`Date: ${filters.dateRange}`);
    }
    return parts.join(' | ') || 'No filters';
  };

  return (
    <div className="relative saved-searches-container">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
          isOpen 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
        title="Saved Searches"
      >
        <Bookmark className="w-4 h-4" />
        <span className="text-sm font-medium">Saved</span>
        {savedSearches.length > 0 && (
          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
            {savedSearches.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden ${
          dropdownPosition === 'right' ? 'right-0' : 'left-0'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Saved Searches</h3>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!searchQuery.trim()}
                title={!searchQuery.trim() ? "Enter a search query first" : "Save current search"}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Save Current</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search saved searches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Tabs - Responsive Layout */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'my', label: 'My', fullLabel: 'My Searches', icon: Bookmark, count: getMySearches().length },
                  { id: 'shared', label: 'Shared', fullLabel: 'Shared with Me', icon: Users, count: getSharedWithMe().length },
                  { id: 'department', label: 'Dept', fullLabel: currentUser.department, icon: Building2, count: getDepartmentSearches().length },
                  { id: 'recent', label: 'Recent', fullLabel: 'Recent', icon: Clock },
                  { id: 'popular', label: 'Popular', fullLabel: 'Popular', icon: TrendingUp }
                ].map(({ id, label, fullLabel, icon: Icon, count }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                      activeTab === id 
                        ? 'bg-red-100 text-red-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={fullLabel}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="hidden sm:inline">{fullLabel}</span>
                    <span className="sm:hidden">{label}</span>
                    {count !== undefined && count > 0 && (
                      <span className="bg-gray-200 text-gray-600 px-1 rounded-full text-xs min-w-4 text-center">
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {getFilteredSearches().length > 0 ? (
              <div className="p-2">
                {getFilteredSearches().map((search) => (
                  <SavedSearchItem
                    key={search.id}
                    search={search}
                    onExecute={() => handleExecuteSearch(search)}
                    onDelete={(e) => handleDeleteSearch(search.id, e)}
                    getFilterSummary={getFilterSummary}
                    currentUserId={currentUser.id}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {searchTerm ? 'No matching saved searches' : 
                   activeTab === 'my' ? 'No saved searches yet' :
                   activeTab === 'shared' ? 'No searches shared with you' :
                   activeTab === 'department' ? `No ${currentUser.department} searches` :
                   'No searches found'}
                </p>
                <p className="text-xs mt-1">
                  {searchTerm ? 'Try a different search term' : 
                   activeTab === 'my' ? 'Save your first search to get started' :
                   'Check back later for shared searches'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <SaveSearchModal
          searchQuery={searchQuery}
          selectedFilters={selectedFilters}
          onSave={saveSearch}
          onClose={() => setShowSaveModal(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

const SavedSearchItem = ({ search, onExecute, onDelete, getFilterSummary, currentUserId }) => {
  const isOwned = search.userId === currentUserId;
  const getVisibilityIcon = () => {
    switch (search.visibility) {
      case 'public':
        return <Globe className="w-3 h-3 text-green-600" title="Public" />;
      case 'department':
        return <Building2 className="w-3 h-3 text-blue-600" title="Department" />;
      default:
        return <Lock className="w-3 h-3 text-gray-600" title="Private" />;
    }
  };

  return (
    <div className="group p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer">
      <div onClick={onExecute}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate flex-1">{search.name}</h4>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {getVisibilityIcon()}
                {search.isShared && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-center">
                    by {search.sharedBy}
                  </span>
                )}
              </div>
            </div>
            {search.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{search.description}</p>
            )}
            <p className="text-sm text-blue-600 mt-1 font-mono bg-blue-50 px-2 py-1 rounded truncate">
              "{search.query}"
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">{getFilterSummary(search.filters)}</p>
            
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
              <span className="whitespace-nowrap">Used {search.useCount} times</span>
              <span className="whitespace-nowrap">Last used: {new Date(search.lastUsed).toLocaleDateString()}</span>
              {search.tags && search.tags.length > 0 && (
                <span className="truncate">Tags: {search.tags.join(', ')}</span>
              )}
            </div>
            
            {search.userDepartment && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                Department: {search.userDepartment}
              </div>
            )}
          </div>
          
          {/* Only show delete button for owned searches */}
          {isOwned && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all flex-shrink-0 ml-2"
              title="Delete search"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SaveSearchModal = ({ searchQuery, selectedFilters, onSave, onClose, isSaving }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    
    const result = await onSave({
      name,
      description,
      query: searchQuery,
      filters: selectedFilters,
      visibility
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Save Search</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this search"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this search is for"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Private</div>
                    <div className="text-xs text-gray-500">Only visible to you</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  value="department"
                  checked={visibility === 'department'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Department</div>
                    <div className="text-xs text-gray-500">Visible to your department</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Public</div>
                    <div className="text-xs text-gray-500">Visible to everyone in the organization</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Search Details</h4>
            <p className="text-sm text-blue-600 font-mono bg-white px-2 py-1 rounded">
              "{searchQuery}"
            </p>
            {(selectedFilters.source?.length > 0 || selectedFilters.contentType?.length > 0 || selectedFilters.dateRange !== 'all') && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Filters: {
                  [
                    selectedFilters.source?.length > 0 ? `Sources: ${selectedFilters.source.join(', ')}` : null,
                    selectedFilters.contentType?.length > 0 ? `Types: ${selectedFilters.contentType.join(', ')}` : null,
                    selectedFilters.dateRange !== 'all' ? `Date: ${selectedFilters.dateRange}` : null
                  ].filter(Boolean).join(' | ') || 'None'
                }</p>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearchesDropdown;