// src/components/SavedSearches/SaveSearchModal.js
import React, { useState } from 'react';
import { X, Save, Lock, Users, Tag } from 'lucide-react';
import { useUnifiedUser } from "../../hooks/useUnifiedUser";
import { useSavedSearches } from '../../hooks/useSavedSearches';

const SaveSearchModal = ({ onClose, searchQuery, searchFilters, onSaved }) => {
  const { currentUser, availableUsers } = useUnifiedUser();
  const { saveSearch, isLoading } = useSavedSearches();

  const [formData, setFormData] = useState({
    title: searchQuery ? `Search: ${searchQuery.substring(0, 30)}${searchQuery.length > 30 ? '...' : ''}` : '',
    description: '',
    isPrivate: false,
    sharedWith: [],
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const validationErrors = {};
    
    if (!formData.title.trim()) {
      validationErrors.title = 'Title is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const searchData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      query: searchQuery,
      filters: searchFilters,
      isPrivate: formData.isPrivate,
      sharedWith: formData.sharedWith,
      tags: formData.tags
    };

    const result = await saveSearch(searchData, currentUser);
    
    if (result.success) {
      onSaved?.(result.search);
      onClose();
    } else {
      setErrors({ general: result.error || 'Failed to save search' });
    }
  };

  const handleUserToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(userId)
        ? prev.sharedWith.filter(id => id !== userId)
        : [...prev.sharedWith, userId]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target.name === 'newTag') {
        handleAddTag();
      } else {
        handleSave();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Save className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Save Search</h3>
                <p className="text-sm text-gray-600">
                  Save this search to reuse later or share with colleagues
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Search Query</h4>
            <p className="text-gray-700 mb-3">"{searchQuery}"</p>
            
            {Object.keys(searchFilters).some(key => 
              Array.isArray(searchFilters[key]) ? searchFilters[key].length > 0 : searchFilters[key] !== 'all'
            ) && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Applied Filters:</h5>
                <div className="flex flex-wrap gap-2">
                  {searchFilters.source?.map(source => (
                    <span key={source} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Source: {source}
                    </span>
                  ))}
                  {searchFilters.contentType?.map(type => (
                    <span key={type} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Type: {type}
                    </span>
                  ))}
                  {searchFilters.dateRange && searchFilters.dateRange !== 'all' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Date: {searchFilters.dateRange}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter a descriptive title for this search"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add a description to help others understand what this search is for"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag (press Enter)"
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy & Sharing
              </label>
              
              <div className="space-y-3">
                {/* Private/Public Toggle */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                      formData.isPrivate 
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : 'bg-green-50 border-green-200 text-green-800'
                    }`}
                  >
                    {formData.isPrivate ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Private</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Department Visible</span>
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-600">
                    {formData.isPrivate 
                      ? 'Only you can see this search (unless specifically shared)'
                      : `Visible to colleagues in ${currentUser.department} department`
                    }
                  </p>
                </div>

                {/* Specific User Sharing */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Share with specific colleagues:</h4>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {availableUsers
                      .filter(user => user.id !== currentUser.id)
                      .map(user => (
                        <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.sharedWith.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                            {user.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-600">{user.position} • {user.department}</div>
                          </div>
                        </label>
                      ))
                    }
                  </div>
                  {formData.sharedWith.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      Sharing with {formData.sharedWith.length} colleague{formData.sharedWith.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !formData.title.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveSearchModal;