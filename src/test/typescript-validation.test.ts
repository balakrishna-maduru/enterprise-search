// TypeScript Test File - src/test/typescript-validation.test.ts
import { describe, it, expect, test } from '@jest/globals';
import { User, SearchResult, SearchFilters, ApiResponse } from '../types';
import { availableUsers } from '../data/users';
import { mockResults } from '../data/mockData';

describe('TypeScript Type Validation', () => {
  test('User type validation', () => {
    const testUser: User = availableUsers[0];
    
    expect(testUser).toHaveProperty('id');
    expect(testUser).toHaveProperty('name');
    expect(testUser).toHaveProperty('email');
    expect(testUser).toHaveProperty('department');
    expect(testUser).toHaveProperty('position');
    expect(testUser).toHaveProperty('role');
    expect(testUser).toHaveProperty('company');
    expect(testUser).toHaveProperty('preferences');
    
    expect(typeof testUser.id).toBe('string');
    expect(typeof testUser.name).toBe('string');
    expect(typeof testUser.email).toBe('string');
    expect(['admin', 'manager', 'employee', 'executive']).toContain(testUser.role);
  });

  test('SearchResult type validation', () => {
    const testResult: SearchResult = mockResults[0];
    
    expect(testResult).toHaveProperty('id');
    expect(testResult).toHaveProperty('title');
    expect(testResult).toHaveProperty('content');
    expect(testResult).toHaveProperty('summary');
    expect(testResult).toHaveProperty('source');
    expect(testResult).toHaveProperty('author');
    expect(testResult).toHaveProperty('department');
    expect(testResult).toHaveProperty('content_type');
    expect(testResult).toHaveProperty('tags');
    expect(testResult).toHaveProperty('timestamp');
    expect(testResult).toHaveProperty('url');
    
    expect(typeof testResult.id).toBe('string');
    expect(typeof testResult.title).toBe('string');
    expect(Array.isArray(testResult.tags)).toBe(true);
  });

  test('SearchFilters type validation', () => {
    const testFilters: SearchFilters = {
      source: ['confluence', 'jira'],
      dateRange: 'last_month',
      contentType: ['document', 'ticket']
    };
    
    expect(Array.isArray(testFilters.source)).toBe(true);
    expect(typeof testFilters.dateRange).toBe('string');
    expect(Array.isArray(testFilters.contentType)).toBe(true);
  });

  test('ApiResponse type validation', () => {
    const successResponse: ApiResponse<User[]> = {
      success: true,
      data: availableUsers,
      message: 'Users fetched successfully'
    };
    
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch users'
    };
    
    expect(successResponse.success).toBe(true);
    expect(Array.isArray(successResponse.data)).toBe(true);
    expect(errorResponse.success).toBe(false);
    expect(typeof errorResponse.error).toBe('string');
  });

  test('Mock data integrity', () => {
    expect(mockResults.length).toBeGreaterThan(0);
    expect(availableUsers.length).toBeGreaterThan(0);
    
    // Ensure all mock results conform to SearchResult type
    mockResults.forEach((result: SearchResult) => {
      expect(typeof result.id).toBe('string');
      expect(typeof result.title).toBe('string');
      expect(typeof result.content).toBe('string');
      expect(Array.isArray(result.tags)).toBe(true);
    });
    
    // Ensure all users conform to User type
    availableUsers.forEach((user: User) => {
      expect(typeof user.id).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(['admin', 'manager', 'employee', 'executive']).toContain(user.role);
    });
  });
});

describe('TypeScript Utility Functions', () => {
  test('Type guards work correctly', () => {
    const isUser = (obj: any): obj is User => {
      return obj && 
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.role === 'string';
    };
    
    const testUser = availableUsers[0];
    const notUser = { id: 123, name: 'test' };
    
    expect(isUser(testUser)).toBe(true);
    expect(isUser(notUser)).toBe(false);
  });

  test('Generic ApiResponse works with different types', () => {
    const userResponse: ApiResponse<User> = {
      success: true,
      data: availableUsers[0]
    };
    
    const searchResponse: ApiResponse<SearchResult[]> = {
      success: true,
      data: mockResults
    };
    
    expect(userResponse.success).toBe(true);
    expect(searchResponse.success).toBe(true);
    expect(Array.isArray(searchResponse.data)).toBe(true);
  });
});

export {};
