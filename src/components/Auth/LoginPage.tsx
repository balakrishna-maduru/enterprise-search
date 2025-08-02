// src/components/Auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLogo from '../Common/CompanyLogo';
import { useEmployeeApi } from '../../hooks/useEmployeeApi';
import { formatEmployeesFromApi } from '../../utils/employeeFormatter';

interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location?: string;
  level?: number;
  phone?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchEmployees, loading, error } = useEmployeeApi();
  const [email, setEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [demoUsers, setDemoUsers] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('manager');

  // Fetch demo users from API on component mount
  useEffect(() => {
    fetchDemoUsers();
  }, []);

  // Fetch users when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchDemoUsers();
    }
  }, [searchQuery]);

  const fetchDemoUsers = async () => {
    try {
      const searchTerm = searchQuery.trim() || 'manager';
      const result = await searchEmployees(searchTerm, { size: 10 });
      
      // Use the formatter utility to ensure consistent data structure
      const users = formatEmployeesFromApi(result.employees);
      setDemoUsers(users);
    } catch (error) {
      console.error('Error fetching demo users:', error);
      
      // Fallback demo users
      setDemoUsers([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          title: 'Senior Manager',
          department: 'Engineering',
          location: 'New York',
          level: 3
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          title: 'Product Manager',
          department: 'Product',
          location: 'San Francisco',
          level: 3
        },
        {
          id: '3',
          name: 'Mike Chen',
          email: 'mike.chen@company.com',
          title: 'Software Engineer',
          department: 'Engineering',
          location: 'Seattle',
          level: 2
        }
      ]);
    }
  };

  const handleLogin = async () => {
    if (!selectedUser) return;

    try {
      // Store user data in localStorage
      localStorage.setItem('access_token', 'demo-token-' + selectedUser.id);
      localStorage.setItem('user', JSON.stringify(selectedUser));
      
      // Redirect to main app
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <CompanyLogo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Enterprise Search
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select a demo user to continue
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search for employees
              </label>
              <input
                id="search"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Search by name, department, or title"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter email or select from demo users"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loading ? 'Loading Users...' : 'Available Users'}
              </label>
              {error && (
                <div className="mb-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                {loading ? (
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  demoUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setEmail(user.email);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.title} • {user.department}</div>
                      {user.location && (
                        <div className="text-xs text-gray-400">📍 {user.location}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
