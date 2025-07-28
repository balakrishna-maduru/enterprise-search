// src/components/Analytics/RatingAnalytics.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ThumbsUp, ThumbsDown, Users, FileText } from 'lucide-react';
import { config } from '../../config';

const RatingAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    searchRatings: [],
    summaryRatings: [],
    ratingsBySource: [],
    ratingsByDepartment: [],
    totalRatings: 0,
    avgSatisfaction: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load search ratings from Elasticsearch
      const searchData = await loadSearchRatings();
      
      // Load summary ratings from localStorage
      const summaryData = loadSummaryRatings();
      
      // Process and combine data
      const processedData = processAnalyticsData(searchData, summaryData);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSearchRatings = async () => {
    try {
      const response = await fetch(
        `${config.elasticsearch.endpoint}/${config.elasticsearch.index}/_search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.elasticsearch.apiKey && { 'Authorization': `ApiKey ${config.elasticsearch.apiKey}` })
          },
          body: JSON.stringify({
            query: {
              exists: { field: 'ratings' }
            },
            size: 100,
            _source: ['title', 'source', 'ratings', 'user_ratings']
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.hits.hits.map(hit => hit._source);
      }
    } catch (error) {
      console.error('Error loading search ratings:', error);
    }
    return [];
  };

  const loadSummaryRatings = () => {
    try {
      const ratings = JSON.parse(localStorage.getItem('summary_ratings') || '[]');
      return ratings;
    } catch (error) {
      console.error('Error loading summary ratings:', error);
      return [];
    }
  };

  const processAnalyticsData = (searchData, summaryData) => {
    // Process search ratings by source
    const ratingsBySource = {};
    searchData.forEach(doc => {
      if (doc.ratings) {
        const source = doc.source || 'unknown';
        if (!ratingsBySource[source]) {
          ratingsBySource[source] = { positive: 0, negative: 0, total: 0 };
        }
        ratingsBySource[source].positive += doc.ratings.positive_count || 0;
        ratingsBySource[source].negative += doc.ratings.negative_count || 0;
        ratingsBySource[source].total += doc.ratings.total_ratings || 0;
      }
    });

    // Process summary ratings by department
    const ratingsByDepartment = {};
    summaryData.forEach(rating => {
      const dept = rating.user_department || 'unknown';
      if (!ratingsByDepartment[dept]) {
        ratingsByDepartment[dept] = { up: 0, down: 0, neutral: 0 };
      }
      ratingsByDepartment[dept][rating.rating]++;
    });

    // Calculate totals
    const totalSearchRatings = Object.values(ratingsBySource).reduce((sum, r) => sum + r.total, 0);
    const totalSummaryRatings = summaryData.length;
    const totalRatings = totalSearchRatings + totalSummaryRatings;

    // Calculate average satisfaction
    const totalPositive = Object.values(ratingsBySource).reduce((sum, r) => sum + r.positive, 0) +
                         summaryData.filter(r => r.rating === 'up').length;
    const avgSatisfaction = totalRatings > 0 ? (totalPositive / totalRatings) * 100 : 0;

    return {
      searchRatings: Object.entries(ratingsBySource).map(([source, data]) => ({
        source,
        ...data,
        satisfaction: data.total > 0 ? (data.positive / data.total) * 100 : 0
      })),
      summaryRatings: Object.entries(ratingsByDepartment).map(([department, data]) => ({
        department,
        ...data,
        total: data.up + data.down + data.neutral
      })),
      ratingsBySource: Object.entries(ratingsBySource).map(([name, data]) => ({
        name,
        value: data.total
      })),
      ratingsByDepartment: Object.entries(ratingsByDepartment).map(([name, data]) => ({
        name,
        value: data.up + data.down + data.neutral
      })),
      totalRatings,
      avgSatisfaction: Math.round(avgSatisfaction)
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalRatings}</div>
              <div className="text-sm text-gray-600">Total Ratings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.avgSatisfaction}%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.searchRatings.length}</div>
              <div className="text-sm text-gray-600">Rated Documents</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summaryRatings.length}</div>
              <div className="text-sm text-gray-600">Summary Ratings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Ratings by Source */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Ratings by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.searchRatings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="positive" fill="#10B981" name="Positive" />
              <Bar dataKey="negative" fill="#EF4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Ratings Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.ratingsByDepartment}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analyticsData.ratingsByDepartment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Ratings</h3>
          <div className="space-y-3">
            {analyticsData.searchRatings.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.source}</div>
                  <div className="text-sm text-gray-600">{item.total} total ratings</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {Math.round(item.satisfaction)}% satisfaction
                  </div>
                  <div className="text-xs text-gray-500">
                    👍 {item.positive} | 👎 {item.negative}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Ratings by Department */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Feedback</h3>
          <div className="space-y-3">
            {analyticsData.summaryRatings.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.department}</div>
                  <div className="text-sm text-gray-600">{item.total} ratings</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    👍 {item.up} | 👎 {item.down} | ➖ {item.neutral}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingAnalytics;