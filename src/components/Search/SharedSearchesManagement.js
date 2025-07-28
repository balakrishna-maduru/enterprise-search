// src/components/Search/SharedSearchesManagement.js
import React, { useState } from 'react';
import { 
  Users, 
  Globe, 
  Building2, 
  Lock, 
  Edit3, 
  Eye, 
  Trash2,
  Share2,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";

const SharedSearchesManagement = () => {
  const { currentUser } = useUnifiedUser();
  const {
    getMySearches,
    getSharedWithMe,
    getDepartmentSearches,
    updateSearch,
    deleteSearch,
    executeSearch
  } = useSavedSearches();

  const [activeView, setActiveView] = useState('my-public'); // 'my-public', 'shared-with-me', 'department'
  const [editingSearch, setEditingSearch] = useState(null);
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'private', 'department', 'public'

  const getMyPublicSearches = () => {
    return getMySearches().filter(search => 
      visibilityFilter === 'all' || search.visibility === visibilityFilter
    );
  };

  const handleVisibilityChange = async (searchId, newVisibility) => {
    const result = await updateSearch(searchId, { visibility: newVisibility });
    if (result.success) {
      setEditingSearch(null);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    if (window.confirm('Are you sure you want to delete this search? This will remove it for everyone who has access.')) {
      await deleteSearch(searchId);
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'department':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'department':
        return 'Department';
      default:
        return 'Private';
    }
  };

  const getVisibilityDescription = (visibility) => {
    switch (visibility) {
      case 'public':
        return 'Visible to everyone in the organization';
      case 'department':
        return 'Visible to your department only';
      default:
        return 'Only visible to you';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Shared Searches</h1>
        <p className="text-gray-600">Control the visibility and sharing of your saved searches</p>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'my-public', label: 'My Searches', icon: Edit3 },
          { id: 'shared-with-me', label: 'Shared with Me', icon: Users },
          { id: 'department', label: `${currentUser.department}`, icon: Building2 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeView === id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* My Searches View */}
      {activeView === 'my-public' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Searches</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Visibility</option>
                <option value="private">Private Only</option>
                <option value="department">Department Only</option>
                <option value="public">Public Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getMyPublicSearches().map((search) => (
              <SearchManagementCard
                key={search.id}
                search={search}
                isOwned={true}
                onVisibilityChange={handleVisibilityChange}
                onDelete={handleDeleteSearch}
                onExecute={executeSearch}
                editingSearch={editingSearch}
                setEditingSearch={setEditingSearch}
                getVisibilityIcon={getVisibilityIcon}
                getVisibilityLabel={getVisibilityLabel}
                getVisibilityDescription={getVisibilityDescription}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shared with Me View */}
      {activeView === 'shared-with-me' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Searches Shared with Me</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getSharedWithMe().map((search) => (
              <SearchManagementCard
                key={search.id}
                search={search}
                isOwned={false}
                onExecute={executeSearch}
                getVisibilityIcon={getVisibilityIcon}
                getVisibilityLabel={getVisibilityLabel}
                getVisibilityDescription={getVisibilityDescription}
              />
            ))}
          </div>
        </div>
      )}

      {/* Department View */}
      {activeView === 'department' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {currentUser.department} Department Searches
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getDepartmentSearches().map((search) => (
              <SearchManagementCard
                key={search.id}
                search={search}
                isOwned={search.userId === currentUser.id}
                onVisibilityChange={search.userId === currentUser.id ? handleVisibilityChange : undefined}
                onDelete={search.userId === currentUser.id ? handleDeleteSearch : undefined}
                onExecute={executeSearch}
                editingSearch={editingSearch}
                setEditingSearch={setEditingSearch}
                getVisibilityIcon={getVisibilityIcon}
                getVisibilityLabel={getVisibilityLabel}
                getVisibilityDescription={getVisibilityDescription}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchManagementCard = ({
  search,
  isOwned,
  onVisibilityChange,
  onDelete,
  onExecute,
  editingSearch,
  setEditingSearch,
  getVisibilityIcon,
  getVisibilityLabel,
  getVisibilityDescription
}) => {
  const [newVisibility, setNewVisibility] = useState(search.visibility);

  const handleSaveVisibility = () => {
    if (onVisibilityChange) {
      onVisibilityChange(search.id, newVisibility);
    }
  };

  const handleExecuteSearch = async () => {
    const result = await onExecute(search.id);
    if (result.success) {
      // Could show a success message or redirect
      console.log('Search executed successfully');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{search.name}</h3>
            {getVisibilityIcon(search.visibility)}
          </div>
          {search.description && (
            <p className="text-sm text-gray-600 mb-2">{search.description}</p>
          )}
          <p className="text-sm text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
            "{search.query}"
          </p>
        </div>

        {isOwned && (
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => setEditingSearch(editingSearch === search.id ? null : search.id)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit visibility"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(search.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete search"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Visibility Editor */}
      {editingSearch === search.id && isOwned && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Change Visibility</h4>
          <div className="space-y-2">
            {['private', 'department', 'public'].map((visibility) => (
              <label key={visibility} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`visibility-${search.id}`}
                  value={visibility}
                  checked={newVisibility === visibility}
                  onChange={(e) => setNewVisibility(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex items-center space-x-2">
                  {getVisibilityIcon(visibility)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getVisibilityLabel(visibility)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getVisibilityDescription(visibility)}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleSaveVisibility}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingSearch(null);
                setNewVisibility(search.visibility);
              }}
              className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center justify-between">
          <span>Visibility:</span>
          <div className="flex items-center space-x-1">
            {getVisibilityIcon(search.visibility)}
            <span>{getVisibilityLabel(search.visibility)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Created by:</span>
          <span>{search.userName || 'Unknown'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Department:</span>
          <span>{search.userDepartment}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Usage:</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>{search.useCount} times</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Last used:</span>
          <span>{new Date(search.lastUsed).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tags */}
      {search.tags && search.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {search.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleExecuteSearch}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Execute Search</span>
        </button>
        {!isOwned && (
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Shared search"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SharedSearchesManagement;