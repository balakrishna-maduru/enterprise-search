// src/hooks/useSavedSearches.js
import { useState, useEffect } from 'react';
import { useUnifiedUser } from "./useUnifiedUser";
import { getCurrentCompanyConfig } from '../config/branding';

export const useSavedSearches = () => {
  const { currentUser } = useUnifiedUser();
  const [savedSearches, setSavedSearches] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get company-specific localStorage keys
  const getStorageKey = (key) => {
    const config = getCurrentCompanyConfig();
    return `${config.company.shortName.toLowerCase()}_${key}`;
  };

  // Load saved searches for current user on mount and user change
  useEffect(() => {
    initializeDemoData();
    loadSavedSearches();
  }, [currentUser]);

  const initializeDemoData = () => {
    // Only initialize once per browser session
    if (localStorage.getItem(getStorageKey('demo_initialized'))) {
      return;
    }

    // Create demo data using actual user IDs from the system
    const demoData = {
      'mike_rodriguez': [
        {
          id: 'demo_1',
          name: 'Payment API Issues',
          description: 'Search for payment processing API errors and bugs',
          query: 'payment API error bug',
          filters: { 
            source: ['api-docs', 'jira'], 
            contentType: ['documentation', 'tickets'],
            dateRange: 'last-month'
          },
          createdAt: '2024-01-15T10:00:00Z',
          lastUsed: '2024-01-20T14:30:00Z',
          useCount: 15,
          userId: 'mike_rodriguez',
          userName: 'Mike Rodriguez',
          userDepartment: 'Engineering',
          userPosition: 'Lead Software Engineer',
          visibility: 'department',
          tags: ['payment', 'api', 'bug']
        },
        {
          id: 'demo_2',
          name: 'Security Compliance',
          description: 'Security and compliance related documents',
          query: 'security compliance audit',
          filters: { 
            source: ['confluence', 'sharepoint'], 
            contentType: ['documentation'],
            dateRange: 'last-quarter'
          },
          createdAt: '2024-01-10T09:00:00Z',
          lastUsed: '2024-01-18T11:15:00Z',
          useCount: 8,
          userId: 'mike_rodriguez',
          userName: 'Mike Rodriguez',
          userDepartment: 'Engineering',
          userPosition: 'Lead Software Engineer',
          visibility: 'public',
          tags: ['security', 'compliance']
        }
      ],
      'jennifer_tan': [
        {
          id: 'demo_3',
          name: 'Customer Onboarding',
          description: 'Documentation for customer onboarding process',
          query: 'customer onboarding process documentation',
          filters: { 
            source: ['confluence', 'notion'], 
            contentType: ['documentation', 'process'],
            dateRange: 'all'
          },
          createdAt: '2024-01-12T08:00:00Z',
          lastUsed: '2024-01-19T16:45:00Z',
          useCount: 12,
          userId: 'jennifer_tan',
          userName: 'Jennifer Tan',
          userDepartment: 'Operations',
          userPosition: 'VP Operations',
          visibility: 'public',
          tags: ['customer', 'onboarding']
        },
        {
          id: 'demo_4',
          name: 'Mobile App Issues',
          description: 'Bug reports and issues from mobile app',
          query: 'mobile app crash bug report',
          filters: { 
            source: ['jira', 'github'], 
            contentType: ['tickets', 'code'],
            dateRange: 'last-week'
          },
          createdAt: '2024-01-16T13:00:00Z',
          lastUsed: '2024-01-21T10:20:00Z',
          useCount: 6,
          userId: 'jennifer_tan',
          userName: 'Jennifer Tan',
          userDepartment: 'Operations',
          userPosition: 'VP Operations',
          visibility: 'department',
          tags: ['mobile', 'bug']
        }
      ],
      'david_wong': [
        {
          id: 'demo_5',
          name: 'Security Vulnerabilities',
          description: 'Search for security vulnerabilities and threats',
          query: 'security vulnerability threat assessment',
          filters: { 
            source: ['confluence', 'jira'], 
            contentType: ['documentation', 'tickets'],
            dateRange: 'last-month'
          },
          createdAt: '2024-01-14T09:00:00Z',
          lastUsed: '2024-01-22T10:30:00Z',
          useCount: 20,
          userId: 'david_wong',
          userName: 'David Wong',
          userDepartment: 'Information Security',
          userPosition: 'Security Architect',
          visibility: 'department',
          tags: ['security', 'vulnerability']
        }
      ]
    };

    // Add initial search for current user if they don't have demo data
    if (currentUser && !demoData[currentUser.id]) {
      demoData[currentUser.id] = [
        {
          id: `demo_${currentUser.id}_1`,
          name: 'My First Search',
          description: 'Demo search for the current user',
          query: 'database migration best practices',
          filters: { 
            source: ['confluence'], 
            contentType: ['documentation'],
            dateRange: 'all'
          },
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          useCount: 3,
          userId: currentUser.id,
          userName: currentUser.name,
          userDepartment: currentUser.department,
          userPosition: currentUser.position,
          visibility: 'private',
          tags: ['database', 'migration']
        }
      ];
    }

    localStorage.setItem(getStorageKey('saved_searches'), JSON.stringify(demoData));
    localStorage.setItem(getStorageKey('demo_initialized'), 'true');
  };

  const loadSavedSearches = () => {
    if (!currentUser) {
      setSavedSearches([]);
      return;
    }
    
    try {
      const allSavedSearches = JSON.parse(localStorage.getItem(getStorageKey('saved_searches')) || '{}');
      const userSearches = allSavedSearches[currentUser.id] || [];
      
      // Also load public searches from other users
      const publicSearches = getPublicSearches(allSavedSearches);
      
      // Combine user's private searches with public searches from others
      const combinedSearches = [
        ...userSearches,
        ...publicSearches.filter(search => search.userId !== currentUser.id)
      ];
      
      setSavedSearches(combinedSearches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
      setSavedSearches([]);
    }
  };

  const getPublicSearches = (allSearches) => {
    const publicSearches = [];
    
    Object.entries(allSearches).forEach(([userId, searches]) => {
      searches.forEach(search => {
        if (search.visibility === 'public' || 
            (search.visibility === 'department' && search.userDepartment === currentUser.department)) {
          publicSearches.push({
            ...search,
            isShared: true,
            sharedBy: search.userName || 'Unknown User'
          });
        }
      });
    });
    
    return publicSearches;
  };

  const getMySearches = () => {
    return savedSearches.filter(search => search.userId === currentUser.id);
  };

  const getSharedWithMe = () => {
    return savedSearches.filter(search => 
      search.userId !== currentUser.id && 
      (search.visibility === 'public' || 
       (search.visibility === 'department' && search.userDepartment === currentUser.department))
    );
  };

  const getDepartmentSearches = () => {
    return savedSearches.filter(search => 
      search.userDepartment === currentUser.department &&
      (search.visibility === 'department' || search.visibility === 'public')
    );
  };

  const saveSearch = async (searchData) => {
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsSaving(true);
    try {
      const { query, filters, name, description } = searchData;
      
      if (!query.trim()) {
        throw new Error('Search query cannot be empty');
      }

      if (!name.trim()) {
        throw new Error('Search name is required');
      }

      // Create new saved search object
      const savedSearch = {
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description?.trim() || '',
        query: query.trim(),
        filters: { ...filters },
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        useCount: 0,
        userId: currentUser.id,
        userName: currentUser.name,
        userDepartment: currentUser.department,
        userPosition: currentUser.position,
        isPublic: searchData.isPublic || false,
        visibility: searchData.visibility || 'private', // 'private', 'department', 'public'
        tags: extractTagsFromQuery(query)
      };

      // Load existing searches
      const allSavedSearches = JSON.parse(localStorage.getItem(getStorageKey('saved_searches')) || '{}');
      const userSearches = allSavedSearches[currentUser.id] || [];

      // Check for duplicate names
      if (userSearches.some(search => search.name.toLowerCase() === name.toLowerCase().trim())) {
        throw new Error('A search with this name already exists');
      }

      // Add new search
      const updatedUserSearches = [...userSearches, savedSearch];
      allSavedSearches[currentUser.id] = updatedUserSearches;

      // Save to localStorage
      localStorage.setItem(getStorageKey('saved_searches'), JSON.stringify(allSavedSearches));
      
      // Reload all searches to update shared searches
      loadSavedSearches();
      
      return { success: true, savedSearch };
    } catch (error) {
      console.error('Error saving search:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSearch = async (searchId) => {
    try {
      // Check if user owns this search
      const searchToDelete = savedSearches.find(s => s.id === searchId);
      if (!searchToDelete) {
        throw new Error('Search not found');
      }
      
      if (searchToDelete.userId !== currentUser.id) {
        throw new Error('You can only delete your own searches');
      }

      const allSavedSearches = JSON.parse(localStorage.getItem(getStorageKey('saved_searches')) || '{}');
      const userSearches = allSavedSearches[currentUser.id] || [];
      
      const updatedUserSearches = userSearches.filter(search => search.id !== searchId);
      allSavedSearches[currentUser.id] = updatedUserSearches;
      
      localStorage.setItem(getStorageKey('saved_searches'), JSON.stringify(allSavedSearches));
      
      // Reload all searches to update shared searches
      loadSavedSearches();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting search:', error);
      return { success: false, error: error.message };
    }
  };

  const updateSearch = async (searchId, updates) => {
    try {
      // Check if user owns this search
      const searchToUpdate = savedSearches.find(s => s.id === searchId);
      if (!searchToUpdate) {
        throw new Error('Search not found');
      }
      
      if (searchToUpdate.userId !== currentUser.id) {
        throw new Error('You can only update your own searches');
      }

      const allSavedSearches = JSON.parse(localStorage.getItem(getStorageKey('saved_searches')) || '{}');
      const userSearches = allSavedSearches[currentUser.id] || [];
      
      const searchIndex = userSearches.findIndex(search => search.id === searchId);
      if (searchIndex === -1) {
        throw new Error('Search not found');
      }

      // Update the search
      userSearches[searchIndex] = {
        ...userSearches[searchIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      allSavedSearches[currentUser.id] = userSearches;
      localStorage.setItem(getStorageKey('saved_searches'), JSON.stringify(allSavedSearches));
      
      // Reload all searches to update shared searches
      loadSavedSearches();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating search:', error);
      return { success: false, error: error.message };
    }
  };

  const executeSearch = async (searchId) => {
    try {
      const search = savedSearches.find(s => s.id === searchId);
      if (!search) {
        throw new Error('Search not found');
      }

      // Only update usage statistics if it's the user's own search
      if (search.userId === currentUser.id) {
        await updateSearch(searchId, {
          lastUsed: new Date().toISOString(),
          useCount: search.useCount + 1
        });
      } else {
        // For shared searches, just track that we used it (could be enhanced to track usage by others)
        console.log(`Executed shared search "${search.name}" by ${search.userName}`);
      }

      return { 
        success: true, 
        searchData: {
          query: search.query,
          filters: search.filters
        }
      };
    } catch (error) {
      console.error('Error executing search:', error);
      return { success: false, error: error.message };
    }
  };

  const getRecentSearches = (limit = 5) => {
    // Only return user's own searches for recent
    return getMySearches()
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, limit);
  };

  const getPopularSearches = (limit = 5) => {
    // Include both own and shared searches for popular
    return [...savedSearches]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  };

  const searchSavedSearches = (searchTerm) => {
    if (!searchTerm.trim()) return savedSearches;
    
    const term = searchTerm.toLowerCase();
    return savedSearches.filter(search => 
      search.name.toLowerCase().includes(term) ||
      search.description.toLowerCase().includes(term) ||
      search.query.toLowerCase().includes(term) ||
      search.tags.some(tag => tag.toLowerCase().includes(term))
    );
  };

  // Helper function to extract tags from query
  const extractTagsFromQuery = (query) => {
    const tags = [];
    const words = query.toLowerCase().split(/\s+/);
    
    // Add common banking/technical terms as tags
    const commonTerms = [
      'payment', 'api', 'bug', 'issue', 'security', 'compliance',
      'database', 'migration', 'customer', 'account', 'transaction',
      'mobile', 'web', 'infrastructure', 'performance', 'error'
    ];
    
    words.forEach(word => {
      if (commonTerms.includes(word) && !tags.includes(word)) {
        tags.push(word);
      }
    });
    
    return tags;
  };

  const clearDemoData = () => {
    localStorage.removeItem(getStorageKey('saved_searches'));
    localStorage.removeItem(getStorageKey('demo_initialized'));
    setSavedSearches([]);
  };

  return {
    savedSearches,
    isSaving,
    saveSearch,
    deleteSearch,
    updateSearch,
    executeSearch,
    getRecentSearches,
    getPopularSearches,
    searchSavedSearches,
    loadSavedSearches,
    getMySearches,
    getSharedWithMe,
    getDepartmentSearches,
    clearDemoData
  };
};