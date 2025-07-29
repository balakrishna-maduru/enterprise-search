// src/data/mockData.ts
import { SearchResult } from '../types';

export const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Q3 Product Roadmap Planning',
    summary: 'Comprehensive roadmap planning document outlining key product initiatives for Q3, including feature prioritization, resource allocation, and timeline dependencies.',
    source: 'confluence',
    url: 'https://confluence.company.com/spaces/PROD/pages/123456',
    author: 'Sarah Chen',
    department: 'Product',
    content_type: 'document',
    timestamp: '2024-06-15T00:00:00Z',
    tags: ['roadmap', 'planning', 'Q3', 'product'],
    score: 95,
    content: 'Detailed content about Q3 roadmap planning including key milestones, resource requirements, and stakeholder alignment strategies...'
  },
  {
    id: '2',
    title: 'API Integration Bug - Payment Gateway',
    summary: 'Critical bug affecting payment processing integration with third-party gateway. Issue causes transaction failures during peak hours.',
    source: 'jira',
    url: 'https://company.atlassian.net/browse/PAY-4521',
    author: 'Mike Rodriguez',
    department: 'Engineering',
    content_type: 'ticket',
    timestamp: '2024-06-18T00:00:00Z',
    tags: ['bug', 'payment', 'api', 'critical'],
    score: 88,
    content: 'Critical bug report detailing payment gateway integration issues during peak traffic periods...'
  },
  {
    id: '3',
    title: 'Customer Feedback Analysis Report',
    summary: 'Monthly analysis of customer feedback trends, highlighting key pain points and improvement opportunities across all product verticals.',
    source: 'sharepoint',
    url: 'https://sharepoint.company.com/sites/research/docs/feedback-analysis',
    author: 'Jennifer Tan',
    department: 'Research',
    content_type: 'report',
    timestamp: '2024-06-20T00:00:00Z',
    tags: ['customer', 'feedback', 'analysis', 'monthly'],
    score: 82,
    content: 'Comprehensive analysis of customer feedback data showing trends in user satisfaction and feature requests...'
  },
  {
    id: '4',
    title: 'Security Audit Findings - Q2 2024',
    summary: 'Quarterly security audit results identifying vulnerabilities, compliance status, and recommended remediation actions.',
    source: 'confluence',
    url: 'https://confluence.company.com/spaces/SEC/pages/789012',
    author: 'David Wong',
    department: 'Security',
    content_type: 'audit',
    timestamp: '2024-06-12T00:00:00Z',
    tags: ['security', 'audit', 'compliance', 'Q2'],
    score: 91,
    content: 'Detailed security audit findings covering infrastructure, application security, and compliance requirements...'
  },
  {
    id: '5',
    title: 'Marketing Campaign Performance - Mobile App Launch',
    summary: 'Performance metrics and analysis for the mobile app launch campaign, including user acquisition costs and conversion rates.',
    source: 'google-analytics',
    url: 'https://analytics.google.com/dashboard/mobile-campaign',
    author: 'Lisa Kumar',
    department: 'Marketing',
    content_type: 'analytics',
    timestamp: '2024-06-14T00:00:00Z',
    tags: ['marketing', 'mobile', 'campaign', 'analytics'],
    score: 79,
    content: 'Campaign performance data showing user acquisition metrics, conversion funnels, and ROI analysis...'
  }
];
