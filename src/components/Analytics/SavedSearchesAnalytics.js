// src/components/Analytics/SavedSearchesAnalytics.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bookmark, Users, TrendingUp, Search, Calendar, Globe, Building2, Lock } from 'lucide-react';

const SavedSearchesAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalSearches: 0,
    totalUsers: 0,
    averageUsage: 0,
    searchesByDepartment: [],
    popularSearches: [],
    usageOverTime: [],
    searchTags: [],
    visibilityDistribution: [],
    sharingStats: {
      privateCount: 0,
      departmentCount: 0,
      publicCount: 0
    },
    topSharedSearches: [],
    departmentCollaboration: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    try {
      const allSavedSearches = JSON.parse(localStorage.getItem('saved_searches') || '{}');
      const processedData = processSearchAnalytics(allSavedSearches);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading saved searches analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processSearchAnalytics = (searchesData) => {
    const allSearches = [];
    const userDepartments = new Set();
    
    // Flatten all searches from all users
    Object.entries(searchesData).forEach(([userId, searches]) => {
      searches.forEach(search => {
        allSearches.push(search);
        userDepartments.add(search.userDepartment);
      });
    });

    // Total statistics
    const totalSearches = allSearches.length;
    const totalUsers = Object.keys(searchesData).length;
    const totalUsage = allSearches.reduce((sum, search) => sum + search.useCount, 0);
    const averageUsage = totalSearches > 0 ? Math.round(totalUsage / totalSearches) : 0;

    // Visibility distribution
    const visibilityCount = {
      private: allSearches.filter(s => s.visibility === 'private' || !s.visibility).length,
      department: allSearches.filter(s => s.visibility === 'department').length,
      public: allSearches.filter(s => s.visibility === 'public').length
    };

    const visibilityDistribution = [
      { name: 'Private', value: visibilityCount.private, color: '#6B7280' },
      { name: 'Department', value: visibilityCount.department, color: '#3B82F6' },
      { name: 'Public', value: visibilityCount.public, color: '#10B981' }
    ].filter(item => item.value > 0);

    // Searches by department
    const departmentCounts = {};
    allSearches.forEach(search => {
      const dept = search.userDepartment || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const searchesByDepartment = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count,
      percentage: Math.round((count / totalSearches) * 100)
    }));

    // Popular searches (by usage count)
    const popularSearches = [...allSearches]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 10)
      .map(search => ({
        name: search.name,
        query: search.query,
        useCount: search.useCount,
        department: search.userDepartment,
        visibility: search.visibility || 'private',
        userName: search.userName
      }));

    // Top shared searches (public and department)
    const topSharedSearches = [...allSearches]
      .filter(search => search.visibility === 'public' || search.visibility === 'department')
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 8)
      .map(search => ({
        name: search.name,
        useCount: search.useCount,
        visibility: search.visibility,
        department: search.userDepartment,
        userName: search.userName,
        createdAt: search.createdAt
      }));

    // Department collaboration (how many searches are shared between departments)
    const departmentCollaboration = Array.from(userDepartments).map(dept => {
      const deptSearches = allSearches.filter(s => s.userDepartment === dept);
      const sharedByDept = deptSearches.filter(s => s.visibility === 'public' || s.visibility === 'department').length;
      const privateInDept = deptSearches.filter(s => s.visibility === 'private' || !s.visibility).length;
      
      return {
        department: dept,
        shared: sharedByDept,
        private: privateInDept,
        total: deptSearches.length,
        sharePercentage: deptSearches.length > 0 ? Math.round((sharedByDept / deptSearches.length) * 100) : 0
      };
    }).sort((a, b) => b.sharePercentage - a.sharePercentage);

    // Search tags analysis
    const tagCounts = {};
    allSearches.forEach(search => {
      if (search.tags && Array.isArray(search.tags)) {
        search.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const searchTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: Math.round((count / totalSearches) * 100)
      }));

    // Usage over time (group by creation date)
    const usageByDate = {};
    allSearches.forEach(search => {
      const date = new Date(search.createdAt).toDateString();
      usageByDate[date] = (usageByDate[date] || 0) + 1;
    });

    const usageOverTime = Object.entries(usageByDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-30) // Last 30 data points
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      }));

    return {
      totalSearches,
      totalUsers,
      averageUsage,
      searchesByDepartment,
      popularSearches,
      usageOverTime,
      searchTags,
      visibilityDistribution,
      sharingStats: visibilityCount,
      topSharedSearches,
      departmentCollaboration
    };
  };

  const COLORS = ['#DC2626', '#2563EB', '#059669', '#7C3AED', '#EA580C', '#0891B2', '#BE185D'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600">Loading saved searches analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Bookmark className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalSearches}</div>
              <div className="text-sm text-gray-600">Total Searches</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.sharingStats.publicCount}</div>
              <div className="text-sm text-gray-600">Public Searches</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.sharingStats.departmentCount}</div>
              <div className="text-sm text-gray-600">Department Shared</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Lock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.sharingStats.privateCount}</div>
              <div className="text-sm text-gray-600">Private Searches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Distribution and Department Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visibility Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibility Distribution</h3>
          {analyticsData.visibilityDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.visibilityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analyticsData.visibilityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Department Collaboration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Collaboration</h3>
          {analyticsData.departmentCollaboration.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.departmentCollaboration}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="department" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shared" fill="#10B981" name="Shared" />
                <Bar dataKey="private" fill="#6B7280" name="Private" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No collaboration data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Searches by Department */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Searches by Department</h3>
          {analyticsData.searchesByDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.searchesByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="department" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No department data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Usage Over Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Creation Over Time</h3>
          {analyticsData.usageOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.usageOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No usage data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Shared Searches */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Shared Searches</h3>
          {analyticsData.topSharedSearches.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.topSharedSearches.slice(0, 8).map((search, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-gray-900 truncate">{search.name}</div>
                      {search.visibility === 'public' ? (
                        <Globe className="w-3 h-3 text-green-600" title="Public" />
                      ) : (
                        <Building2 className="w-3 h-3 text-blue-600" title="Department" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{search.userName || 'Unknown'} • {search.department || 'Unknown'}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-lg font-semibold text-green-600">{search.useCount}</div>
                    <div className="text-xs text-gray-500">uses</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <Share className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No shared searches yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Popular Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Tags</h3>
          {analyticsData.searchTags.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.searchTags.slice(0, 8).map((tagData, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                      {tagData.tag}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{tagData.count}</div>
                    <div className="text-xs text-gray-500">{tagData.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No tags available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Collaboration Details */}
      {analyticsData.departmentCollaboration.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Sharing Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Department</th>
                  <th className="text-center py-2 font-medium text-gray-900">Total Searches</th>
                  <th className="text-center py-2 font-medium text-gray-900">Shared</th>
                  <th className="text-center py-2 font-medium text-gray-900">Private</th>
                  <th className="text-center py-2 font-medium text-gray-900">Sharing Rate</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.departmentCollaboration.map((dept, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{dept.department}</td>
                    <td className="py-3 text-center text-gray-600">{dept.total}</td>
                    <td className="py-3 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {dept.shared}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        {dept.private}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${dept.sharePercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900">
                          {dept.sharePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Popular Searches */}
      {analyticsData.popularSearches.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Searches (All Visibility)</h3>
          <div className="space-y-3">
            {analyticsData.popularSearches.slice(0, 10).map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-900 truncate">{search.name}</div>
                    {search.visibility === 'public' ? (
                      <Globe className="w-3 h-3 text-green-600" title="Public" />
                    ) : search.visibility === 'department' ? (
                      <Building2 className="w-3 h-3 text-blue-600" title="Department" />
                    ) : (
                      <Lock className="w-3 h-3 text-gray-600" title="Private" />
                    )}
                  </div>
                  <div className="text-sm text-blue-600 font-mono truncate">"{search.query}"</div>
                  <div className="text-xs text-gray-500">{search.userName || 'Unknown'} • {search.department || 'Unknown'}</div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-lg font-semibold text-green-600">{search.useCount}</div>
                  <div className="text-xs text-gray-500">uses</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analyticsData.totalSearches === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Searches Yet</h3>
          <p className="text-gray-500 mb-4">Start saving searches to see analytics and insights</p>
          <p className="text-sm text-gray-400">
            Analytics will show usage patterns, sharing statistics, and collaboration insights once users begin saving searches.
          </p>
        </div>
      )}
    </div>
  );
};